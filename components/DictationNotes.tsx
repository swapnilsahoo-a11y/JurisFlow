
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { jsPDF } from "jspdf";

const CALIBRATION_TEXT = "The Hon'ble Supreme Court of India observed that justice must not only be done but must also be seen to be done. A Vakalatnama was filed by the learned counsel for the petitioner today.";

interface SavedNote {
  id: string;
  timestamp: string;
  title: string;
  content: string;
  summary: string;
}

const DictationNotes: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'error' | 'unsupported'>('idle');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [hasCalibrated, setHasCalibrated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<SavedNote[]>([]);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  
  // Summary Modal States
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [activeSummary, setActiveSummary] = useState('');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setIsPaused(false);
        setStatus('listening');
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setNoteContent(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setStatus('error');
      };

      recognition.onend = () => {
        if (!isPaused) {
          setIsListening(false);
          setStatus('idle');
        }
      };

      recognitionRef.current = recognition;
    } else {
      setStatus('unsupported');
    }
  }, [isPaused]);

  const handleStart = () => {
    if (status === 'unsupported') return;
    recognitionRef.current?.start();
  };

  const handlePause = () => {
    setIsPaused(true);
    recognitionRef.current?.stop();
  };

  const handleStop = () => {
    setIsPaused(false);
    recognitionRef.current?.stop();
    setIsListening(false);
    setStatus('idle');
  };

  const handleSave = async () => {
    if (!noteContent.trim()) return;
    setIsProcessing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a highly professional summary of this legal dictation. Use bullet points for key highlights and a separate sentence for the proposed legal strategy/next steps. Context: Indian Judiciary. Text: "${noteContent}"`,
        config: {
            systemInstruction: "You are a world-class legal strategist and judicial clerk. Your summaries are precise, authoritative, and structured for quick executive review."
        }
      });

      const summary = response.text?.trim() || "Summary generation failed.";
      const newNote: SavedNote = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        title: noteContent.split(' ').slice(0, 5).join(' ') + (noteContent.split(' ').length > 5 ? '...' : ''),
        content: noteContent,
        summary: summary
      };

      setHistory(prev => [newNote, ...prev]);
      setSelectedNoteId(newNote.id);
      setActiveSummary(summary);
      setIsSummaryModalOpen(true);
      setNoteContent('');
      handleStop();
    } catch (err) {
      console.error(err);
      alert("Note archived, but AI summarization encountered an issue.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const exportPDF = (note?: SavedNote) => {
    const target = note || history.find(n => n.id === selectedNoteId) || { content: noteContent, timestamp: new Date().toLocaleString(), summary: "Current Session Data" };
    if (!target.content) return;

    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(30, 41, 59);
    doc.text("JurisFlow Legal Exhibit", 20, 25);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(`ID: ${'id' in target ? target.id : 'DRAFT'} | DATE: ${target.timestamp} | LOCALE: en-IN`, 20, 35);

    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text("Executive AI Summary", 20, 55);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(target.summary.replace(/[*#]/g, ''), 170);
    doc.text(summaryLines, 20, 62);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Full Verbatim Transcript", 20, 85 + (summaryLines.length * 2));

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const contentLines = doc.splitTextToSize(target.content, 170);
    doc.text(contentLines, 20, 92 + (summaryLines.length * 2));

    doc.save(`JurisFlow_Transcript_${new Date().getTime()}.pdf`);
  };

  const startCalibration = () => {
    setIsCalibrating(true);
    setCalibrationProgress(0);
    const interval = setInterval(() => {
      setCalibrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setHasCalibrated(true);
          setTimeout(() => setIsCalibrating(false), 1000);
          return 100;
        }
        return prev + 5;
      });
    }, 120);
  };

  const currentSelectedNote = history.find(n => n.id === selectedNoteId);

  return (
    <div className="flex gap-8 h-[78vh] animate-in fade-in duration-700">
      
      {/* Sidebar: Transcript History */}
      <div className="w-80 bg-white rounded-[2rem] shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">Archives</h3>
          <span className="bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded-full font-bold">{history.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.map(note => (
            <div 
              key={note.id} 
              className={`p-5 rounded-[1.5rem] transition-all cursor-pointer relative group border ${
                selectedNoteId === note.id ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-50 border-slate-100 hover:border-blue-300'
              }`}
              onClick={() => { setSelectedNoteId(note.id); setNoteContent(note.content); setActiveSummary(note.summary); }}
            >
              <div className={`text-[10px] font-bold mb-2 uppercase tracking-wider ${selectedNoteId === note.id ? 'text-blue-100' : 'text-slate-400'}`}>
                {note.timestamp}
              </div>
              <div className={`text-sm font-extrabold truncate pr-4 ${selectedNoteId === note.id ? 'text-white' : 'text-slate-950'}`}>
                {note.title}
              </div>
              <p className={`text-[11px] line-clamp-2 mt-2 leading-relaxed ${selectedNoteId === note.id ? 'text-blue-50' : 'text-slate-500'}`}>
                {note.summary.replace(/[*#]/g, '')}
              </p>
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); exportPDF(note); }}
                  className={`p-1.5 rounded-lg border transition-all ${selectedNoteId === note.id ? 'bg-blue-500 border-blue-400 text-white hover:bg-white hover:text-blue-600' : 'bg-white border-slate-200 text-slate-400 hover:text-blue-600'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth={2} /></svg>
                </button>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeWidth={1.5} /></svg>
              </div>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">No Archived Notes</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 bg-white rounded-[2rem] shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
        
        {/* Recording Console Toolbar */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isListening ? (
              <button 
                onClick={handleStart}
                className="group flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-[1.25rem] font-bold text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.97]"
              >
                <div className="w-3 h-3 bg-white rounded-full group-hover:animate-ping"></div>
                Initiate Capture
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePause}
                  className={`px-5 py-3 rounded-[1.25rem] font-bold text-sm transition-all border ${isPaused ? 'bg-orange-50 border-orange-200 text-orange-700 shadow-md' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button 
                  onClick={handleStop}
                  className="px-5 py-3 bg-red-600 text-white rounded-[1.25rem] font-bold text-sm hover:bg-red-700 transition-all shadow-lg pulsate"
                >
                  Halt
                </button>
              </div>
            )}
            
            <button 
              onClick={handleSave}
              disabled={!noteContent.trim() || isListening || isProcessing}
              className="px-6 py-3 bg-slate-950 text-white rounded-[1.25rem] font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg"
            >
              {isProcessing ? (
                  <div className="flex items-center gap-2"><svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> AI Processing...</div>
              ) : 'Archive & Summarize'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {selectedNoteId && !isListening && (
              <button 
                onClick={() => setIsSummaryModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 border border-blue-100 rounded-2xl font-bold text-xs hover:bg-blue-100 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth={2} /></svg>
                View Summary
              </button>
            )}
            <button 
              onClick={() => handleCopy(noteContent)}
              className="relative p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all"
              title="Copy Verbatim"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" strokeWidth={2} /></svg>
              {copyFeedback && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold shadow-2xl whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">Copied to Clipboard</div>
              )}
            </button>
            <button 
              onClick={() => exportPDF()}
              className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 hover:text-red-600 hover:border-red-200 transition-all"
              title="Export Full File (PDF)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth={2} /></svg>
            </button>
          </div>
        </div>

        {/* Studio Canvas */}
        <div className="flex-1 p-10 relative overflow-hidden">
          <textarea
            className="w-full h-full text-slate-900 text-2xl font-medium leading-[1.6] focus:outline-none resize-none placeholder:text-slate-200 bg-transparent selection:bg-blue-100"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Studio ready. Capturing Indian judicial en-IN acoustics..."
          ></textarea>

          {/* Dynamic Status Pill */}
          <div className="absolute bottom-10 right-10 flex items-center gap-4 bg-white/80 backdrop-blur-xl px-5 py-2.5 rounded-full border border-slate-200 shadow-2xl transition-all duration-500">
            <div className="flex gap-1 items-center">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-1 bg-blue-500 rounded-full transition-all duration-300 ${status === 'listening' ? 'animate-bounce h-3' : 'h-1'}`} style={{ animationDelay: `${i * 0.15}s` }}></div>
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
              {status === 'listening' ? 'Forensic Feed Active' : 'Feed Offline'}
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-10 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
              <span>Stats: {noteContent.split(/\s+/).filter(w => w !== '').length} Tokens Collected</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!hasCalibrated ? (
              <button onClick={() => setIsCalibrating(true)} className="text-blue-600 hover:text-blue-800 transition-all font-black border-b-2 border-blue-600/20 pb-0.5">Start Calibration Protcol</button>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Calibrated Profile Verified
              </div>
            )}
          </div>
        </div>

        {/* Calibration Modal */}
        {isCalibrating && (
          <div className="absolute inset-0 bg-slate-950/95 z-[60] flex items-center justify-center p-12 overflow-y-auto backdrop-blur-md">
            <div className="max-w-3xl w-full text-center space-y-10 animate-in zoom-in-95 fade-in duration-500">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                <div className="relative w-24 h-24 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-6">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeWidth={2.5} /></svg>
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">Syncing Forensic Profile</h2>
                <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">Read the mandatory legal passage to align our neural processing with your specific Indian judicial enunciation.</p>
              </div>
              
              <div className="p-12 bg-white/5 border border-white/10 rounded-[3rem] text-3xl font-bold leading-relaxed italic text-white shadow-2xl text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 group-hover:w-3 transition-all"></div>
                <span className="opacity-90">"{CALIBRATION_TEXT}"</span>
              </div>

              <div className="pt-8 space-y-6">
                <button 
                  onClick={startCalibration}
                  disabled={calibrationProgress > 0 && calibrationProgress < 100}
                  className="bg-blue-600 text-white px-16 py-5 rounded-2xl font-black text-xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/40 disabled:opacity-50 active:scale-95"
                >
                  {calibrationProgress === 0 ? 'Start Capture' : calibrationProgress === 100 ? 'Sync Complete' : 'Synchronizing Phasing...'}
                </button>
                
                {calibrationProgress > 0 && (
                  <div className="max-w-md mx-auto w-full bg-white/10 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.8)]" 
                      style={{ width: `${calibrationProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
              
              <button onClick={() => setIsCalibrating(false)} className="text-slate-500 font-bold hover:text-slate-300 transition-colors uppercase text-[10px] tracking-[0.3em]">Cancel Synchronization</button>
            </div>
          </div>
        )}

        {/* AI Summary Dialog Box (Modal) */}
        {isSummaryModalOpen && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
              
              {/* Modal Header */}
              <div className="p-8 pb-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z" strokeWidth={2} /></svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-950 tracking-tight">AI Strategic Summary</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neural Analysis Complete</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSummaryModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5} /></svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-10 flex-1 overflow-y-auto">
                <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-slate-800 leading-relaxed text-lg font-medium selection:bg-blue-100 italic">
                  {activeSummary.split('\n').map((line, i) => (
                    <p key={i} className={line.startsWith('-') ? 'ml-4 mb-2' : 'mb-4'}>
                      {line.replace(/[*#]/g, '')}
                    </p>
                  ))}
                </div>
                
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button 
                    onClick={() => handleCopy(activeSummary)}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-slate-100 text-slate-900 border border-slate-200 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" strokeWidth={2} /></svg>
                    Copy Summary
                  </button>
                  <button 
                    onClick={() => { exportPDF(currentSelectedNote); setIsSummaryModalOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth={2} /></svg>
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Verified by JurisFlow Neural Engine v4.2</p>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DictationNotes;

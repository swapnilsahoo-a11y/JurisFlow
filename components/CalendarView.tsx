
import React, { useState } from 'react';
import { Case, CourtLevel, CaseStage } from '../types';

interface CalendarViewProps {
  cases: Case[];
  onAddCase?: (newCase: Case) => void;
  onUpdateCase?: (updatedCase: Case) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ cases, onAddCase, onUpdateCase }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingCase, setEditingCase] = useState<Case | null>(null);

  const [formData, setFormData] = useState({
    caseName: '',
    clientName: '',
    caseNumber: '',
    courtLevel: CourtLevel.LOWER,
    effectiveCharges: '0',
    stage: CaseStage.FILING,
  });

  const daysInMonth = 31;
  const startOffset = 3; 
  const calendarDays = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = `2024-05-${day.toString().padStart(2, '0')}`;
    return cases.filter(c => c.courtDate === dateStr);
  };

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    const dateStr = `2024-05-${day.toString().padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setEditingCase(null);
    setFormData({
      caseName: '',
      clientName: '',
      caseNumber: '',
      courtLevel: CourtLevel.LOWER,
      effectiveCharges: '0',
      stage: CaseStage.FILING
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, event: Case) => {
    e.stopPropagation();
    setEditingCase(event);
    setSelectedDate(event.courtDate);
    setFormData({
      caseName: event.caseName,
      clientName: event.clientName,
      caseNumber: event.caseNumber,
      courtLevel: event.courtLevel,
      effectiveCharges: event.effectiveCharges.toString(),
      stage: event.stage
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const billing = Number(formData.effectiveCharges) || 0;

    if (editingCase) {
      const updated: Case = {
        ...editingCase,
        ...formData,
        effectiveCharges: billing,
        courtDate: selectedDate
      };
      onUpdateCase?.(updated);
    } else {
      const newCase: Case = {
        id: Math.random().toString(36).substr(2, 9),
        caseName: formData.caseName,
        clientName: formData.clientName,
        caseNumber: formData.caseNumber,
        effectiveCharges: billing,
        courtLevel: formData.courtLevel,
        stage: formData.stage,
        courtDate: selectedDate,
        nextDate: '',
      };
      onAddCase?.(newCase);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold text-[#1e3a8a] tracking-tight">May 2024</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Court Scheduler</p>
          </div>
          <div className="flex gap-2">
            <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-slate-400 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth={2.5} /></svg>
            </button>
            <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-slate-400 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={2.5} /></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-100">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[100px] md:auto-rows-[130px]">
          {calendarDays.map((day, idx) => {
            const events = getEventsForDay(day);
            const isToday = day === 15;
            return (
              <div 
                key={idx} 
                onClick={() => handleDayClick(day)}
                className={`border-r border-b border-slate-50 p-2 relative hover:bg-blue-50/20 cursor-cell ${day ? 'bg-white' : 'bg-slate-50/10'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] md:text-xs font-black ${isToday ? 'bg-blue-800 text-white w-6 h-6 flex items-center justify-center rounded-lg shadow-lg' : 'text-slate-400'}`}>
                    {day}
                  </span>
                </div>
                
                <div className="space-y-1 overflow-hidden">
                  {events.slice(0, 2).map(event => (
                    <div 
                      key={event.id}
                      onClick={(e) => handleEventClick(e, event)}
                      className="px-1.5 py-1 text-[8px] md:text-[9px] font-black bg-slate-900 text-white rounded md:rounded-lg truncate cursor-pointer hover:bg-blue-900 transition-all"
                    >
                      {event.caseName}
                    </div>
                  ))}
                  {events.length > 2 && <div className="text-[8px] text-blue-500 font-bold ml-1">+{events.length - 2}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-t-[2rem] md:rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-full md:slide-in-from-bottom-8 duration-500 max-h-[90vh] flex flex-col">
            <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-950 tracking-tight">
                {editingCase ? 'Modify Session' : 'New Court Date'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5} /></svg>
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="p-6 md:p-8 space-y-4 overflow-y-auto no-scrollbar">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
                <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm" value={formData.caseName} onChange={e => setFormData({...formData, caseName: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Client</label>
                  <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Case No.</label>
                  <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm" value={formData.caseNumber} onChange={e => setFormData({...formData, caseNumber: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Charges (₹)</label>
                  <input type="number" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm" value={formData.effectiveCharges} onChange={e => setFormData({...formData, effectiveCharges: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Stage</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value as CaseStage})}>
                    {Object.values(CaseStage).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Judiciary</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm" value={formData.courtLevel} onChange={e => setFormData({...formData, courtLevel: e.target.value as CourtLevel})}>
                    {Object.values(CourtLevel).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-[#1e3a8a] text-white font-black py-4 rounded-2xl hover:bg-blue-900 shadow-xl transition-all active:scale-[0.98] mt-4">
                {editingCase ? 'Synchronize Updates' : 'Schedule Session'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;

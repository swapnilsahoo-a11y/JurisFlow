
import React, { useState, useMemo } from 'react';
import { Case, CourtLevel, CaseStage } from '../types';

interface CaseManagementProps {
  cases: Case[];
  onAddCase: (newCase: Case) => void;
}

const CaseManagement: React.FC<CaseManagementProps> = ({ cases, onAddCase }) => {
  const [formData, setFormData] = useState({
    caseName: '',
    clientName: '',
    caseNumber: '',
    effectiveCharges: '',
    stage: CaseStage.FILING,
    courtLevel: CourtLevel.LOWER,
    courtDate: '',
    nextDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCase: Case = {
      id: Math.random().toString(36).substr(2, 9),
      caseName: formData.caseName,
      clientName: formData.clientName,
      caseNumber: formData.caseNumber,
      effectiveCharges: Number(formData.effectiveCharges) || 0,
      stage: formData.stage,
      courtLevel: formData.courtLevel,
      courtDate: formData.courtDate || new Date().toISOString().split('T')[0],
      nextDate: formData.nextDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
    onAddCase(newCase);
    setFormData({
      caseName: '',
      clientName: '',
      caseNumber: '',
      effectiveCharges: '',
      stage: CaseStage.FILING,
      courtLevel: CourtLevel.LOWER,
      courtDate: '',
      nextDate: ''
    });
  };

  // Explicitly typing groupedCases as Record<CourtLevel, Case[]> to ensure correct inference for Object.entries
  const groupedCases = useMemo<Record<CourtLevel, Case[]>>(() => {
    return {
      [CourtLevel.SUPREME]: cases.filter(c => c.courtLevel === CourtLevel.SUPREME),
      [CourtLevel.HIGH]: cases.filter(c => c.courtLevel === CourtLevel.HIGH),
      [CourtLevel.LOWER]: cases.filter(c => c.courtLevel === CourtLevel.LOWER),
    };
  }, [cases]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Registry Form */}
      <div className="w-full lg:w-96 shrink-0 sticky top-10">
        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Add New Registry Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Case Name</label>
              <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-800 focus:bg-white transition-all text-sm outline-none" value={formData.caseName} onChange={e => setFormData({...formData, caseName: e.target.value})} placeholder="Title of the file" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Client</label>
                <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Case No.</label>
                <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" value={formData.caseNumber} onChange={e => setFormData({...formData, caseNumber: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Charges (₹)</label>
                <input type="number" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" value={formData.effectiveCharges} onChange={e => setFormData({...formData, effectiveCharges: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Stage</label>
                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value as CaseStage})}>
                  {Object.values(CaseStage).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Judiciary Level</label>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" value={formData.courtLevel} onChange={e => setFormData({...formData, courtLevel: e.target.value as CourtLevel})}>
                {Object.values(CourtLevel).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <button type="submit" className="w-full bg-[#1e3a8a] text-white font-bold py-3.5 rounded-2xl hover:bg-blue-900 shadow-xl transition-all active:scale-[0.98] text-sm mt-4">
              Finalize Registry Entry
            </button>
          </form>
        </div>
      </div>

      {/* Grouped List */}
      <div className="flex-1 space-y-12">
        {Object.entries(groupedCases).map(([level, items]) => (
          /* Adding explicit type assertion to Case[] to resolve unknown type errors for .length and .map */
          (items as Case[]).length > 0 && (
            <section key={level} className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 whitespace-nowrap">{level}</h3>
                <div className="h-px bg-slate-200 w-full"></div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {(items as Case[]).map(c => (
                  <div key={c.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-300 transition-colors">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{c.caseName}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-slate-500">{c.clientName}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-xs font-bold text-blue-800">{c.caseNumber}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400">Current Stage</p>
                        <span className="inline-flex px-3 py-1 bg-slate-100 rounded-full text-[11px] font-bold text-slate-700">{c.stage}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400">Effective Fee</p>
                        <p className="text-sm font-black text-slate-900">₹{c.effectiveCharges.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        ))}
      </div>
    </div>
  );
};

export default CaseManagement;

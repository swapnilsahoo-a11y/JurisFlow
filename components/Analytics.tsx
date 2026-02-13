
import React from 'react';
import { Case } from '../types';

interface AnalyticsProps {
  cases: Case[];
}

const Analytics: React.FC<AnalyticsProps> = ({ cases }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h3 className="text-2xl font-black text-slate-950 tracking-tight">Account Bandwidth Gantt</h3>
          <p className="text-sm text-slate-500 font-medium">Timeline correlation & capacity utilization</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#1e3a8a] rounded-sm"></div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Timeline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-100 rounded-sm"></div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Bandwidth</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-[800px]">
          {/* Timeline X-Axis */}
          <div className="grid grid-cols-[200px_1fr] border-b border-slate-100 pb-4 mb-6">
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Client Name</div>
            <div className="grid grid-cols-12">
              {months.map(m => (
                <div key={m} className="text-center text-[10px] font-black text-slate-400">{m}</div>
              ))}
            </div>
          </div>

          {/* Gantt Rows */}
          <div className="space-y-6">
            {cases.map((c, i) => (
              <div key={c.id} className="grid grid-cols-[200px_1fr] items-center group">
                <div className="pr-4">
                  <p className="text-sm font-bold text-slate-900 truncate">{c.clientName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{c.caseNumber}</p>
                </div>
                <div className="relative h-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                  {/* Bandwidth Layer (Simulated) */}
                  <div className="absolute inset-0 bg-slate-100/50 flex">
                    <div className="h-full bg-slate-200/40" style={{ width: `${30 + (i * 15)}%`, marginLeft: `${10 + (i * 5)}%` }}></div>
                  </div>
                  
                  {/* Timeline Bar */}
                  <div 
                    className="absolute top-3 bottom-3 bg-[#1e3a8a] rounded-full shadow-lg cursor-pointer transition-all hover:brightness-125 flex items-center px-4"
                    style={{ 
                      left: `${15 + (i * 8)}%`, 
                      width: `${25 + (i * 10)}%` 
                    }}
                  >
                    <span className="text-[9px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      {c.stage} | ₹{c.effectiveCharges.toLocaleString()}
                    </span>

                    {/* Tooltip */}
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-all z-50 bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 pointer-events-none">
                      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-white/10 text-xs space-y-2">
                        <p className="font-black text-blue-400 uppercase tracking-widest text-[9px]">Account Summary</p>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Matter:</span>
                          <span className="font-bold">{c.caseName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Current Stage:</span>
                          <span className="font-bold">{c.stage}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                          <span className="text-slate-400">Total Fee:</span>
                          <span className="font-black text-blue-400">₹{c.effectiveCharges.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

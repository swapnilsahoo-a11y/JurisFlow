
import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-6">Advocate Profile</h3>
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-200">AS</div>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-800 underline">Change Avatar</button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">First Name</label>
                <input readOnly className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" value="Alexander" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Name</label>
                <input readOnly className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" value="Sterling" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bar Association ID</label>
              <input readOnly className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" value="IND-PB-2024-9981" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-6">Security & Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div>
              <p className="text-sm font-bold text-slate-900">Biometric Verification</p>
              <p className="text-xs text-slate-500">Require fingerprint for Dictation access</p>
            </div>
            <div className="w-10 h-6 bg-blue-600 rounded-full flex items-center px-1">
              <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div>
              <p className="text-sm font-bold text-slate-900">Automatic PDF Backup</p>
              <p className="text-xs text-slate-500">Auto-save transcripts to Document Vault</p>
            </div>
            <div className="w-10 h-6 bg-slate-200 rounded-full flex items-center px-1">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

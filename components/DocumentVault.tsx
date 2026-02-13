
import React, { useState, useEffect } from 'react';
import { VaultFile } from '../types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const TOTAL_STORAGE_LIMIT = 100 * 1024 * 1024; // 100MB

const DocumentVault: React.FC = () => {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('jurisflow_vault');
    if (saved) setFiles(JSON.parse(saved));
  }, []);

  const saveFiles = (newFiles: VaultFile[]) => {
    setFiles(newFiles);
    localStorage.setItem('jurisflow_vault', JSON.stringify(newFiles));
  };

  const totalUsed = files.reduce((acc, f) => acc + f.size, 0);
  const usagePercent = Math.min(100, (totalUsed / TOTAL_STORAGE_LIMIT) * 100);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("Individual exhibit cannot exceed 10MB.");
      return;
    }

    if (totalUsed + file.size > TOTAL_STORAGE_LIMIT) {
      alert("Enterprise storage quota reached.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const newFile: VaultFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toLocaleDateString(),
        data: event.target?.result as string
      };
      saveFiles([newFile, ...files]);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const deleteFile = (id: string) => {
    if (confirm("Permanently remove this legal exhibit?")) {
      saveFiles(files.filter(f => f.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Storage Visualizer */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-950 tracking-tight">Repository Capacity</h3>
            <p className="text-sm text-slate-500 font-medium">Secured litigation assets & file exhibits</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-[#1e3a8a]">{(totalUsed / (1024 * 1024)).toFixed(1)}MB</span>
            <span className="text-slate-400 font-bold ml-2">/ 100MB ALLOCATED</span>
          </div>
        </div>
        <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div 
            className={`h-full transition-all duration-1000 ${usagePercent > 80 ? 'bg-red-500' : 'bg-[#1e3a8a]'}`}
            style={{ width: `${usagePercent}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Zone */}
        <div className="lg:col-span-1">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer group">
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeWidth={2} /></svg>
              </div>
              <p className="text-sm font-bold text-slate-900">Upload Exhibit</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Max 10MB per file</p>
            </div>
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </div>

        {/* Repository Table */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Legal Assets</h4>
            <span className="text-[10px] font-bold text-slate-400">{files.length} ITEMS</span>
          </div>
          <div className="overflow-y-auto max-h-[400px] no-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                  <th className="px-8 py-4">File Reference</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {files.map(file => (
                  <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth={2} /></svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{file.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">{file.uploadDate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-500">{(file.size / 1024).toFixed(1)} KB</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                         <a href={file.data} download={file.name} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2} /></svg>
                         </a>
                         <button onClick={() => deleteFile(file.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={2} /></svg>
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentVault;

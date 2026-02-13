
import React from 'react';
import { Case, TabType } from '../types';
import CalendarView from './CalendarView';
import CaseManagement from './CaseManagement';
import DictationNotes from './DictationNotes';
import Analytics from './Analytics';
import DocumentVault from './DocumentVault';
import Settings from './Settings';

interface DashboardProps {
  activeTab: TabType;
  cases: Case[];
  onAddCase: (newCase: Case) => void;
  onUpdateCase: (updatedCase: Case) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ activeTab, cases, onAddCase, onUpdateCase }) => {
  // Added support for 'analytics' tab header information
  const getHeader = () => {
    switch(activeTab) {
      case 'dashboard': return { title: 'Practice Scheduler', subtitle: 'Court Dates & Judicial Milestones' };
      case 'analytics': return { title: 'Practice Insights', subtitle: 'Milestones & Bandwidth Correlation' };
      case 'cases': return { title: 'Case Registry', subtitle: 'Central Judicial Repository' };
      case 'vault': return { title: 'Exhibit Vault', subtitle: 'Secured Enterprise Repository' };
      case 'notes': return { title: 'Dictation Studio', subtitle: 'Neural Transcription & Summary' };
      case 'settings': return { title: 'Firm Config', subtitle: 'Security & Practice Preferences' };
    }
  };

  const header = getHeader();

  return (
    <div className="min-h-full pb-24 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 md:py-10">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1e3a8a] tracking-tight">{header?.title}</h1>
            <p className="text-slate-500 font-medium text-xs md:text-sm mt-0.5">{header?.subtitle}</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
              Firm Identity: IND-PB-2024
            </span>
          </div>
        </header>

        <div className="tab-transition">
          {/* CalendarView and Analytics are now split into separate tabs to match the sidebar menu */}
          {activeTab === 'dashboard' && (
            <CalendarView cases={cases} onAddCase={onAddCase} onUpdateCase={onUpdateCase} />
          )}
          {activeTab === 'analytics' && (
            <Analytics cases={cases} />
          )}
          {activeTab === 'cases' && <CaseManagement cases={cases} onAddCase={onAddCase} />}
          {activeTab === 'vault' && <DocumentVault />}
          {activeTab === 'notes' && <DictationNotes />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import { Case, TabType } from './types';
import { MOCK_CASES } from './constants';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const handleLogin = () => {
    setIsAuthenticated(true);
    setUser({ name: 'Alexander Sterling, Esq.', email: 'sterling@juris-flow.com' });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const addCase = (newCase: Case) => {
    setCases(prev => [newCase, ...prev]);
  };

  const updateCase = (updatedCase: Case) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        userName={user?.name || ''}
      />
      <main className="flex-1 overflow-y-auto">
        <Dashboard 
          activeTab={activeTab} 
          cases={cases} 
          onAddCase={addCase} 
          onUpdateCase={updateCase}
        />
      </main>
    </div>
  );
};

export default App;

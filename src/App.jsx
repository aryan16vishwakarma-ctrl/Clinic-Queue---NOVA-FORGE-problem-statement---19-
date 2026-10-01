import React, { useState, useEffect } from 'react';
import DashboardView from './components/DashboardView.jsx';
import DisplayView from './components/DisplayView.jsx';

function getViewFromLocation() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('view') === 'display') return 'display';
  if (window.location.hash.toLowerCase().includes('display')) return 'display';
  if (window.location.pathname.toLowerCase().includes('display')) return 'display';
  return 'dashboard';
}

export default function App() {
  const [currentView, setCurrentView] = useState(getViewFromLocation);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getViewFromLocation());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const toggleView = () => {
    const nextView = currentView === 'dashboard' ? 'display' : 'dashboard';
    setCurrentView(nextView);

    const newUrl = new URL(window.location.href);
    if (nextView === 'display') {
      newUrl.searchParams.set('view', 'display');
    } else {
      newUrl.searchParams.delete('view');
      if (newUrl.hash.includes('display')) newUrl.hash = '';
    }
    window.history.pushState({}, '', newUrl.toString());
  };

  return (
    <div className="carequeue-app">
      {currentView === 'display' ? (
        <DisplayView onToggleView={toggleView} />
      ) : (
        <DashboardView onToggleView={toggleView} />
      )}
    </div>
  );
}

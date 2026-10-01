import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './Header.jsx';
import MessageBanner from './MessageBanner.jsx';
import StatsBar from './StatsBar.jsx';
import NowServingCard from './NowServingCard.jsx';
import RegistrationForm from './RegistrationForm.jsx';
import QueueTable from './QueueTable.jsx';
import DemoControls from './DemoControls.jsx';
import { POLL_INTERVAL_MS } from '../config.js';
import {
  fetchQueue,
  registerPatient,
  callNextPatient,
  cancelPatient,
  seedDemoData,
  resetDemoData
} from '../api.js';

export default function DashboardView({ onToggleView }) {
  const [queueData, setQueueData] = useState({
    serving: null,
    nextToken: null,
    waiting: [],
    stats: {
      waitingCount: 0,
      servedToday: 0,
      cancelledToday: 0,
      emergenciesToday: 0
    }
  });

  const [message, setMessage] = useState(null);
  const [isCallingNext, setIsCallingNext] = useState(false);
  const isPollingRef = useRef(false);

  const showSuccess = useCallback((text) => {
    setMessage({ text, type: 'success', id: Date.now() });
  }, []);

  const showError = useCallback((text) => {
    setMessage({ text, type: 'error', id: Date.now() });
  }, []);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  const refreshQueue = useCallback(async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    try {
      const data = await fetchQueue();
      setQueueData(data);
    } catch (err) {
      showError(err.message);
    } finally {
      isPollingRef.current = false;
    }
  }, [showError]);

  // Start polling on mount
  useEffect(() => {
    refreshQueue();
    const interval = setInterval(refreshQueue, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshQueue]);

  const handleRegister = async (patientData) => {
    try {
      const result = await registerPatient(patientData);
      showSuccess(`Token ${result.token} issued to ${result.name}`);
      await refreshQueue();
      return result;
    } catch (err) {
      showError(err.message);
      throw err;
    }
  };

  const handleCallNext = async () => {
    setIsCallingNext(true);
    try {
      const result = await callNextPatient();
      if (result.message) {
        showSuccess(result.message);
      }
      await refreshQueue();
    } catch (err) {
      showError(err.message);
    } finally {
      setIsCallingNext(false);
    }
  };

  const handleCancelPatient = async (id) => {
    try {
      await cancelPatient(id);
      showSuccess('Patient registration was cancelled.');
      await refreshQueue();
    } catch (err) {
      showError(err.message);
      throw err;
    }
  };

  const handleSeedDemo = async () => {
    try {
      await seedDemoData();
      showSuccess('Demo queue data loaded with 5 sample patients.');
      await refreshQueue();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleResetDemo = async () => {
    try {
      await resetDemoData();
      showSuccess('Demo data reset successfully.');
      await refreshQueue();
    } catch (err) {
      showError(err.message);
    }
  };

  const hasWaiting = Array.isArray(queueData.waiting) && queueData.waiting.length > 0;

  return (
    <div className="dashboard-layout">
      <Header currentView="dashboard" onToggleView={onToggleView} />

      <MessageBanner message={message} onClear={clearMessage} />

      <StatsBar stats={queueData.stats} />

      <main className="dashboard-grid">
        <aside className="dashboard-sidebar">
          <NowServingCard
            serving={queueData.serving}
            hasWaiting={hasWaiting}
            isCallingNext={isCallingNext}
            onCallNext={handleCallNext}
          />

          <RegistrationForm onRegister={handleRegister} />
        </aside>

        <QueueTable
          waiting={queueData.waiting}
          onCancelPatient={handleCancelPatient}
        />
      </main>

      <DemoControls
        onSeedDemo={handleSeedDemo}
        onResetDemo={handleResetDemo}
      />
    </div>
  );
}

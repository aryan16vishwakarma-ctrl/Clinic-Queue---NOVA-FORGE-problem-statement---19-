import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { POLL_INTERVAL_MS, MAX_VISIBLE_NEXT_TOKENS, PRIORITY } from '../config.js';
import { fetchQueue } from '../api.js';

export default function DisplayView({ onToggleView }) {
  const [queueData, setQueueData] = useState({
    serving: null,
    nextToken: null,
    waiting: []
  });

  const [currentTime, setCurrentTime] = useState('');
  const [isPulsing, setIsPulsing] = useState(false);
  const previousTokenRef = useRef(null);
  const isInitialRunRef = useRef(true);
  const isPollingRef = useRef(false);

  // Live real-time clock
  useEffect(() => {
    function tick() {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    }

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // Polling queue data
  useEffect(() => {
    async function updateDisplay() {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const data = await fetchQueue();
        const currentToken = data.serving ? data.serving.token : null;

        // Check pulse trigger condition
        if (isInitialRunRef.current) {
          previousTokenRef.current = currentToken;
          isInitialRunRef.current = false;
        } else if (currentToken !== null && currentToken !== previousTokenRef.current) {
          setIsPulsing(true);
          setTimeout(() => setIsPulsing(false), 1200);
          previousTokenRef.current = currentToken;
        } else {
          previousTokenRef.current = currentToken;
        }

        setQueueData(data);
      } catch {
        // Waiting room screens must degrade gracefully without intrusive popups
      } finally {
        isPollingRef.current = false;
      }
    }

    updateDisplay();
    const interval = setInterval(updateDisplay, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const { serving, nextToken, waiting = [] } = queueData;
  const isServingEmergency = serving?.priority === PRIORITY.EMERGENCY;

  const nextPatient = waiting.find((p) => p.token === nextToken);
  const isNextEmergency = nextPatient?.priority === PRIORITY.EMERGENCY;

  const upcomingSlice = waiting.slice(0, MAX_VISIBLE_NEXT_TOKENS);

  return (
    <div className="display-body">
      <div className="display-container">
        <header className="display-header">
          <div className="display-brand">
            <svg
              className="display-brand-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <h1 className="display-brand-title">CareQueue</h1>
          </div>

          <div className="display-header-right">
            {onToggleView && (
              <motion.button
                type="button"
                className="display-back-link"
                onClick={onToggleView}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                ← Receptionist Dashboard
              </motion.button>
            )}
            <div id="display-clock" className="display-clock" aria-label="Current clinic time">
              {currentTime || '--:--:--'}
            </div>
          </div>
        </header>

        <main className="display-main">
          {/* Huge NOW SERVING token */}
          <motion.section
            id="serving-panel"
            className={`display-serving-panel ${isPulsing ? 'pulse-animation' : ''}`}
            aria-labelledby="heading-now-serving"
            animate={
              isPulsing
                ? {
                    scale: [1, 1.03, 1],
                    transition: { duration: 1.2, ease: [0.25, 1, 0.5, 1] }
                  }
                : {}
            }
          >
            <h2 id="heading-now-serving" className="display-label">Now Serving</h2>
            <div id="serving-container" aria-live="polite">
              <AnimatePresence mode="wait">
                {!serving ? (
                  <motion.div
                    key="idle"
                    className="display-idle-message"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    Waiting for the next patient
                  </motion.div>
                ) : (
                  <motion.div
                    key={serving.token}
                    className={`display-token-huge ${isServingEmergency ? 'token-emergency' : ''}`}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    #{serving.token}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* NEXT token panel */}
          <section className="display-next-panel" aria-labelledby="heading-next-token">
            <h2 id="heading-next-token" className="display-next-label">Next:</h2>
            <div id="next-container" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div
                  key={nextToken ?? 'none'}
                  className={`display-token-subhuge ${isNextEmergency ? 'token-emergency' : ''}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {nextToken != null ? `#${nextToken}` : '—'}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* Next 5 upcoming tokens row */}
          <section className="display-upcoming-section" aria-labelledby="heading-upcoming">
            <h2 id="heading-upcoming" className="display-upcoming-heading">Upcoming Tokens</h2>
            <div id="upcoming-tokens-container" className="display-upcoming-row" aria-live="polite">
              {upcomingSlice.length === 0 ? (
                <p className="upcoming-empty">No tokens currently waiting</p>
              ) : (
                <AnimatePresence initial={false}>
                  {upcomingSlice.map((patient) => {
                    const isEmergency = patient.priority === PRIORITY.EMERGENCY;
                    return (
                      <motion.div
                        key={patient.token}
                        className={`upcoming-token-card ${isEmergency ? 'is-emergency' : ''}`}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      >
                        <span className="upcoming-token-num">#{patient.token}</span>
                        <span className="upcoming-token-tag">
                          {isEmergency ? 'Emergency' : 'Normal'}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

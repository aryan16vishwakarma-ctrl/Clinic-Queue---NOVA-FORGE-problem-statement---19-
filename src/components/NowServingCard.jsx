import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRIORITY } from '../config.js';

export default function NowServingCard({ serving, hasWaiting, isCallingNext, onCallNext }) {
  const isEmergency = serving?.priority === PRIORITY.EMERGENCY;

  return (
    <section className="card now-serving-card" aria-labelledby="now-serving-heading">
      <div className="card-header">
        <h2 id="now-serving-heading" className="card-title">Now Serving</h2>
      </div>
      <div className="card-body">
        <div id="now-serving-container">
          <AnimatePresence mode="wait">
            {!serving ? (
              <motion.div
                key="placeholder"
                className="now-serving-placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="now-serving-token">—</div>
                <p>No patient being served</p>
              </motion.div>
            ) : (
              <motion.div
                key={serving.token}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              >
                <div className={`now-serving-token ${isEmergency ? 'emergency' : ''}`}>
                  #{serving.token}
                </div>
                <h3 className="now-serving-patient">{serving.name}</h3>
                <div className="now-serving-meta">
                  <span className={`badge ${isEmergency ? 'badge-emergency' : 'badge-normal'}`}>
                    {isEmergency ? 'Emergency' : 'Normal'}
                  </span>
                  <span>{serving.age} yrs</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="now-serving-actions">
          <motion.button
            type="button"
            id="btn-next-patient"
            className="btn btn-primary btn-large"
            disabled={!hasWaiting || isCallingNext}
            onClick={onCallNext}
            whileHover={!hasWaiting || isCallingNext ? {} : { scale: 1.02 }}
            whileTap={!hasWaiting || isCallingNext ? {} : { scale: 0.98 }}
          >
            {isCallingNext ? 'Calling Next...' : 'Next Patient'}
          </motion.button>
        </div>
      </div>
    </section>
  );
}

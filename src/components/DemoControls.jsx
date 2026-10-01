import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function DemoControls({ onSeedDemo, onResetDemo }) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await onSeedDemo();
    } finally {
      setIsSeeding(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all demo queue data? This cannot be undone.')) {
      return;
    }

    setIsResetting(true);
    try {
      await onResetDemo();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <footer className="app-footer">
      <div className="footer-credits">
        CareQueue Clinic Queue Management System
      </div>
      <div className="demo-controls">
        <motion.button
          type="button"
          id="btn-demo-seed"
          className="btn btn-secondary btn-demo"
          disabled={isSeeding || isResetting}
          onClick={handleSeed}
          whileHover={isSeeding ? {} : { scale: 1.03 }}
          whileTap={isSeeding ? {} : { scale: 0.97 }}
        >
          {isSeeding ? 'Loading...' : 'Load Demo Data'}
        </motion.button>
        <motion.button
          type="button"
          id="btn-demo-reset"
          className="btn btn-secondary btn-demo"
          disabled={isSeeding || isResetting}
          onClick={handleReset}
          whileHover={isResetting ? {} : { scale: 1.03 }}
          whileTap={isResetting ? {} : { scale: 0.97 }}
        >
          {isResetting ? 'Resetting...' : 'Reset Demo'}
        </motion.button>
      </div>
    </footer>
  );
}

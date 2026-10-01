import React from 'react';
import { motion } from 'framer-motion';

export default function Header({ currentView, onToggleView }) {
  return (
    <header className="app-header">
      <div className="brand-wrapper">
        <svg
          className="brand-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        <h1 className="brand-title">CareQueue</h1>
      </div>

      <div className="header-actions">
        <motion.button
          type="button"
          className="view-toggle-btn"
          onClick={onToggleView}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          aria-label={currentView === 'dashboard' ? 'Switch to waiting room display' : 'Switch to dashboard'}
        >
          {currentView === 'dashboard' ? 'Preview Display View' : 'Back to Dashboard'}
        </motion.button>

        <motion.a
          href="?view=display"
          target="_blank"
          rel="noopener noreferrer"
          className="link-display"
          id="link-public-display"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Open Waiting Area Display</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </motion.a>
      </div>
    </header>
  );
}

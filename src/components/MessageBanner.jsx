import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessageBanner({ message, onClear }) {
  useEffect(() => {
    if (!message || message.type !== 'success') return;

    const timer = setTimeout(() => {
      onClear();
    }, 6000);

    return () => clearTimeout(timer);
  }, [message, onClear]);

  return (
    <div id="message-banner" role="region" aria-label="Notifications">
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message.id || message.text}
            className={`banner banner-${message.type}`}
            role={message.type === 'error' ? 'alert' : 'status'}
            aria-live={message.type === 'error' ? 'assertive' : 'polite'}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
          >
            <span>{message.text}</span>
            <button
              type="button"
              onClick={onClear}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'inherit',
                fontSize: '1.25rem',
                lineHeight: 1,
                display: 'inline-flex',
                alignItems: 'center',
                opacity: 0.75
              }}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

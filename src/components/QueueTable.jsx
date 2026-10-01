import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRIORITY } from '../config.js';

export default function QueueTable({ waiting = [], onCancelPatient }) {
  const [cancellingIds, setCancellingIds] = useState(new Set());

  const handleCancelClick = async (patient) => {
    if (!window.confirm(`Cancel token #${patient.token} for ${patient.name}?`)) {
      return;
    }

    setCancellingIds((prev) => new Set(prev).add(patient.id));

    try {
      await onCancelPatient(patient.id);
    } finally {
      setCancellingIds((prev) => {
        const next = new Set(prev);
        next.delete(patient.id);
        return next;
      });
    }
  };

  const isEmpty = !waiting || waiting.length === 0;

  return (
    <section className="dashboard-content card" aria-labelledby="queue-heading">
      <div className="card-header">
        <h2 id="queue-heading" className="card-title">Waiting Queue</h2>
      </div>
      <div className="card-body">
        {!isEmpty ? (
          <div id="queue-table-wrapper" className="table-wrapper">
            <table className="queue-table">
              <thead>
                <tr>
                  <th scope="col">Pos</th>
                  <th scope="col">Token</th>
                  <th scope="col">Patient Name</th>
                  <th scope="col">Age</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Est. Wait</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody id="queue-tbody">
                <AnimatePresence initial={false}>
                  {waiting.map((patient) => {
                    const isEmergency = patient.priority === PRIORITY.EMERGENCY;
                    const isCancelling = cancellingIds.has(patient.id);

                    return (
                      <motion.tr
                        key={patient.id || patient.token}
                        className={isEmergency ? 'row-emergency' : ''}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      >
                        <td>{patient.position != null ? `#${patient.position}` : '—'}</td>
                        <td className={`token-cell ${isEmergency ? 'emergency' : ''}`}>
                          #{patient.token}
                        </td>
                        <td>{patient.name}</td>
                        <td>{patient.age}</td>
                        <td>
                          <span className={`badge ${isEmergency ? 'badge-emergency' : 'badge-normal'}`}>
                            {isEmergency ? 'Emergency' : 'Normal'}
                          </span>
                        </td>
                        <td>
                          {patient.estimatedWaitMinutes != null
                            ? `${patient.estimatedWaitMinutes} min`
                            : '—'}
                        </td>
                        <td>
                          <motion.button
                            type="button"
                            className="btn btn-danger"
                            disabled={isCancelling}
                            onClick={() => handleCancelClick(patient)}
                            whileHover={isCancelling ? {} : { scale: 1.04 }}
                            whileTap={isCancelling ? {} : { scale: 0.96 }}
                          >
                            {isCancelling ? 'Cancelling...' : 'Cancel'}
                          </motion.button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <motion.div
            id="empty-queue-state"
            className="empty-state"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <svg
              className="empty-state-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <h3 className="empty-state-title">No one is waiting right now</h3>
            <p className="empty-state-desc">
              Use the registration form on the left or seed demo data to populate the queue.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

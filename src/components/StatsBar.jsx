import React from 'react';
import { motion } from 'framer-motion';

export default function StatsBar({ stats = {} }) {
  const {
    waitingCount = 0,
    servedToday = 0,
    cancelledToday = 0,
    emergenciesToday = 0
  } = stats;

  const statItems = [
    { label: 'Waiting', value: waitingCount, id: 'stat-waiting', isEmergency: false },
    { label: 'Served Today', value: servedToday, id: 'stat-served', isEmergency: false },
    { label: 'Cancelled Today', value: cancelledToday, id: 'stat-cancelled', isEmergency: false },
    { label: 'Emergencies', value: emergenciesToday, id: 'stat-emergencies', isEmergency: true }
  ];

  return (
    <section className="stats-bar" aria-label="Clinic Statistics">
      {statItems.map((item, index) => (
        <motion.article
          key={item.label}
          className={`stat-card ${item.isEmergency ? 'stat-emergency' : ''}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.05 }}
          whileHover={{ y: -2 }}
        >
          <span className="stat-label">{item.label}</span>
          <motion.span
            id={item.id}
            className="stat-value"
            key={item.value}
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {item.value}
          </motion.span>
        </motion.article>
      ))}
    </section>
  );
}

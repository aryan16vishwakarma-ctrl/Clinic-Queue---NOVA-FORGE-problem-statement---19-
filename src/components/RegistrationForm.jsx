import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MAX_NAME_LENGTH, MIN_AGE, MAX_AGE, PRIORITY } from '../config.js';

function validateName(name) {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return "Please enter the patient's name";
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    return `Name must be ${MAX_NAME_LENGTH} characters or fewer`;
  }
  return null;
}

function validateAge(ageValue) {
  if (ageValue === '' || ageValue === null || ageValue === undefined) {
    return `Age must be a whole number between ${MIN_AGE} and ${MAX_AGE}`;
  }
  const num = Number(ageValue);
  if (!Number.isInteger(num) || num < MIN_AGE || num > MAX_AGE) {
    return `Age must be a whole number between ${MIN_AGE} and ${MAX_AGE}`;
  }
  return null;
}

export default function RegistrationForm({ onRegister }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [priority, setPriority] = useState(PRIORITY.NORMAL);
  const [errors, setErrors] = useState({ name: null, age: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameError = validateName(name);
    const ageError = validateAge(age);

    if (nameError || ageError) {
      setErrors({ name: nameError, age: ageError });
      return;
    }

    setErrors({ name: null, age: null });
    setIsSubmitting(true);

    try {
      await onRegister({
        name: name.trim(),
        age: parseInt(age, 10),
        priority
      });

      // Reset form fields and ensure priority resets explicitly to normal
      setName('');
      setAge('');
      setPriority(PRIORITY.NORMAL);
    } catch {
      // Error handling is handled upstream in onRegister
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card" aria-labelledby="register-heading">
      <div className="card-header">
        <h2 id="register-heading" className="card-title">Register Patient</h2>
      </div>
      <div className="card-body">
        <form id="registration-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="patient-name" className="form-label">Full Name</label>
            <input
              type="text"
              id="patient-name"
              name="name"
              className={`form-input ${errors.name ? 'has-error' : ''}`}
              placeholder="e.g. Asha Sharma"
              autoComplete="off"
              required
              maxLength={MAX_NAME_LENGTH}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
            />
            <span id="name-error" className="form-error" aria-live="polite">
              {errors.name || ''}
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="patient-age" className="form-label">Age (0 - 120)</label>
            <input
              type="number"
              id="patient-age"
              name="age"
              className={`form-input ${errors.age ? 'has-error' : ''}`}
              placeholder="e.g. 34"
              min={MIN_AGE}
              max={MAX_AGE}
              required
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                if (errors.age) setErrors((prev) => ({ ...prev, age: null }));
              }}
            />
            <span id="age-error" className="form-error" aria-live="polite">
              {errors.age || ''}
            </span>
          </div>

          <div className="form-group">
            <span className="form-label" id="priority-label">Priority Level</span>
            <div className="priority-toggle-group" role="radiogroup" aria-labelledby="priority-label">
              <label className={`priority-option ${priority === PRIORITY.NORMAL ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="priority"
                  value={PRIORITY.NORMAL}
                  checked={priority === PRIORITY.NORMAL}
                  onChange={() => setPriority(PRIORITY.NORMAL)}
                />
                <span>Normal</span>
              </label>

              <label className={`priority-option priority-emergency ${priority === PRIORITY.EMERGENCY ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="priority"
                  value={PRIORITY.EMERGENCY}
                  checked={priority === PRIORITY.EMERGENCY}
                  onChange={() => setPriority(PRIORITY.EMERGENCY)}
                />
                <span>Emergency</span>
              </label>
            </div>
          </div>

          <motion.button
            type="submit"
            id="btn-issue-token"
            className="btn btn-primary btn-large"
            disabled={isSubmitting}
            whileHover={isSubmitting ? {} : { scale: 1.02 }}
            whileTap={isSubmitting ? {} : { scale: 0.98 }}
          >
            {isSubmitting ? 'Issuing Token...' : 'Issue Token'}
          </motion.button>
        </form>
      </div>
    </section>
  );
}

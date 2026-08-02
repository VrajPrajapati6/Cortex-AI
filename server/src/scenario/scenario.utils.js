import crypto from 'crypto';

/**
 * Utility functions for Scenario Engine
 */

/**
 * Returns a random integer between min and max inclusive.
 */
export const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Returns a random float between min and max rounded to 2 decimal places.
 */
export const getRandomFloat = (min, max, decimals = 2) => {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
};

/**
 * Selects an item from an array using weighted probabilities.
 */
export const weightedSelect = (items, weights) => {
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    if (random < weights[i]) return items[i];
    random -= weights[i];
  }
  return items[0];
};

/**
 * Generates a standard cryptographic Request ID hash.
 */
export const generateRequestId = (counter = 1) => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const hexHash = crypto.randomBytes(2).toString('hex').toUpperCase();
  const reqNum = String(counter).padStart(6, '0');
  return `REQ-${dateStr}-${hexHash}-${reqNum}`;
};

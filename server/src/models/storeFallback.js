const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'quiz_store.json');

// In-memory memory structures
const store = {
  quizzes: new Map(),
  quiz_questions: new Map(),
  quiz_sessions: new Map(),
  quiz_participants: new Map(),
  quiz_answers: new Map(),
  quiz_events: new Map(),
};

function loadFromDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(content || '{}');
      for (const [table, rows] of Object.entries(parsed)) {
        if (store[table] && Array.isArray(rows)) {
          rows.forEach((r) => {
            if (r && r.id) {
              store[table].set(r.id, r);
            }
          });
        }
      }
    }
  } catch (err) {
    logger.warn('storeFallback init error (non-fatal):', err.message);
  }
}

function persist() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const serialized = {};
    for (const [table, map] of Object.entries(store)) {
      serialized[table] = Array.from(map.values());
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(serialized, null, 2), 'utf8');
  } catch (err) {
    logger.warn('storeFallback persist error:', err.message);
  }
}

// Initial load on startup
loadFromDisk();

module.exports = {
  store,
  persist,
  loadFromDisk,
};

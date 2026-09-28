const { HindsightClient } = require('@vectorize-io/hindsight-client');
const CustomerMemory = require('../models/CustomerMemory');

let hindsight = null;
if (process.env.HINDSIGHT_API_KEY && process.env.HINDSIGHT_BASE_URL) {
  try {
    hindsight = new HindsightClient({
      baseUrl: process.env.HINDSIGHT_BASE_URL,
      apiKey: process.env.HINDSIGHT_API_KEY,
    });
  } catch (err) {
    console.warn('[Hindsight] Client instantiation notice:', err.message);
  }
}

const BANK_ID = process.env.HINDSIGHT_BANK_ID || 'careconnect';
let remoteAvailable = null; // null = untried, true = operational, false = credit/network issue

/**
 * Initialize Hindsight memory bank
 */
async function initializeHindsight() {
  if (!process.env.HINDSIGHT_API_KEY || !BANK_ID) {
    console.log('[Hindsight] Remote Vectorize memory bank skipped (using persistent MongoDB memory store)');
    remoteAvailable = false;
    return;
  }

  try {
    if (hindsight) {
      await hindsight.createBank(BANK_ID, {
        name: 'CareConnect Memory',
        background:
          'Long-term memory for CareConnect home service customers, their service history, preferences, and previous issues.',
      });
      console.log(`[Hindsight] Remote memory bank connected: ${BANK_ID}`);
      remoteAvailable = true;
    }
  } catch (error) {
    const isCreditError = error.message && error.message.toLowerCase().includes('credit');
    remoteAvailable = false;
    if (isCreditError) {
      console.log(`[Hindsight] Remote Vectorize credit limit reached. Persistent MongoDB memory engine activated for bank: ${BANK_ID}`);
    } else {
      console.log(`[Hindsight] Remote init status: ${error.message}. MongoDB persistent memory engine ready.`);
    }
  }
}

/**
 * Store a memory in both MongoDB persistent store and remote Hindsight (if operational)
 */
async function retainMemory(content, metadata = {}) {
  const customerId = metadata.customerId || metadata.userId || 'system';

  let localDoc = null;
  try {
    // 1. Always persist in MongoDB so memory is never lost
    localDoc = await CustomerMemory.create({
      bankId: BANK_ID,
      customerId: String(customerId),
      content,
      metadata,
      source: remoteAvailable ? 'hindsight-remote' : 'mongodb-persistent',
    });
  } catch (dbErr) {
    console.warn('[Hindsight] MongoDB memory persist warning:', dbErr.message);
  }

  // 2. Also retain in remote Hindsight if available
  if (hindsight && remoteAvailable !== false) {
    try {
      const remoteRes = await hindsight.retain(BANK_ID, content, {
        metadata: {
          ...metadata,
          customerId: String(customerId),
        },
      });
      return remoteRes || localDoc;
    } catch (error) {
      const isCreditError = error.message && error.message.toLowerCase().includes('credit');
      if (isCreditError) {
        remoteAvailable = false;
        console.log('[Hindsight] Remote credit limit reached. Switched to MongoDB memory store.');
      } else {
        console.warn('[Hindsight] Remote retain notice:', error.message);
      }
    }
  }

  return localDoc;
}

/**
 * Recall memories matching the query and optional customerId
 */
async function recallMemories(query, customerId = null) {
  // 1. Try remote Hindsight if operational
  if (hindsight && remoteAvailable !== false) {
    try {
      const result = await hindsight.recall(BANK_ID, query, {
        limit: 5,
      });

      if (result && Array.isArray(result.results) && result.results.length > 0) {
        return result.results.map((r) => ({
          id: r.id || r._id,
          content: r.text || r.content || (typeof r === 'string' ? r : JSON.stringify(r)),
          text: r.text || r.content,
          metadata: r.metadata || {},
          score: r.score,
          source: 'vectorize',
        }));
      }
    } catch (error) {
      const isCreditError = error.message && error.message.toLowerCase().includes('credit');
      if (isCreditError) {
        remoteAvailable = false;
        console.log('[Hindsight] Remote credits exhausted. Serving memories from persistent MongoDB store.');
      } else {
        console.warn('[Hindsight] Remote recall notice:', error.message);
      }
    }
  }

  // 2. Fallback to local MongoDB memory store
  try {
    const filter = { bankId: BANK_ID };
    if (customerId) {
      filter.customerId = String(customerId);
    }

    // Keyword search based on query tokens
    if (query && typeof query === 'string') {
      const words = query
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 3)
        .slice(0, 5);

      if (words.length > 0) {
        const regexPatterns = words.map((w) => new RegExp(w, 'i'));
        filter.$or = [
          { content: { $in: regexPatterns } },
          ...(customerId ? [{ customerId: String(customerId) }] : []),
        ];
      }
    }

    const docs = await CustomerMemory.find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return docs.map((doc) => ({
      id: doc._id.toString(),
      content: doc.content,
      text: doc.content,
      metadata: doc.metadata || {},
      createdAt: doc.createdAt,
      source: 'mongodb-persistent',
    }));
  } catch (err) {
    console.warn('[Hindsight] MongoDB recall error:', err.message);
    return [];
  }
}

/**
 * Retrieve all recent memories for a specific customer
 */
async function getCustomerMemories(customerId, limit = 10) {
  try {
    return await CustomerMemory.find({ customerId: String(customerId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  } catch (err) {
    console.warn('[Hindsight] getCustomerMemories error:', err.message);
    return [];
  }
}

/**
 * Health check & status
 */
function getHindsightStatus() {
  return {
    bankId: BANK_ID,
    remoteConfigured: Boolean(process.env.HINDSIGHT_API_KEY),
    remoteAvailable: remoteAvailable === true,
    storage: remoteAvailable === true ? 'hybrid (Vectorize + MongoDB)' : 'MongoDB persistent memory store',
  };
}

module.exports = {
  initializeHindsight,
  retainMemory,
  recallMemories,
  getCustomerMemories,
  getHindsightStatus,
};
const { HindsightClient } = require('@vectorize-io/hindsight-client');

const hindsight = new HindsightClient({
  baseUrl: process.env.HINDSIGHT_BASE_URL,
  apiKey: process.env.HINDSIGHT_API_KEY
});

const BANK_ID = process.env.HINDSIGHT_BANK_ID;

// Create the CareConnect memory bank
async function initializeHindsight() {
  if (!process.env.HINDSIGHT_API_KEY || !BANK_ID) {
    console.log('Hindsight memory bank skipped (HINDSIGHT_API_KEY / HINDSIGHT_BANK_ID not configured)');
    return;
  }

  try {
    await hindsight.createBank(BANK_ID, {
      name: 'CareConnect Memory',
      background:
        'Long-term memory for CareConnect home service customers, their service history, preferences, and previous issues.'
    });

    console.log(`Hindsight memory bank ready: ${BANK_ID}`);
  } catch (error) {
    // If the bank already exists or returns a notice, log it without crashing server
    console.log(`Hindsight initialization status: ${error.message}`);
  }
}

// Store a memory
async function retainMemory(content, metadata = {}) {
  if (!process.env.HINDSIGHT_API_KEY || !BANK_ID) return null;

  try {
    return await hindsight.retain(BANK_ID, content, {
      metadata
    });
  } catch (error) {
    console.warn('Hindsight retain failed:', error.message);
    return null;
  }
}

// Recall relevant memories
async function recallMemories(query) {
  if (!process.env.HINDSIGHT_API_KEY || !BANK_ID) return [];

  try {
    const result = await hindsight.recall(BANK_ID, query, {
      limit: 5
    });

    return result.results || [];
  } catch (error) {
    console.warn('Hindsight recall failed:', error.message);
    return [];
  }
}

module.exports = {
  initializeHindsight,
  retainMemory,
  recallMemories
};
const config = require('../config');

const CATEGORY_KNOWLEDGE_BASE = [
  {
    name: 'Plumbing',
    icon: '🚰',
    keywords: [
      'tap', 'leak', 'pipe', 'plumbing', 'drain', 'sink', 'toilet', 'clog', 'water heater',
      'shower', 'faucet', 'bathroom', 'sewage', 'overflow', 'geyser', 'flush', 'blockage',
    ],
    skills: ['Leak Repair', 'Pipe Repair', 'Drain Unclogging', 'Fixture Installation'],
  },
  {
    name: 'Electrical',
    icon: '⚡',
    keywords: [
      'electric', 'electrical', 'wiring', 'switch', 'socket', 'circuit', 'fuse', 'short circuit',
      'power trip', 'light', 'fan', 'inverter', 'wire', 'breaker', 'shock', 'spark',
    ],
    skills: ['Wiring Repair', 'Switch & Socket Fix', 'Circuit Troubleshooting', 'Fixture Wiring'],
  },
  {
    name: 'Home Cleaning',
    icon: '🧹',
    keywords: [
      'clean', 'cleaning', 'dust', 'disinfect', 'vacuum', 'mopping', 'bathroom clean',
      'kitchen clean', 'deep clean', 'sofa cleaning', 'carpet cleaning', 'tidy',
    ],
    skills: ['Deep Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning', 'Carpet Care'],
  },
  {
    name: 'Appliance Repair',
    icon: '🔌',
    keywords: [
      'refrigerator', 'fridge', 'washing machine', 'dishwasher', 'microwave', 'oven',
      'appliance', 'dryer', 'geyser', 'cooler', 'iron', 'fault',
    ],
    skills: ['Refrigerator Repair', 'Washing Machine Repair', 'Microwave Repair', 'Diagnostics'],
  },
  {
    name: 'Carpentry',
    icon: '🪚',
    keywords: [
      'carpentry', 'wood', 'furniture repair', 'cabinet', 'door', 'hinge', 'drawer', 'shelf',
      'table', 'chair repair', 'wardrobe', 'drill', 'jamming door',
    ],
    skills: ['Furniture Repair', 'Cabinet Fixing', 'Door & Hinge Repair', 'Woodwork'],
  },
  {
    name: 'Painting',
    icon: '🎨',
    keywords: [
      'paint', 'painting', 'wall paint', 'repaint', 'plaster', 'roller', 'brush', 'color',
      'cracked wall', 'peeling paint', 'waterproofing', 'texture',
    ],
    skills: ['Interior Painting', 'Exterior Painting', 'Wall Preparation', 'Waterproofing'],
  },
  {
    name: 'AC Repair',
    icon: '❄️',
    keywords: [
      'ac', 'air conditioner', 'aircon', 'cooling', 'gas refill', 'filter', 'compressor',
      'cooling coil', 'condenser', 'ac install', 'air conditioning',
    ],
    skills: ['AC Service', 'Gas Refill', 'Compressor Repair', 'Filter Cleaning'],
  },
  {
    name: 'Home Maintenance',
    icon: '🛠️',
    keywords: [
      'maintenance', 'repair', 'fix', 'broken', 'maintenance worker', 'handyman', 'general repair',
      'leaking ceiling', 'cracked wall', 'tiling', 'grout', 'sealant', 'caulking',
    ],
    skills: ['General Repairs', 'Tiling', 'Sealant Work', 'Fixture Fixing'],
  },
];

const URGENCY_KEYWORDS = {
  High: ['urgent', 'immediate', 'emergency', 'asap', 'danger', 'leaking badly', 'safety', 'fire', 'flood', 'no power', 'no electricity'],
  Low: ['minor', 'cosmetic', 'not urgent', 'one day', 'someday', 'eventually', 'touch up'],
};

const DEFAULT_EXPECTED_FORMAT = {
  category: 'string',
  requiredSkills: ['string'],
  urgency: '"Low" | "Medium" | "High"',
  keywords: ['string'],
};

function normalize(text) {
  return (text || '').toLowerCase();
}

function heuristicClassify(text) {
  const input = normalize(text);

  const scored = CATEGORY_KNOWLEDGE_BASE.map((cat) => {
    let score = 0;
    for (const kw of cat.keywords) {
      if (input.includes(kw)) score += kw.length > 4 ? 2 : 1;
    }
    return { cat, score };
  }).filter((x) => x.score > 0);

  let best = null;
  if (scored.length > 0) {
    scored.sort((a, b) => b.score - a.score);
    best = scored[0].cat;
  } else {
    best = CATEGORY_KNOWLEDGE_BASE.find((c) => c.name === 'Home Maintenance');
  }

  let urgency = 'Medium';
  for (const [level, words] of Object.entries(URGENCY_KEYWORDS)) {
    if (words.some((w) => input.includes(w))) {
      urgency = level;
      break;
    }
  }

  const tokens = input
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 3);
  const keywords = Array.from(new Set(tokens)).slice(0, 8);
  const confidence = scored.length > 0 ? Math.min(0.95, 0.55 + scored[0].score * 0.08) : 0.4;

  return {
    category: best.name,
    categoryName: best.name,
    icon: best.icon,
    requiredSkills: best.skills,
    urgency,
    keywords,
    summary: `${best.name} service needed.`,
    confidence,
  };
}

async function classifyWithGemini(text) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(config.ai.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: config.ai.geminiModel });

  const prompt = `You are an expert home-services triage assistant.
Classify the following home service request. Reply ONLY with strict JSON matching this schema:
${JSON.stringify(DEFAULT_EXPECTED_FORMAT, null, 2)}

The "category" must be one of: ${CATEGORY_KNOWLEDGE_BASE.map((c) => `"${c.name}"`).join(', ')}.
Use concise skill names like: ${['Leak Repair', 'Pipe Repair', 'Drain Unclogging', 'Wiring Repair', 'Deep Cleaning', 'AC Service'].join(', ')}.

Customer request: "${text}"`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  const matched = CATEGORY_KNOWLEDGE_BASE.find(
    (c) => c.name.toLowerCase() === String(parsed.category || '').toLowerCase()
  );
  const categoryName = matched ? matched.name : parsed.category;

  return {
    category: categoryName,
    categoryName,
    icon: matched ? matched.icon : '🛠️',
    requiredSkills:
      Array.isArray(parsed.requiredSkills) && parsed.requiredSkills.length > 0
        ? parsed.requiredSkills.slice(0, 6)
        : heuristicClassify(text).requiredSkills,
    urgency: ['Low', 'Medium', 'High'].includes(parsed.urgency) ? parsed.urgency : 'Medium',
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 8) : [],
    summary:
      typeof parsed.summary === 'string' ? parsed.summary : `${categoryName} service needed.`,
    confidence: parsed.confidence && parsed.confidence <= 1 ? parsed.confidence : 0.9,
  };
}

const classifyRequest = async (text) => {
  if (config.ai.geminiApiKey) {
    try {
      const result = await classifyWithGemini(text);
      return { ...result, gateway: 'gemini', model: config.ai.geminiModel };
    } catch (error) {
      console.warn('Gemini classification failed, using heuristic fallback:', error.message);
    }
  }
  return { ...heuristicClassify(text), gateway: 'heuristic', model: 'local-keyword-engine' };
};

const checkAiHealth = () => ({
  configured: Boolean(config.ai.geminiApiKey),
  gateway: config.ai.geminiApiKey ? 'gemini' : 'heuristic',
  categories: CATEGORY_KNOWLEDGE_BASE.length,
});

module.exports = { classifyRequest, heuristicClassify, checkAiHealth, CATEGORY_KNOWLEDGE_BASE };
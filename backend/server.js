const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');
const connectDB = require('./config/db');
const routes = require('./routes');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');
const { checkAiHealth } = require('./services/aiService');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'CareConnect API',
    version: '1.0.0',
    ai: checkAiHealth(),
    health: '/api/health',
  });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

let server;
const start = async () => {
  await connectDB();
  server = app.listen(config.port, () => {
    console.log(`CareConnect server running on http://localhost:${config.port}`);
    console.log(`AI engine: ${config.ai.geminiApiKey ? 'Gemini' : 'heuristic (set GEMINI_API_KEY to enable Gemini)'}`);
  });
};

const shutdown = async () => {
  console.log('Shutting down gracefully...');
  if (server) server.close();
  process.exit(0);
};

if (require.main === module) {
  start();
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = { app, start };
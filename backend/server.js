const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const aiRoutes = require('./routes/aiRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(cors({
    origin: config.allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
}));

// Rate Limiting
const limiter = rateLimit(config.rateLimit);
app.use('/api/', limiter);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging Middleware (Development)
if (config.nodeEnv === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Routes
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'YoLearn.ai API Server',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            tutors: '/api/tutors',
            generate: 'POST /api/generate'
        }
    });
});

app.use('/api', aiRoutes);

// Error Handlers
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║     YoLearn.ai API Server Running        ║
║                                          ║
║     Port: ${PORT}                           ║
║     Environment: ${config.nodeEnv}         ║
║     API Key: ${config.geminiApiKey ? '✅ Configured' : '❌ Missing'}       ║
╚══════════════════════════════════════════╝
    `);
});

module.exports = app;

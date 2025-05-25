const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { createServer } = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const caseRoutes = require('./routes/case.routes');
const queryRoutes = require('./routes/query.routes');
const testRoutes = require('./routes/test.routes');

// Import middleware
const { errorHandler } = require('./middleware/error.middleware');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Set up Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MONGODB_URI not provided. Running without database connection.');
      return;
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // In development, continue without DB for testing
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development Mode: Continuing without database connection');
      console.log('💡 To fix this:');
      console.log('   1. Set up a local MongoDB instance, or');
      console.log('   2. Use a cloud MongoDB service like Atlas, or');
      console.log('   3. Update your MONGODB_URI in the .env file');
      return;
    }
    
    // In production, exit if DB connection fails
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Swagger configuration
const appConfig = {
  NAME: process.env.APP_NAME || 'JKKN PharmaED',
  VERSION: process.env.APP_VERSION || '1.0.0',
  DESCRIPTION: process.env.APP_DESCRIPTION || 'API for Pharmacy Student Management System',
};

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: `${appConfig.NAME} API`,
      version: appConfig.VERSION,
      description: appConfig.DESCRIPTION,
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(passport.initialize());

// Initialize passport config
require('./config/passport')(passport);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/tests', testRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health check route (available in all environments)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Serve static files from the React app build directory in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../../client/build');
  app.use(express.static(buildPath));
  
  // Catch all handler: send back React's index.html file for any non-API routes
  // This must be AFTER all other routes to avoid intercepting them
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, httpServer }; 
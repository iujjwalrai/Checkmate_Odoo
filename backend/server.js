const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const answerRoutes = require('./routes/answers');
const userRoutes = require('./routes/users');
// const tagRoutes = require('./routes/tags');
const notificationRoutes = require('./routes/notifications');
// const uploadRoutes = require('./routes/upload');

const app = express();
// app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));
// app.use(morgan('combined'));

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, 
//   max: 100, 
//   message: 'Too many requests from this IP'
// });

// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, 
//   max: 5,
//   message: 'Too many authentication attempts'
// });

// app.use('/api/auth', authLimiter);
// app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/tags', tagRoutes);
app.use('/api/notifications', notificationRoutes);
// app.use('/api/upload', uploadRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
const PORT = process.env.PORT || 4000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
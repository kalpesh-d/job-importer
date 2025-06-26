require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { Queue, Worker, RedisConnection } = require('bullmq');
const Redis = require('ioredis');

const connectDB = require('./config/db');
const { startImportProcess } = require('./services/producer');
const { processJob } = require('./services/worker');
const { getImportHistory, triggerManualImport } = require('./controller/importController');
const { default: mongoose } = require('mongoose');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

if (!process.env.REDIS_URL) throw new Error('REDIS_URL is not defined in the .env file');

const redisConnection = new Redis(process.env.REDIS_URL, {
  enableOfflineQueue: false,
  maxRetriesPerRequest: null,
  connectionPool: true
});
const jobQueue = new Queue('job-importer-queue', { connection: redisConnection });

const concurrency = process.env.WORKER_CONCURRENCY || 5;
const worker = new Worker('job-importer-queue', processJob, {
  connection: redisConnection,
  concurrency: parseInt(concurrency)
});

worker.on('failed', (job, err) => console.error(`[Worker] Job ${job.id} failed with error: ${err.message}`));

app.get('/api/imports/history', getImportHistory);
app.post('/api/imports/trigger', async (req, res) => await triggerManualImport(req, res, jobQueue));
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    db: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    redis: RedisConnection.status === 'ready' ? 'CONNECTED' : 'DISCONNECTED'
  });
});

cron.schedule('0 * * * *', () => {
  console.log('🕒 Cron job triggered: Starting hourly job import.');
  startImportProcess(jobQueue);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🕒 Cron job scheduled to run every hour.');
});

const shutdown = async () => {
  console.log('\n🧹 Cleaning up...');

  try {
    await jobQueue.close();      // Close BullMQ queue
    await worker.close();        // Stop the worker
    await redisConnection.quit(); // Close Redis connection

    console.log('✅ Redis & Worker connections closed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { Queue, Worker } = require('bullmq');
const mongoose = require('mongoose');
const IORedis = require('ioredis');
require('dotenv').config();

const connectDB = require('./config/db.js');
const { startImportProcess } = require('./services/producer.js');
const { processJob } = require('./services/worker.js');
const { getImportHistory, triggerManualImport } = require('./controller/importController.js');
const { client: redisClient, connectRedis } = require('./redisClient.js');

const app = express();

async function init() {
  await connectDB();
  await connectRedis();

  app.use(cors());
  app.use(express.json());

  const redisConnection = new IORedis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
  });

  const jobQueue = new Queue('job-importer-queue', {
    connection: redisConnection
  });

  const concurrency = parseInt(process.env.WORKER_CONCURRENCY || '5', 10);
  const worker = new Worker('job-importer-queue', processJob, {
    connection: redisConnection,
    concurrency
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] ❌ Job ${job.id} failed: ${err.message}`);
  });

  worker.on('completed', (job) => {
    console.log(`[Worker] ✅ Job ${job.id} completed.`);
  });

  app.get('/api/imports/history', getImportHistory);
  app.post('/api/imports/trigger', (req, res) => triggerManualImport(req, res, jobQueue));
  app.get('/health', async (req, res) => {
    const redisStatus = redisClient.isOpen ? 'CONNECTED' : 'DISCONNECTED';
    res.status(200).json({
      status: 'UP',
      db: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
      redis: redisStatus
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
}

init().catch((err) => {
  console.error('❌ Server initialization failed:', err);
});

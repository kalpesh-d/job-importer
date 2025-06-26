import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { Queue, Worker } from 'bullmq';
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import { startImportProcess } from './services/producer.js';
import { processJob } from './services/worker.js';
import { getImportHistory, triggerManualImport } from './controller/importController.js';
import redisClient, { connectRedis } from './redisClient.js';

const app = express();
await connectDB();
await connectRedis();

app.use(cors());
app.use(express.json());

const redisConnection = redisClient.duplicate(); // create a new connection for BullMQ
await redisConnection.connect();

const jobQueue = new Queue('job-importer-queue', { connection: redisConnection });

const concurrency = parseInt(process.env.WORKER_CONCURRENCY || '5', 10);
const worker = new Worker('job-importer-queue', processJob, {
  connection: redisConnection,
  concurrency
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.id} failed: ${err.message}`);
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
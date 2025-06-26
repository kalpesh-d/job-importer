const mongoose = require('mongoose');

const FailedJobSchema = new mongoose.Schema({
  jobId: { type: String },
  reason: { type: String }
}, { _id: false });

const ImportLogSchema = new mongoose.Schema({
  fileName: { type: String, required: true, index: true },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  totalFetched: { type: Number, default: 0 },
  newJobs: { type: Number, default: 0 },
  updatedJobs: { type: Number, default: 0 },
  totalImported: { type: Number, default: 0 },
  failedJobs: { type: Number, default: 0 },

  failedJobDetails: [FailedJobSchema],
  errorMessage: { type: String },
  endTime: { type: Date },

}, { timestamps: true });

module.exports = mongoose.model('ImportLog', ImportLogSchema);
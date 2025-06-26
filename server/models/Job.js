const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true, trim: true, },
  title: { type: String, required: true, trim: true },
  link: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  company: { type: String, trim: true, default: 'N/A' },
  location: { type: String, trim: true, default: 'Remote' },
  category: { type: String, trim: true },
  jobType: { type: String, trim: true },
  pubDate: { type: Date },
  sourceApi: { type: String, required: true },
}, { timestamps: true });

JobSchema.index({ jobId: 1, sourceApi: 1 });

module.exports = mongoose.model('Job', JobSchema);
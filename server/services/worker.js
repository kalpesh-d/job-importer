const Job = require('../models/Job');
const ImportLog = require('../models/ImportLog');
const { createHash } = require('crypto');

const processJob = async (jobData) => {
  const { job: item, logId, sourceApi } = jobData.data;

  const jobId = createHash('sha256')
    .update(`${sourceApi}-${item.title}-${item.company}-${item.location}`)
    .digest('hex');

  if (!jobId) {
    throw new Error('Job item is missing a unique identifier');
  }

  const jobPayload = {
    jobId: jobId,
    title: item.title,
    link: item.link,
    pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
    description: item.description,
    company: item['job:company'] || 'N/A',
    location: item['job:location'] || 'Remote',
    category: Array.isArray(item.category) ? item.category.join(', ') : item.category,
    jobType: item['job:job_type'] || 'N/A',
    sourceApi: sourceApi
  };

  try {
    const result = await Job.findOneAndUpdate(
      { jobId: jobPayload.jobId },
      { $set: jobPayload },
      { upsert: true, new: true, runValidators: true }
    );

    const wasUpdated = result.createdAt.getTime() !== result.updatedAt.getTime();
    const updateField = wasUpdated ? 'updatedJobs' : 'newJobs';

    await ImportLog.updateOne({ _id: logId }, { $inc: { [updateField]: 1 } });

  } catch (error) {
    await ImportLog.updateOne(
      { _id: logId },
      {
        $inc: { failedJobs: 1 },
        $push: {
          failedJobDetails: {
            jobId: jobPayload.jobId,
            reason: error.message
          }
        }
      }
    );
    throw error;
  } finally {
    const currentLog = await ImportLog.findById(logId);

    if (currentLog) {
      const totalProcessed = currentLog.newJobs + currentLog.updatedJobs + currentLog.failedJobs;

      if (totalProcessed >= currentLog.totalFetched) {
        await ImportLog.updateOne(
          { _id: logId },
          {
            $set: {
              status: 'completed',
              endTime: new Date(),
              totalImported: currentLog.newJobs + currentLog.updatedJobs
            }
          }
        );

        console.log(`[Worker] 🚀 Import process for feed "${currentLog.fileName}" is fully completed.`);
      }
    }
  }

};

module.exports = { processJob };

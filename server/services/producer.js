const axios = require('axios');
const parseXML = require('./xmlParser');
const ImportLog = require('../models/ImportLog');

const JOB_FEED_URLS = [
  'https://jobicy.com/?feed=job_feed',
  'https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time',
  'https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france',
  'https://jobicy.com/?feed=job_feed&job_categories=design-multimedia',
  'https://jobicy.com/?feed=job_feed&job_categories=data-science',
  'https://jobicy.com/?feed=job_feed&job_categories=copywriting',
  'https://jobicy.com/?feed=job_feed&job_categories=business',
  'https://jobicy.com/?feed=job_feed&job_categories=management',
  // 'https://www.xhigheredjobs.com/rss/articleFeed.cfm'
];

const startImportProcess = async (jobQueue) => {
  console.log('[Producer] Starting new import cycle.');

  for (const url of JOB_FEED_URLS) {
    let importLog;
    try {
      importLog = await ImportLog.create({
        fileName: url,
        status: 'processing',
      });

      const logId = importLog._id;

      const { data: xmlData } = await axios.get(url, { timeout: 30000 });
      const jobs = await parseXML(xmlData);

      if (jobs.length === 0) {
        importLog.status = 'completed';
        importLog.endTime = new Date();
        await importLog.save();
        console.log(`[Producer] Feed ${url} is empty. Marked as complete.`);
        continue;
      }

      console.log(`[Producer] Found ${jobs.length} jobs. Enqueuing with logId: ${logId}`);

      importLog.totalFetched = jobs.length;
      await importLog.save();

      const bulkJobs = jobs.map(job => ({
        name: 'import-job',
        data: { job, logId, sourceApi: url }
      }));
      await jobQueue.addBulk(bulkJobs);

    } catch (error) {
      console.error(`[Producer] Failed to process feed ${url}:`, error.message);
      if (importLog) {
        importLog.status = 'failed';
        importLog.errorMessage = error.message;
        importLog.endTime = new Date();
        await importLog.save();
      }
    }
  }
  console.log('[Producer] Finished import cycle.');
};

module.exports = { startImportProcess };

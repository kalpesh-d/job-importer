const ImportLog = require('../models/ImportLog');
const { startImportProcess } = require('../services/producer');
const { JOB_FEED_URLS } = require('../services/producer');

const getImportHistory = async (req, res) => {
  try {
    const defaultLimit = JOB_FEED_URLS.length || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || defaultLimit;
    const skip = (page - 1) * limit;

    const logs = await ImportLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalLogs = await ImportLog.countDocuments();

    res.json({
      data: logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalLogs / limit),
        totalLogs,
        perPage: limit,
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch import logs' });
  }
};

const triggerManualImport = async (req, res, jobQueue) => {
  console.log('[API] Manual import trigger received.');
  await startImportProcess(jobQueue);
  res.status(202).json({ message: 'Import process triggered successfully.' });
};

module.exports = { getImportHistory, triggerManualImport };

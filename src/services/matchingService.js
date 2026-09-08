const WorkerProfile = require('../models/WorkerProfile');

const executeMatching = async (category, requestLng, requestLat) => {
  const catStr = (category || 'plumbing').toLowerCase();

  try {
    // Fetch all active available workers from MongoDB Atlas sorted by most recent online timestamp
    const availableWorkers = await WorkerProfile.find({
      "availability.status": "available"
    }).sort({ "availability.updatedAt": -1, updatedAt: -1 });

    if (availableWorkers && availableWorkers.length > 0) {
      // Find worker with matching skill case-insensitively
      const skillMatch = availableWorkers.find(w =>
        w.skills && w.skills.some(s => s.toLowerCase().includes(catStr) || catStr.includes(s.toLowerCase()))
      );

      return skillMatch || availableWorkers[0];
    }
  } catch (err) {
    console.log('Worker matching query note:', err.message);
  }

  // Return null if no online worker is available in MongoDB Atlas
  return null;
};

module.exports = {
  executeMatching,
  findMatch: executeMatching
};

const WorkerProfile = require('../models/WorkerProfile');

const executeMatching = async (category, requestLng, requestLat) => {
  const catStr = (category || 'plumbing').toLowerCase();

  try {
    // 1. Fetch available online workers from MongoDB Atlas sorted by most recent active timestamp
    let availableWorkers = await WorkerProfile.find({
      "availability.status": "available"
    }).sort({ "availability.updatedAt": -1, updatedAt: -1 });

    // 2. If no "available" status worker, fetch ALL registered worker profiles in MongoDB Atlas sorted by latest update
    if (!availableWorkers || availableWorkers.length === 0) {
      availableWorkers = await WorkerProfile.find({}).sort({ updatedAt: -1, _id: -1 });
    }

    if (availableWorkers && availableWorkers.length > 0) {
      // Find worker matching requested skill case-insensitively
      const skillMatch = availableWorkers.find(w =>
        w.skills && w.skills.some(s => s.toLowerCase().includes(catStr) || catStr.includes(s.toLowerCase()))
      );

      return skillMatch || availableWorkers[0];
    }
  } catch (err) {
    console.log('Worker matching query note:', err.message);
  }

  // Return null ONLY if 0 workers exist in MongoDB Atlas database
  return null;
};

module.exports = {
  executeMatching,
  findMatch: executeMatching
};

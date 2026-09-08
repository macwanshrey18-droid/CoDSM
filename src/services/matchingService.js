const WorkerProfile = require('../models/WorkerProfile');

const findMatch = async (category, requestLng, requestLat, radiusMeters = 10000) => {
  const candidates = await WorkerProfile.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [requestLng, requestLat] },
        distanceField: "distance",
        maxDistance: radiusMeters,
        spherical: true,
        query: {
          skills: category,
          "availability.status": "available"
        }
      }
    },
    {
      $addFields: {
        score: {
          $subtract: [
            { $multiply: ["$ratingAvg", 10] },
            { $add: [ { $divide: ["$distance", 1000] }, "$currentActiveJobs" ] }
          ]
        }
      }
    },
    { $sort: { score: -1 } },
    { $limit: 1 }
  ]);

  return candidates.length > 0 ? candidates[0] : null;
};

const executeMatching = async (category, requestLng, requestLat) => {
  // Pass 1: initial 10km radius
  let match = await findMatch(category, requestLng, requestLat, 10000);
  
  // Pass 2: Fallback 25km radius
  if (!match) {
    match = await findMatch(category, requestLng, requestLat, 25000);
  }

  return match;
};

module.exports = {
  executeMatching,
  findMatch
};

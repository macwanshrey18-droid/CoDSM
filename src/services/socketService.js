// Socket Service to encapsulate emitting events

const notifyWorkerMatched = (io, workerUserId, requestData) => {
  // workerUserId is the user._id to which the worker's client is joined
  if (io) {
    io.to(workerUserId.toString()).emit('incoming_request', requestData);
  }
};

const notifyHouseholdStatusUpdate = (io, householdUserId, bookingData) => {
  if (io) {
    io.to(householdUserId.toString()).emit('booking_update', bookingData);
  }
};

module.exports = {
  notifyWorkerMatched,
  notifyHouseholdStatusUpdate
};

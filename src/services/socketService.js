// Socket Service to encapsulate emitting events

const notifyWorkerMatched = (io, workerUserId, requestData) => {
  if (io) {
    if (workerUserId) {
      io.to(workerUserId.toString()).emit('incoming_request', requestData);
    }
    io.emit('incoming_request', requestData);
  }
};

const notifyHouseholdStatusUpdate = (io, householdUserId, bookingData) => {
  if (io) {
    if (householdUserId) {
      io.to(householdUserId.toString()).emit('booking_update', bookingData);
    }
    io.emit('booking_update', bookingData);
  }
};

module.exports = {
  notifyWorkerMatched,
  notifyHouseholdStatusUpdate
};

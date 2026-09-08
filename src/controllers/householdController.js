const ServiceRequest = require('../models/ServiceRequest');
const Booking = require('../models/Booking');
const { executeMatching } = require('../services/matchingService');
const { notifyWorkerMatched } = require('../services/socketService');

exports.createRequest = async (req, res) => {
  try {
    const { category, location, requestedTime } = req.body;
    
    let serviceRequest = new ServiceRequest({
      householdId: req.user._id,
      category,
      location,
      requestedTime,
      status: 'matching'
    });
    
    await serviceRequest.save();

    // Trigger matching
    const match = await executeMatching(category, location.coordinates[0], location.coordinates[1]);
    
    if (match) {
      serviceRequest.matchedWorkerId = match._id;
      serviceRequest.status = 'matched';
      await serviceRequest.save();
      
      // Notify matched worker in real-time via WebSocket socket room
      if (match.userId) {
        notifyWorkerMatched(req.app.get('io'), match.userId, {
          _id: serviceRequest._id,
          category: serviceRequest.category,
          location: serviceRequest.location,
          requestedTime: serviceRequest.requestedTime,
          householdPhone: req.user.phone,
          price: '₹450'
        });
      }

      res.status(201).json({ serviceRequest, match });
    } else {
      serviceRequest.status = 'no_match';
      await serviceRequest.save();
      res.status(201).json({ serviceRequest, match: null, message: 'No worker available at the moment' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRequestStatus = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id)
      .populate('matchedWorkerId');
    if (!serviceRequest) return res.status(404).json({ error: 'Request not found' });
    
    if (serviceRequest.householdId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    res.status(200).json(serviceRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.confirmWorker = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);
    if (!serviceRequest) return res.status(404).json({ error: 'Request not found' });
    
    if (serviceRequest.status !== 'matched' || !serviceRequest.matchedWorkerId) {
      return res.status(400).json({ error: 'Request is not matched' });
    }

    const booking = new Booking({
      serviceRequestId: serviceRequest._id,
      householdId: req.user._id,
      workerId: serviceRequest.matchedWorkerId,
      status: 'matched'
    });
    await booking.save();
    
    // Notify the matched worker via socket
    const WorkerProfile = require('../models/WorkerProfile');
    const workerProfile = await WorkerProfile.findById(serviceRequest.matchedWorkerId);
    
    if (workerProfile) {
      notifyWorkerMatched(req.app.get('io'), workerProfile.userId, {
        bookingId: booking._id,
        category: serviceRequest.category,
        location: serviceRequest.location,
        requestedTime: serviceRequest.requestedTime,
        householdPhone: req.user.phone
      });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.retryMatch = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);
    if (!serviceRequest) return res.status(404).json({ error: 'Request not found' });
    
    if (serviceRequest.status !== 'no_match') {
      return res.status(400).json({ error: 'Can only retry unmatched requests' });
    }

    const match = await executeMatching(serviceRequest.category, serviceRequest.location.coordinates[0], serviceRequest.location.coordinates[1]);
    
    if (match) {
      serviceRequest.matchedWorkerId = match._id;
      serviceRequest.status = 'matched';
      await serviceRequest.save();
      res.status(200).json({ serviceRequest, match });
    } else {
      res.status(200).json({ serviceRequest, match: null, message: 'Still no worker available' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);
    if (!serviceRequest) return res.status(404).json({ error: 'Request not found' });
    
    if (!['matching', 'matched'].includes(serviceRequest.status)) {
      return res.status(400).json({ error: 'Cannot cancel request at this stage' });
    }

    serviceRequest.status = 'cancelled';
    await serviceRequest.save();

    res.status(200).json({ message: 'Request cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

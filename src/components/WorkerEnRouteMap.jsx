import React, { useEffect, useState } from 'react';
import { Phone, MessageSquare, ShieldCheck, MapPin, Navigation, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { subscribeToRequest } from '../services/socket';

const householdIcon = L.divIcon({
  className: 'custom-household-marker',
  html: `<div className="w-8 h-8 bg-indigo-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs">🏠</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const workerIcon = L.divIcon({
  className: 'custom-worker-marker',
  html: `<div className="w-9 h-9 bg-emerald-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs animate-bounce">🧰</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export default function WorkerEnRouteMap({ worker, bookingId, onTrackStatusTap }) {
  const [showAssignedBanner, setShowAssignedBanner] = useState(true);
  const [workerPos, setWorkerPos] = useState([23.0280, 72.5800]); // En route towards household
  const householdPos = [23.0225, 72.5714];

  useEffect(() => {
    // Auto-dismiss banner after 4s
    const bannerTimer = setTimeout(() => setShowAssignedBanner(false), 4000);

    // Live socket position update
    const unsubscribe = subscribeToRequest(bookingId, (data) => {
      if (data.location?.coordinates) {
        setWorkerPos([data.location.coordinates[1], data.location.coordinates[0]]);
      }
    });

    // Simulate animated en-route movement over 10 seconds
    const interval = setInterval(() => {
      setWorkerPos((prev) => {
        const nextLat = prev[0] - (prev[0] - householdPos[0]) * 0.15;
        const nextLng = prev[1] - (prev[1] - householdPos[1]) * 0.15;
        return [nextLat, nextLng];
      });
    }, 2000);

    return () => {
      clearTimeout(bannerTimer);
      clearInterval(interval);
      unsubscribe();
    };
  }, [bookingId]);

  const polylineCoords = [workerPos, householdPos];

  const w = worker || {
    name: 'Arjun K.',
    title: 'Master Plumber',
    rating: 4.9,
    photoUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200',
  };

  return (
    <div className="relative w-full h-full bg-slate-100 flex flex-col overflow-hidden">
      {/* Screen 11: Notification: Worker Assigned In-App Toast Banner */}
      {showAssignedBanner && (
        <div className="absolute top-3 left-3 right-3 bg-indigo-900 text-white p-3 rounded-2xl shadow-2xl z-30 border border-indigo-700 flex items-center justify-between animate-slide-up">
          <div className="flex items-center space-x-3">
            <img src={w.photoUrl} alt={w.name} className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400" />
            <div>
              <h4 className="text-xs font-bold flex items-center">
                {w.name} Assigned! <CheckCircle className="w-3.5 h-3.5 text-emerald-400 ml-1" />
              </h4>
              <p className="text-[10px] text-indigo-200">En route to your location • ~12 min</p>
            </div>
          </div>
          <button onClick={() => setShowAssignedBanner(false)} className="text-indigo-300 text-xs font-bold px-2">✕</button>
        </div>
      )}

      {/* ETA Top Float Pill */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg z-20 border border-slate-200 flex items-center space-x-2">
        <Navigation className="w-4 h-4 text-emerald-600 animate-spin" />
        <span className="text-xs font-extrabold text-slate-800">Arriving in ~12 min (0.8 km)</span>
      </div>

      {/* Full Screen Google/Leaflet Map */}
      <div className="flex-1 w-full relative z-10">
        <MapContainer center={householdPos} zoom={14} zoomControl={false} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            attribution="&copy; Google Maps India"
          />
          <Marker position={householdPos} icon={householdIcon}><Popup>Your Household Location</Popup></Marker>
          <Marker position={workerPos} icon={workerIcon}><Popup>Arjun K. (En Route)</Popup></Marker>
          <Polyline positions={polylineCoords} color="#4F46E5" weight={5} dashArray="8, 8" />
        </MapContainer>
      </div>

      {/* Worker Mini Card Bottom Sheet */}
      <div className="bg-white p-4 shadow-2xl border-t border-slate-200 z-20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <img src={w.photoUrl} alt={w.name} className="w-11 h-11 rounded-full object-cover border-2 border-indigo-600 shadow" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center">
                {w.name} <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 ml-1" />
              </h4>
              <p className="text-xs text-slate-500 font-medium">{w.title} • ★ {w.rating}</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100">
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={onTrackStatusTap}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-indigo-600/20"
        >
          View Live Booking Stepper
        </button>
      </div>
    </div>
  );
}

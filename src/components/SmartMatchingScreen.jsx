import React, { useState } from 'react';
import { ArrowLeft, Trophy, Star, ShieldCheck, MapPin, Check, User } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom Leaflet marker icons
const createCustomIcon = (label, isTop = false) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div className="flex flex-col items-center">
        <div className="${
          isTop
            ? 'bg-indigo-600 ring-4 ring-indigo-300 text-white'
            : 'bg-emerald-600 text-white'
        } font-bold text-[10px] px-2 py-0.5 rounded-full shadow-lg flex items-center space-x-1">
          <span>₹</span>
          <span>${label}</span>
        </div>
        <div className="w-3 h-3 ${isTop ? 'bg-indigo-600' : 'bg-emerald-600'} rotate-45 -mt-1 rounded-xs"></div>
      </div>
    `,
    iconSize: [60, 30],
    iconAnchor: [30, 30],
  });
};

export default function SmartMatchingScreen({ matchData, onBack, onConfirmBooking, onViewProfile }) {
  const [showModal, setShowModal] = useState(true);

  const worker = matchData?.worker || {
    name: 'Arjun K.',
    title: 'Master Plumber',
    rating: 4.9,
    reviewsCount: 124,
    distance: '0.8 km away',
    matchScore: '98% Match',
  };

  const centerLocation = [23.0225, 72.5714];

  return (
    <div className="relative w-full h-full bg-slate-100 flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="bg-white px-4 py-3 shadow-xs flex items-center justify-between z-20 border-b border-slate-200">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-indigo-600" />
        </button>
        <h2 className="text-base font-bold text-indigo-900 tracking-tight">Smart Matching</h2>
        <div className="w-6"></div>
      </div>

      {/* Interactive Map View */}
      <div className="flex-1 w-full relative z-10">
        <MapContainer
          center={centerLocation}
          zoom={14}
          zoomControl={false}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; Google Maps India'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          />
          <Marker position={[23.0225, 72.5714]} icon={createCustomIcon('0.8 km', true)}>
            <Popup>Top Match: Arjun K.</Popup>
          </Marker>
          <Marker position={[23.0280, 72.5800]} icon={createCustomIcon('1.2 km')}>
            <Popup>Worker 2: 1.2 km away</Popup>
          </Marker>
          <Marker position={[23.0150, 72.5650]} icon={createCustomIcon('1.9 km')}>
            <Popup>Worker 3: 1.9 km away</Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Top Match Found Modal Overlay (Matching Reference Screenshot 2) */}
      {showModal && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 z-30 animate-fade-in">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm text-center shadow-2xl border border-slate-100 animate-slide-up">
            {/* Blue Circle Trophy Icon */}
            <div className="mx-auto w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center mb-3 shadow-md shadow-indigo-600/30">
              <Trophy className="w-7 h-7 text-white" />
            </div>

            {/* Header */}
            <h3 className="text-lg font-bold text-indigo-950 tracking-tight">Top Match Found!</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">We found the best worker for you.</p>

            {/* Worker Profile Card */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 mb-4 text-left shadow-xs">
              <div className="flex items-center space-x-3 mb-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                    {worker.name.slice(0, 2).toUpperCase() || 'WP'}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-emerald-600 text-white rounded-full p-0.5 border border-white">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-1">
                    <h4 className="text-sm font-bold text-slate-900">{worker.name}</h4>
                    <span className="text-emerald-600 font-bold text-xs">✓</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{worker.title}</p>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-600 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-800">{worker.rating}</span>
                    <span>({worker.reviewsCount})</span>
                    <span>•</span>
                    <span className="font-medium">{worker.distance}</span>
                  </div>
                </div>
              </div>

              {/* Match Criteria Pill */}
              <div className="bg-emerald-50 border border-emerald-200/70 rounded-xl p-2 text-center">
                <span className="text-xs font-bold text-emerald-800 block mb-0.5">{worker.matchScore}</span>
                <div className="flex items-center justify-center space-x-2 text-[10px] text-emerald-700 font-semibold">
                  <span>Skill ✓</span>
                  <span>Distance ✓</span>
                  <span>Availability ✓</span>
                </div>
              </div>
            </div>

            {/* View Worker Profile Button */}
            <button
              onClick={() => {
                setShowModal(false);
                if (onViewProfile) onViewProfile(worker);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-indigo-600/20 text-xs tracking-wide transition-all"
            >
              View Worker Profile
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Bar (Top Match + Confirm Booking CTA) */}
      <div className="bg-white p-4 shadow-xl border-t border-slate-200 z-20">
        <div className="flex items-center justify-between mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              {worker.name.slice(0, 2).toUpperCase() || 'WP'}
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">{worker.name}</h5>
              <p className="text-[10px] text-slate-500">{worker.title} • {worker.distance}</p>
            </div>
          </div>
          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
            98% Match
          </span>
        </div>

        <button
          onClick={onConfirmBooking}
          className="w-full bg-indigo-900 hover:bg-indigo-950 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 text-sm transition-all"
        >
          <span>Confirm Booking</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Wrench, Zap, Sparkles, Hammer, Paintbrush, Tv, Check, Clock, X, Crosshair, ChevronDown } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

const defaultPinIcon = L.divIcon({
  className: 'custom-pin',
  html: `<div className="w-7 h-7 bg-indigo-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const categoryIcons = {
  plumbing: Wrench,
  electrical: Zap,
  cleaning: Sparkles,
  carpentry: Hammer,
  painting: Paintbrush,
  appliance: Tv,
};

const availableCategories = [
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'cleaning', name: 'Home Cleaning' },
  { id: 'carpentry', name: 'Carpentry' },
  { id: 'painting', name: 'Painting' },
  { id: 'appliance', name: 'Appliance Repair' },
];

const scheduleOptions = [
  'Instant / ASAP (Within 30 mins)',
  'Today, 4:00 PM',
  'Today, 6:00 PM',
  'Tomorrow Morning, 10:00 AM',
  'Tomorrow Afternoon, 2:00 PM',
];

export default function CreateRequestScreen({ initialCategory = 'plumbing', userAddress = 'Navrangpura, Ahmedabad', onBack, onSubmitRequest }) {
  const [category, setCategory] = useState(initialCategory);
  const [address, setAddress] = useState(userAddress);
  const [preferredTime, setPreferredTime] = useState('Instant / ASAP (Within 30 mins)');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [coordinates, setCoordinates] = useState([23.0225, 72.5714]);
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null);

  const SelectedIcon = categoryIcons[category] || Wrench;

  const detectPreciseLocation = () => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('Geolocation not supported by browser.');
      return;
    }
    setGpsDetecting(true);
    setGpsStatus('Detecting precise device GPS...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoordinates([latitude, longitude]);
        setGpsDetecting(false);
        setGpsStatus(`Precise GPS Acquired! (Accuracy: ±${Math.round(accuracy)}m)`);
      },
      (err) => {
        console.log('GPS detection note:', err.message);
        setGpsDetecting(false);
        setGpsStatus('GPS permission denied. Using default location.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    detectPreciseLocation();
  }, []);

  const [customDateTime, setCustomDateTime] = useState('');

  const handleApplyCustomSchedule = () => {
    if (!customDateTime) return;
    const dt = new Date(customDateTime);
    if (isNaN(dt.getTime())) return;

    const formatted = dt.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    setPreferredTime(formatted);
    setShowScheduleModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitRequest({
      category,
      address,
      location: { type: 'Point', coordinates: [coordinates[1], coordinates[0]] },
      requestedTime: preferredTime,
    });
  };

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col justify-between overflow-y-auto p-4 relative animate-fade-in">
      <div>
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4 pt-1">
          <button onClick={onBack} className="p-1.5 rounded-full hover:bg-slate-200 text-indigo-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Create Service Request</h2>
        </div>

        {/* Selected Service Card with Dynamic Category Dropdown */}
        <div className="mb-4 bg-indigo-50 border border-indigo-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <SelectedIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Selected Category</span>
              <h3 className="text-sm font-bold text-slate-900 capitalize">{category} Service</h3>
            </div>
          </div>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white border border-indigo-200/80 text-indigo-900 text-xs font-bold py-1.5 pl-3 pr-7 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs capitalize"
            >
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-indigo-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Address Input & Indian Map View */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Service Address & Map Pin</label>
            <button
              type="button"
              onClick={detectPreciseLocation}
              disabled={gpsDetecting}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/80 transition-colors shadow-2xs"
            >
              <Crosshair className={`w-3 h-3 ${gpsDetecting ? 'animate-spin text-indigo-600' : 'text-indigo-600'}`} />
              <span>{gpsDetecting ? 'Detecting GPS...' : 'Use Precise GPS'}</span>
            </button>
          </div>

          {gpsStatus && (
            <div className="mb-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center space-x-1.5 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{gpsStatus}</span>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center space-x-2 shadow-xs mb-2">
            <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter complete service address"
              className="w-full text-xs font-bold text-slate-900 focus:outline-none bg-transparent"
              required
            />
          </div>

          <div className="w-full h-36 rounded-2xl overflow-hidden border border-slate-300 shadow-xs relative">
            <MapContainer key={`${coordinates[0]}-${coordinates[1]}`} center={coordinates} zoom={16} zoomControl={false} style={{ width: '100%', height: '100%' }}>
              <TileLayer
                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                attribution="&copy; Google Maps India"
              />
              <Marker position={coordinates} icon={defaultPinIcon} />
            </MapContainer>
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-extrabold text-slate-800 shadow border border-slate-200/80">
              📍 GPS: {coordinates[0].toFixed(4)} N, {coordinates[1].toFixed(4)} E
            </div>
          </div>
        </div>

        {/* Preferred Schedule Card with Working Change Button */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">Preferred Schedule</label>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2.5 text-slate-800">
              <Calendar className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Scheduled Time</span>
                <span className="text-xs font-bold text-slate-900">{preferredTime}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-200/80 transition-colors shadow-2xs"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      <div className="pb-2">
        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-950 hover:bg-slate-900 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-xl flex items-center justify-center space-x-2 text-sm transition-all"
        >
          <span>Find a Worker</span>
          <span>&rarr;</span>
        </button>
      </div>

      {/* Schedule Picker Modal Overlay */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-slide-up border border-slate-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Select Preferred Schedule</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full text-xs font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {scheduleOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setPreferredTime(opt);
                    setShowScheduleModal(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                    preferredTime === opt
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{opt}</span>
                  {preferredTime === opt && <Check className="w-4 h-4 text-indigo-600 stroke-[3]" />}
                </button>
              ))}
            </div>

            {/* Custom Date & Time Picker */}
            <div className="pt-3 border-t border-slate-200">
              <label className="text-[11px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                Or Pick Custom Date & Time
              </label>

              <div className="space-y-2">
                <input
                  type="datetime-local"
                  value={customDateTime}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs"
                />

                <button
                  type="button"
                  onClick={handleApplyCustomSchedule}
                  disabled={!customDateTime}
                  className={`w-full font-bold py-2.5 px-3 rounded-xl text-xs transition-all flex items-center justify-center space-x-1 ${
                    customDateTime
                      ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 active:scale-[0.98]'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Custom Schedule</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

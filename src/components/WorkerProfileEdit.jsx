import React, { useState, useEffect } from 'react';
import { ShieldCheck, Star, Save, Phone, Award, Check, ArrowLeft, Trash2, MapPin, Crosshair } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { updateWorkerProfile, updateUserProfile } from '../services/api';

const defaultPinIcon = L.divIcon({
  className: 'custom-pin',
  html: `<div className="w-7 h-7 bg-indigo-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function WorkerProfileEdit({ token, workerProfile, onBack, onDeleteAccount }) {
  const [name, setName] = useState(workerProfile?.name || '');
  const [phone, setPhone] = useState(workerProfile?.phone || '');
  const [title, setTitle] = useState(workerProfile?.title || 'Master Plumber');
  const [address, setAddress] = useState(workerProfile?.address || 'Navrangpura, Ahmedabad');
  const [coordinates, setCoordinates] = useState([23.0225, 72.5714]);
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null);
  const [saved, setSaved] = useState(false);

  const detectPreciseLocation = () => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('Geolocation not supported by browser.');
      return;
    }
    setGpsDetecting(true);
    setGpsStatus('Detecting worker precise device GPS location...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoordinates([latitude, longitude]);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            const parts = data.display_name.split(', ');
            setAddress(parts.slice(0, 4).join(', '));
          } else {
            setAddress(`Navrangpura, Ahmedabad (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`);
          }
        } catch {
          setAddress(`Navrangpura, Ahmedabad (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`);
        } finally {
          setGpsDetecting(false);
          setGpsStatus(`Precise GPS Acquired! (Accuracy: ±${Math.round(accuracy)}m)`);
        }
      },
      (err) => {
        console.log('Worker GPS detection note:', err.message);
        setGpsDetecting(false);
        setGpsStatus('Using default location coordinates.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    detectPreciseLocation();
  }, []);

  const handlePhoneChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (phone && phone.length !== 10) {
      alert('Mobile contact number must be exactly 10 digits');
      return;
    }
    await updateWorkerProfile(token, {
      name,
      phone,
      title,
      location: { type: 'Point', coordinates: [coordinates[1], coordinates[0]] },
    }).catch(() => ({}));
    if (token) {
      await updateUserProfile(token, { name, phone, address }).catch(() => ({}));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to permanently delete your CoDSM account and profile? This action cannot be undone.')) {
      if (onDeleteAccount) onDeleteAccount();
    }
  };

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col justify-between overflow-y-auto p-4 animate-fade-in">
      <div>
        {/* Back Header */}
        <div className="flex items-center space-x-2 mb-4 pt-1">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Worker Profile & Credentials</h2>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3 mb-5">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200"
              alt="Arjun"
              className="w-14 h-14 rounded-full object-cover border-2 border-indigo-600 shadow"
            />
            <div className="absolute bottom-0 right-0 bg-emerald-600 text-white rounded-full p-0.5 border border-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              {name} <span className="text-emerald-600 ml-1 text-xs font-bold">✓</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">{title} • Member #108</p>
            <div className="flex items-center space-x-1 text-xs text-amber-500 font-bold mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>
                {workerProfile?.ratingCount
                  ? `${workerProfile.ratingAvg || 5.0} (${workerProfile.ratingCount} reviews)`
                  : 'New Worker (No ratings yet)'}
              </span>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wide">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wide">Permanent Mobile Contact Number</label>
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center space-x-2 shadow-xs">
              <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={phone}
                onChange={handlePhoneChange}
                placeholder="10-digit mobile number"
                className="w-full text-xs font-bold text-slate-900 focus:outline-none bg-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wide">Primary Trade Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
              required
            />
          </div>

          {/* Worker Service Base Location */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Worker Base Location</label>
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
              <div className="mb-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-xl text-[11px] font-semibold flex items-center space-x-1.5 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{gpsStatus}</span>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center space-x-2 shadow-xs">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter base service address"
                className="w-full text-xs font-bold text-slate-900 focus:outline-none bg-transparent"
                required
              />
            </div>
          </div>

          {/* Verification Badge Overview */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-950 flex items-start space-x-3">
            <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Cooperative Verified Worker</span>
              <p className="text-[11px] text-emerald-800 leading-snug">
                Your skills and certifications are verified by Ahmedabad Local Cooperative Guild #4.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 text-xs transition-all"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Profile Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>

            {onDeleteAccount && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { UserCheck, MapPin, Check, Camera, Phone, AlertCircle, Trash2, Navigation, ArrowLeft } from 'lucide-react';
import { updateUserProfile, getUserProfile } from '../services/api';

export default function HouseholdProfileSetup({ token, initialProfile, onComplete, onDeleteAccount, onBack }) {
  const [name, setName] = useState(initialProfile?.name || '');
  const [phone, setPhone] = useState(initialProfile?.phone || '');
  const [address, setAddress] = useState(initialProfile?.address || '');
  const [error, setError] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handlePhoneChange = (e) => {
    // Strip non-numeric characters and cap strictly at 10 digits
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
  };

  const detectGPSLocation = () => {
    if ('geolocation' in navigator) {
      setDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.display_name) {
              const parts = data.display_name.split(', ');
              const shortAddr = parts.slice(0, 4).join(', ');
              setAddress(shortAddr);
            } else {
              setAddress(`Navrangpura, Ahmedabad (GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`);
            }
          } catch {
            setAddress(`Navrangpura, Ahmedabad (GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`);
          } finally {
            setDetectingLocation(false);
          }
        },
        (err) => {
          console.log('GPS detection fallback:', err.message);
          setDetectingLocation(false);
          if (!address) {
            setAddress('Navrangpura, Ahmedabad');
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else if (!address) {
      setAddress('Navrangpura, Ahmedabad');
    }
  };

  useEffect(() => {
    const activeToken = token || localStorage.getItem('codsm_token');
    if (activeToken) {
      getUserProfile(activeToken)
        .then((user) => {
          if (user) {
            if (user.name) setName(user.name);
            if (user.phone) setPhone(user.phone);
            if (user.address) setAddress(user.address);
          }
        })
        .catch((err) => console.log('Profile prefill note:', err.message));
    }
    if (!initialProfile?.address && !address) {
      detectGPSLocation();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (phone.length !== 10) {
      setError('Mobile contact number must be exactly 10 digits');
      return;
    }
    setError(null);
    try {
      const activeToken = token || localStorage.getItem('codsm_token');
      if (activeToken) {
        await updateUserProfile(activeToken, { name, phone, address });
      } else {
        throw new Error('Authentication session token not found. Please log in again.');
      }
    } catch (err) {
      console.error('Profile setup save error:', err.message);
      setError('Failed to save profile to database: ' + err.message);
      return;
    }
    onComplete({ name, phone, address });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to permanently delete your CoDSM account and data? This action cannot be undone.')) {
      if (onDeleteAccount) onDeleteAccount();
    }
  };

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col justify-between overflow-y-auto p-4 animate-fade-in">
      <div>
        <div className="flex items-center space-x-2 mb-6 pt-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors shadow-xs mr-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow">
            <UserCheck className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Household Profile</h2>
        </div>

        {/* Profile Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
            />
            <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full shadow border-2 border-white">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1.5">Upload Household Photo</span>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center space-x-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">Permanent Mobile Contact Number</label>
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center space-x-2 shadow-xs">
              <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={phone}
                onChange={handlePhoneChange}
                placeholder="10-digit mobile number (e.g. 9876543210)"
                className="w-full text-xs font-bold text-slate-900 focus:outline-none bg-transparent"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">Default Service Address</label>
              <button
                type="button"
                onClick={detectGPSLocation}
                disabled={detectingLocation}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 transition-colors"
              >
                <Navigation className={`w-3 h-3 ${detectingLocation ? 'animate-spin text-indigo-600' : ''}`} />
                <span>{detectingLocation ? 'Detecting...' : 'Auto-Detect Location'}</span>
              </button>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center space-x-2 shadow-xs">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={detectingLocation ? 'Detecting precise location via GPS...' : 'Enter complete address'}
                className="w-full text-xs font-bold text-slate-900 focus:outline-none bg-transparent"
                required
              />
            </div>
          </div>
        </form>
      </div>

      <div className="pb-2 space-y-2 mt-4">
        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 text-xs transition-all"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Save Profile & Start</span>
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
    </div>
  );
}

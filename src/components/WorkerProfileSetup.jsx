import React, { useState, useEffect } from 'react';
import { Camera, ShieldCheck, Check, Upload, Phone, AlertCircle } from 'lucide-react';
import { updateWorkerProfile, updateWorkerAvailability, updateUserProfile, getUserProfile } from '../services/api';

export default function WorkerProfileSetup({ token, initialProfile, onComplete }) {
  const [name, setName] = useState(initialProfile?.name || '');
  const [phone, setPhone] = useState(initialProfile?.phone || '');
  const [selectedSkills, setSelectedSkills] = useState(['plumbing']);
  const [error, setError] = useState(null);

  const skillsList = ['plumbing', 'electrical', 'cleaning', 'carpentry', 'painting'];

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handlePhoneChange = (e) => {
    // Strip non-numeric characters and cap strictly at 10 digits
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
  };

  const [coordinates, setCoordinates] = useState([72.5714, 23.0225]);

  useEffect(() => {
    const activeToken = token || localStorage.getItem('codsm_token');
    if (activeToken) {
      getUserProfile(activeToken)
        .then((user) => {
          if (user) {
            if (user.name) setName(user.name);
            if (user.phone) setPhone(user.phone);
          }
        })
        .catch((err) => console.log('Worker profile prefill note:', err.message));
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates([position.coords.longitude, position.coords.latitude]);
        },
        (err) => console.log('Worker GPS fallback:', err.message),
        { enableHighAccuracy: true, timeout: 10000 }
      );
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
        await updateUserProfile(activeToken, { name, phone });
        await updateWorkerProfile(activeToken, {
          name,
          phone,
          photoUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200',
          skills: selectedSkills,
          location: { type: 'Point', coordinates }, // Precise HTML5 GPS or Fallback
        });
        await updateWorkerAvailability(activeToken, 'available').catch(() => ({}));
      } else {
        throw new Error('Authentication session token not found. Please log in again.');
      }
    } catch (err) {
      console.error('Worker profile save error:', err.message);
      setError('Failed to save profile to database: ' + err.message);
      return;
    }
    onComplete({ name, phone, skills: selectedSkills });
  };

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col justify-between overflow-y-auto p-4 animate-fade-in">
      <div>
        <div className="flex items-center space-x-2 mb-4 pt-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Worker Profile Setup</h2>
        </div>

        {/* Photo Picker */}
        <div className="flex flex-col items-center mb-5">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200"
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
            />
            <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full shadow border-2 border-white">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1">Upload Profile Photo</span>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center space-x-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Name input */}
        <div className="mb-4">
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

        {/* Mobile Number input */}
        <div className="mb-4">
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

        {/* Skill Tag Chips */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">Skills Offered</label>
          <div className="flex flex-wrap gap-2">
            {skillsList.map((skill) => {
              const active = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {skill} {active && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Certification Upload Card */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">Cooperative Certification Document</label>
          <div className="bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-3.5 text-center flex items-center justify-between">
            <div className="flex items-center space-x-2 text-left">
              <Upload className="w-5 h-5 text-indigo-600" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">ITI_Plumbing_Cert.pdf</span>
                <span className="text-[10px] text-emerald-600 font-bold">Verification: Pre-Approved</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Uploaded</span>
          </div>
        </div>
      </div>

      <div className="pb-2">
        <button
          onClick={handleSubmit}
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 text-xs transition-all"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Save & Register as Available Worker</span>
        </button>
      </div>
    </div>
  );
}

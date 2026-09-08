import React, { useState, useEffect } from 'react';
import { Bell, Briefcase, DollarSign, Star, CheckCircle, XCircle, LayoutGrid, Clock, UserCheck, MapPin, Crosshair } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { getWorkerProfile, getWorkerEarnings, updateWorkerAvailability } from '../services/api';

const defaultPinIcon = L.divIcon({
  className: 'custom-pin',
  html: `<div className="w-7 h-7 bg-indigo-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function WorkerDashboard({
  token,
  isOnline,
  setIsOnline,
  workerProfile,
  incomingRequest,
  onAcceptRequest,
  onDeclineRequest,
  activeBooking,
  onCompleteJob,
  onShowPaymentModal,
  onNavigateToEarnings,
  onNavigateToProfile
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [coordinates, setCoordinates] = useState([23.0225, 72.5714]);
  const [currentAddress, setCurrentAddress] = useState(workerProfile?.address || 'Navrangpura, Ahmedabad');
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null);

  const [profileData, setProfileData] = useState(workerProfile || {});

  useEffect(() => {
    const activeToken = token || localStorage.getItem('codsm_token');
    if (activeToken) {
      getWorkerProfile(activeToken)
        .then((data) => {
          if (data && data.name) {
            setProfileData((prev) => ({ ...prev, ...data }));
            if (data.availability?.status && setIsOnline) {
              setIsOnline(data.availability.status === 'available');
            }
          }
        })
        .catch((err) => console.log('Worker dashboard profile note:', err.message));

      getWorkerEarnings(activeToken)
        .then((e) => {
          if (e) {
            setProfileData((prev) => ({
              ...prev,
              jobsCompleted: e.jobsCompleted || prev?.jobsCompleted || 0,
              totalEarnings: e.totalThisWeek || prev?.totalEarnings || 0,
              ratingAvg: e.ratingAvg || prev?.ratingAvg || 0,
              ratingCount: e.ratingCount || prev?.ratingCount || 0,
            }));
          }
        })
        .catch((err) => console.log('Worker dashboard earnings note:', err.message));
    }
  }, [token]);

  const handleToggleOnline = async () => {
    const nextStatus = !isOnline;
    if (setIsOnline) setIsOnline(nextStatus);

    const activeToken = token || localStorage.getItem('codsm_token');
    if (activeToken) {
      try {
        await updateWorkerAvailability(activeToken, nextStatus ? 'available' : 'unavailable');
      } catch (err) {
        console.log('Error updating worker availability in DB:', err.message);
      }
    }
  };

  const workerName = profileData?.name || workerProfile?.name || 'Worker';

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
            setCurrentAddress(parts.slice(0, 4).join(', '));
          } else {
            setCurrentAddress(`Navrangpura, Ahmedabad (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`);
          }
        } catch {
          setCurrentAddress(`Navrangpura, Ahmedabad (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`);
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

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col justify-between overflow-hidden">
      {/* Worker Portal Header */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between z-10 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <img
            src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200"
            alt={workerName}
            className="w-9 h-9 rounded-full object-cover border border-indigo-600 shadow-xs"
          />
          <div>
            <h2 className="text-sm font-bold text-indigo-900 leading-none">Worker Portal</h2>
            <span className="text-[10px] text-emerald-600 font-semibold">Coop Member #108</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Online Toggle Switch */}
          <div className="flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            <span className="text-[10px] font-bold text-slate-600">{isOnline ? 'Online' : 'Offline'}</span>
            <button
              onClick={handleToggleOnline}
              title="Click to toggle availability status in database"
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${
                isOnline ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform duration-200 ${
                  isOnline ? 'translate-x-4' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          <button
            onClick={() => {
              if (incomingRequest) {
                alert('New service request matched! Click Accept below to accept the job.');
              } else {
                alert('No new notifications');
              }
            }}
            className="relative text-slate-500 hover:text-slate-700"
          >
            <Bell className="w-5 h-5 text-indigo-900" />
            {incomingRequest && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {activeTab === 'dashboard' ? (
          <>
            {/* Welcome Section */}
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Good Morning, {workerName}.</h1>
              <p className="text-xs text-slate-500 font-medium flex items-center mt-0.5">
                <MapPin className="w-3 h-3 text-indigo-600 mr-0.5 shrink-0" />
                <span>{currentAddress}</span>
              </p>
            </div>

            {/* Live Worker Precise GPS Location Map Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 mr-1" /> My Coverage Base Pin
                </span>
                <button
                  type="button"
                  onClick={detectPreciseLocation}
                  disabled={gpsDetecting}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/80 transition-colors shadow-2xs"
                >
                  <Crosshair className={`w-3 h-3 ${gpsDetecting ? 'animate-spin text-indigo-600' : 'text-indigo-600'}`} />
                  <span>{gpsDetecting ? 'Locating...' : 'Auto-Locate GPS'}</span>
                </button>
              </div>

              {gpsStatus && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-xl text-[10px] font-semibold flex items-center space-x-1.5 animate-fade-in">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>{gpsStatus}</span>
                </div>
              )}

              <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 shadow-2xs relative">
                <MapContainer key={`${coordinates[0]}-${coordinates[1]}`} center={coordinates} zoom={16} zoomControl={false} style={{ width: '100%', height: '100%' }}>
                  <TileLayer
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    attribution="&copy; Google Maps India"
                  />
                  <Marker position={coordinates} icon={defaultPinIcon} />
                </MapContainer>
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-extrabold text-slate-800 shadow border border-slate-200/80">
                  📍 GPS: {coordinates[0].toFixed(4)} N, {coordinates[1].toFixed(4)} E
                </div>
              </div>
            </div>

            {/* Incoming Live Request Card */}
            {incomingRequest && (
              <div className="bg-indigo-900 text-white rounded-2xl p-4 shadow-xl border border-indigo-700 animate-pulse-glow">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-indigo-700 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    New Request Matched!
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">0.8 km away</span>
                </div>
                <h3 className="text-base font-bold mb-1">{incomingRequest.category || 'Plumbing'} Service Required</h3>
                <p className="text-xs text-indigo-200 mb-4">Household: {incomingRequest.area || 'Navrangpura, Ahmedabad'} • Preferred: Today</p>

                <div className="flex space-x-2">
                  <button
                    onClick={() => onAcceptRequest(incomingRequest._id || 'req_123')}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1 shadow"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Accept Job</span>
                  </button>
                  <button
                    onClick={() => onDeclineRequest(incomingRequest._id || 'req_123')}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1 border border-slate-700"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            )}

            {/* Active Booking in Progress */}
            {activeBooking && (
              <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Job In Progress
                  </span>
                  <span className="text-xs text-slate-500">Booking #{activeBooking._id?.slice(-6) || '88492'}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Plumbing Maintenance</h4>
                <p className="text-xs text-slate-500 mb-3">Customer: Rahul M. • 0.8 km away</p>

                <button
                  onClick={() => onCompleteJob(activeBooking._id || 'req_123')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark Job Completed</span>
                </button>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="text-xl font-extrabold text-slate-900 block">
                  {profileData?.jobsCompleted ?? workerProfile?.jobsCompleted ?? 0}
                </span>
                <span className="text-[11px] font-medium text-slate-500">Jobs Completed</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="text-xl font-extrabold text-slate-900 block">
                  ₹{(profileData?.totalEarnings || workerProfile?.totalEarnings || 0).toLocaleString()}
                </span>
                <span className="text-[11px] font-medium text-emerald-600">
                  {(profileData?.totalEarnings || workerProfile?.totalEarnings) ? '+14% vs last week' : 'No earnings yet'}
                </span>
              </div>
            </div>

            {/* Rating Overview */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  {(profileData?.ratingCount || workerProfile?.ratingCount) ? (
                    <>
                      <div className="flex items-center space-x-1">
                        <span className="text-base font-bold text-slate-900">{profileData?.ratingAvg || workerProfile?.ratingAvg || 5.0}</span>
                        <span className="text-xs text-slate-500">({profileData?.ratingCount || workerProfile?.ratingCount} reviews)</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">Coop Quality Score: Verified</span>
                    </>
                  ) : (
                    <>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">New Worker</h4>
                      <span className="text-[11px] text-slate-500 font-medium block">No ratings yet</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* JOBS TAB CONTENT */
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Jobs & Assignments</h2>
                <p className="text-xs text-slate-500 font-medium">Manage active and available requests</p>
              </div>
              <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
                {isOnline ? '🟢 Matching Active' : '🔴 Offline'}
              </span>
            </div>

            {/* Active or Matched Jobs */}
            {incomingRequest ? (
              <div className="bg-white rounded-2xl p-4 border-2 border-indigo-500 shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Assigned Request
                  </span>
                  <span className="text-xs text-emerald-600 font-bold">0.8 km away</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{incomingRequest.category || 'Plumbing'} Service</h3>
                <p className="text-xs text-slate-500 mb-3">Customer: {incomingRequest.customer || 'Household'} • {incomingRequest.area || 'Ahmedabad'}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onAcceptRequest(incomingRequest._id || 'req_123')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1 shadow"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Accept Job</span>
                  </button>
                  <button
                    onClick={() => onDeclineRequest(incomingRequest._id || 'req_123')}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs border border-slate-200"
                  >
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ) : activeBooking ? (
              <div className="bg-white rounded-2xl p-4 border-2 border-emerald-500 shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Job In Progress
                  </span>
                  <span className="text-xs text-slate-500">Booking #{activeBooking._id?.slice(-6) || '88492'}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Plumbing Maintenance</h4>
                <p className="text-xs text-slate-500 mb-3">Customer: Rahul M. • Navrangpura, Ahmedabad</p>
                <button
                  onClick={() => onCompleteJob(activeBooking._id || 'req_123')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark Job Completed</span>
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-xs space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">No Active Job Assigned</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Keep your <span className="font-bold text-emerald-600">Online</span> toggle turned ON to receive real-time cooperative matching requests.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-white border-t border-slate-200 px-4 py-2 grid grid-cols-4 gap-1 z-10">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 rounded-xl transition-colors ${
            activeTab === 'dashboard' ? 'text-indigo-600 font-bold bg-indigo-50/60' : 'text-slate-400'
          }`}
        >
          <LayoutGrid className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex flex-col items-center py-1 rounded-xl transition-colors ${
            activeTab === 'jobs' ? 'text-indigo-600 font-bold bg-indigo-50/60' : 'text-slate-400'
          }`}
        >
          <Briefcase className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Jobs</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('earnings');
            if (onNavigateToEarnings) onNavigateToEarnings();
          }}
          className={`flex flex-col items-center py-1 rounded-xl transition-colors ${
            activeTab === 'earnings' ? 'text-indigo-600 font-bold bg-indigo-50/60' : 'text-slate-400'
          }`}
        >
          <DollarSign className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Earnings</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('profile');
            if (onNavigateToProfile) onNavigateToProfile();
          }}
          className={`flex flex-col items-center py-1 rounded-xl transition-colors ${
            activeTab === 'profile' ? 'text-indigo-600 font-bold bg-indigo-50/60' : 'text-slate-400'
          }`}
        >
          <UserCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </div>
  );
}

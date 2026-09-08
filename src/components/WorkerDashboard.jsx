import React, { useState, useEffect } from 'react';
import { Bell, Briefcase, DollarSign, Star, CheckCircle, XCircle, LayoutGrid, Clock, UserCheck, MapPin, Crosshair, Phone, Navigation, X, ShieldCheck } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getWorkerProfile, getWorkerEarnings, updateWorkerAvailability } from '../services/api';

const defaultPinIcon = L.divIcon({
  className: 'custom-pin',
  html: `<div className="w-7 h-7 bg-indigo-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 16);
    }
  }, [center, map]);
  return null;
}

export default function WorkerDashboard({
  token,
  isOnline,
  setIsOnline,
  workerProfile,
  incomingRequest,
  onAcceptRequest,
  onDeclineRequest,
  onNavigateToHouseholdRoute,
  activeBooking,
  onCompleteJob,
  onShowPaymentModal,
  onNavigateToEarnings,
  onNavigateToProfile
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
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
        .catch((err) => console.log('Worker dashboard profile load note:', err.message));

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
    setGpsDetecting(true);
    setGpsStatus('Detecting worker precise device location...');

    const fetchIpFallback = () => {
      fetch('https://ipapi.co/json/')
        .then((res) => res.json())
        .then((ipData) => {
          if (ipData && ipData.latitude && ipData.longitude) {
            const lat = Number(ipData.latitude);
            const lng = Number(ipData.longitude);
            setCoordinates([lat, lng]);
            const locationStr = `${ipData.city || 'Navrangpura'}, ${ipData.region || 'Ahmedabad'}`;
            setCurrentAddress(locationStr);
            setGpsStatus(`Location auto-detected: ${locationStr}`);
          } else {
            setGpsStatus('Using default location coordinates.');
          }
        })
        .catch(() => {
          setGpsStatus('Using default location coordinates.');
        })
        .finally(() => {
          setGpsDetecting(false);
        });
    };

    if (!('geolocation' in navigator)) {
      fetchIpFallback();
      return;
    }

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
            setCurrentAddress(`GPS Pin (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`);
          }
        } catch {
          setCurrentAddress(`GPS Pin (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`);
        } finally {
          setGpsDetecting(false);
          setGpsStatus(`Precise GPS Acquired! (Accuracy: ±${Math.round(accuracy || 10)}m)`);
        }
      },
      (err) => {
        console.log('Worker GPS detection fallback:', err.message);
        fetchIpFallback();
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
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
          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            {workerName.slice(0, 2).toUpperCase() || 'WP'}
          </div>
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
            onClick={() => setShowNotificationDrawer(true)}
            className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
            title="Open Notifications"
          >
            <Bell className="w-5 h-5 text-indigo-900" />
            {incomingRequest && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Notification Drawer / Modal Overlay */}
      {showNotificationDrawer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-slate-100 animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Worker Notifications</h3>
              </div>
              <button
                onClick={() => setShowNotificationDrawer(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {incomingRequest ? (
              <div className="bg-slate-50 rounded-2xl p-4 border border-indigo-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                    {incomingRequest.status === 'ACCEPTED' ? 'Approved Request' : 'New Incoming Request'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">Just Now</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center">
                    Customer: {incomingRequest.customer || 'Shrey Macwan'}
                    <ShieldCheck className="w-4 h-4 text-emerald-600 ml-1" />
                  </h4>
                  <p className="text-xs text-indigo-700 font-semibold mt-0.5">{incomingRequest.category || 'Plumbing'} Service</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 mr-1 shrink-0" />
                    <span>{incomingRequest.area || 'Navrangpura, Ahmedabad'}</span>
                  </p>
                  <p className="text-xs text-slate-600 font-medium mt-1 flex items-center">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" />
                    <span>{incomingRequest.phone || '+91 98765 43210'}</span>
                  </p>
                </div>

                {incomingRequest.status === 'ACCEPTED' ? (
                  <div className="space-y-2 pt-1">
                    <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl text-xs font-bold text-center border border-emerald-200">
                      ✓ Job Approved! Full household details unlocked.
                    </div>
                    <button
                      onClick={() => {
                        setShowNotificationDrawer(false);
                        if (onNavigateToHouseholdRoute) onNavigateToHouseholdRoute();
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>View Route & Navigate</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={() => {
                        onAcceptRequest(incomingRequest._id || 'req_123');
                        setShowNotificationDrawer(false);
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1 shadow"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve Job</span>
                    </button>
                    <button
                      onClick={() => {
                        onDeclineRequest(incomingRequest._id || 'req_123');
                        setShowNotificationDrawer(false);
                      }}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium">No active job notifications right now.</p>
              </div>
            )}
          </div>
        </div>
      )}

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
                  <RecenterMap center={coordinates} />
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

            {/* Incoming Live Request or Approved Household Details Card */}
            {incomingRequest && (
              incomingRequest.status === 'ACCEPTED' ? (
                <div className="bg-white border-2 border-emerald-500 rounded-2xl p-4 shadow-xl animate-fade-in space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Job Approved • Customer Details
                    </span>
                    <span className="text-xs text-emerald-600 font-bold">0.8 km away</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center">
                      {incomingRequest.customer || 'Shrey Macwan'}
                    </h3>
                    <p className="text-xs text-indigo-600 font-semibold">{incomingRequest.category || 'Plumbing'} Service Required</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center text-slate-700 font-medium">
                      <Phone className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                      <span>Contact Phone: <strong className="text-slate-900">{incomingRequest.phone || '+91 98765 43210'}</strong></span>
                    </div>
                    <div className="flex items-center text-slate-700 font-medium">
                      <MapPin className="w-4 h-4 text-indigo-600 mr-2 shrink-0" />
                      <span>Household Address: <strong className="text-slate-900">{incomingRequest.area || 'Navrangpura, Ahmedabad'}</strong></span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-1">
                    <a
                      href={`tel:${incomingRequest.phone || '+919876543210'}`}
                      className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2.5 px-3 rounded-xl text-xs border border-emerald-200 flex items-center justify-center space-x-1"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Customer</span>
                    </a>
                    <button
                      onClick={() => onNavigateToHouseholdRoute && onNavigateToHouseholdRoute()}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1 shadow"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Go to Route</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-indigo-900 text-white rounded-2xl p-4 shadow-xl border border-indigo-700 animate-pulse-glow">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-indigo-700 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      New Request Received!
                    </span>
                    <span className="text-xs text-emerald-400 font-bold">0.8 km away</span>
                  </div>
                  <h3 className="text-base font-bold mb-1">{incomingRequest.category || 'Plumbing'} Service Required</h3>
                  <p className="text-xs text-indigo-200 mb-1">Customer: <strong className="text-white font-bold">{incomingRequest.customer || 'Shrey Macwan'}</strong></p>
                  <p className="text-xs text-indigo-200 mb-4">Location: {incomingRequest.area || 'Navrangpura, Ahmedabad'}</p>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => onAcceptRequest(incomingRequest._id || 'req_123')}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1 shadow"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve Job</span>
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
              )
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

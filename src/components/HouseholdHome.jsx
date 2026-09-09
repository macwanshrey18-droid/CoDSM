import React, { useState, useEffect } from 'react';
import { Bell, Search, Wrench, Zap, Sparkles, Hammer, Paintbrush, Tv, MapPin, ChevronRight, Home, Clock, UserCheck, ShieldCheck, Crosshair } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

const defaultPinIcon = L.divIcon({
  className: 'custom-pin',
  html: `<div className="w-7 h-7 bg-indigo-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function HouseholdHome({ userProfile, matchedWorker, activeRequest, bookingStatus, onTrackService, onSelectCategory, onNotificationClick, onNavigateToProfile }) {
  const [activeTab, setActiveTab] = useState('home');
  const [showCoopInfoModal, setShowCoopInfoModal] = useState(false);
  const [coordinates, setCoordinates] = useState([23.0225, 72.5714]);
  const [currentAddress, setCurrentAddress] = useState(userProfile?.address || 'Navrangpura, Ahmedabad');
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(30);

  useEffect(() => {
    let interval;
    if (bookingStatus === 'REQUEST_SENT') {
      setTimerSeconds(30);
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [bookingStatus]);

  const detectPreciseLocation = () => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('Geolocation not supported by browser.');
      return;
    }
    setGpsDetecting(true);
    setGpsStatus('Detecting precise device GPS location...');
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
        console.log('Home GPS detection note:', err.message);
        setGpsDetecting(false);
        setGpsStatus('Using default location coordinates.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    detectPreciseLocation();
  }, []);

  const categories = [
    { id: 'plumbing', name: 'Plumbing', icon: Wrench, color: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700' },
    { id: 'electrical', name: 'Electrical', icon: Zap, color: 'bg-indigo-500', bg: 'bg-indigo-50 text-indigo-700' },
    { id: 'cleaning', name: 'Home Cleaning', icon: Sparkles, color: 'bg-sky-500', bg: 'bg-sky-50 text-sky-700' },
    { id: 'carpentry', name: 'Carpentry', icon: Hammer, color: 'bg-amber-500', bg: 'bg-amber-50 text-amber-700' },
    { id: 'painting', name: 'Painting', icon: Paintbrush, color: 'bg-rose-500', bg: 'bg-rose-50 text-rose-700' },
    { id: 'appliance', name: 'Appliance Repair', icon: Tv, color: 'bg-purple-500', bg: 'bg-purple-50 text-purple-700' },
  ];

  const displayName = userProfile?.name || 'User';
  const displayAddress = currentAddress;
  const hasNotification = Boolean(matchedWorker || activeRequest);

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col justify-between overflow-hidden relative">
      <div className="flex-1 p-4 overflow-y-auto space-y-5">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4 pt-1">
          <div
            onClick={() => onNavigateToProfile && onNavigateToProfile()}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              {displayName.slice(0, 2).toUpperCase() || 'HH'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-none group-hover:text-indigo-600 transition-colors">Good Afternoon, {displayName} 👋</h2>
              <span className="text-[11px] text-slate-500 font-medium flex items-center mt-0.5 max-w-[200px] truncate">
                <MapPin className="w-3 h-3 text-indigo-600 mr-0.5 shrink-0" /> <span className="truncate">{displayAddress}</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (onNotificationClick) {
                onNotificationClick();
              } else {
                alert(hasNotification ? 'Worker assigned to your request!' : 'No new notifications');
              }
            }}
            className="relative p-2 bg-white rounded-full text-slate-600 shadow-xs border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Bell className="w-5 h-5 text-indigo-900" />
            {hasNotification && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
            )}
          </button>
        </div>

        {activeTab === 'requests' ? (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">My Service Requests</h3>
              <span className="text-xs font-semibold text-slate-500">
                {activeRequest ? '1 Active Request' : '0 Past Requests'}
              </span>
            </div>

            {/* Active Request Card */}
            {activeRequest ? (
              <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                    {activeRequest.category || 'General Service'}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                    Active
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {matchedWorker ? `Assigned to ${matchedWorker.name}` : 'Searching for local verified worker...'}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{displayAddress}</p>
                </div>
                <button
                  onClick={onNotificationClick}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                >
                  <Clock className="w-4 h-4" />
                  <span>Track Live Progress</span>
                </button>
              </div>
            ) : null}

            {/* Request History */}
            <div className="pt-1">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Request History</h4>
              
              {!activeRequest ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Clock className="w-7 h-7 stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">No Request History Yet</h4>
                    <p className="text-xs text-slate-500 max-w-[220px] mx-auto mt-1">
                      You haven't requested any services yet. All your active and completed bookings will appear here.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors shadow-sm mt-2"
                  >
                    Request a Service Now
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-medium text-center py-4 bg-slate-100/70 rounded-xl border border-slate-200/60">
                  No previous completed requests in history.
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Live Request Status Banners */}
            {bookingStatus === 'REQUEST_SENT' && (
              <div className="bg-indigo-900 text-white rounded-2xl p-4 shadow-xl border border-indigo-700 mb-4 animate-pulse-glow">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-indigo-700 text-indigo-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-1.5 animate-ping"></span>
                    Request Sent
                  </span>
                  <span className="text-xs text-amber-300 font-bold">Pending Approval</span>
                </div>
                <h3 className="text-base font-bold mb-1">Request Sent to {matchedWorker?.name || 'Manoj Chauhan'}</h3>
                <p className="text-xs text-indigo-200 mb-3">
                  Your plumbing service request has been sent. Waiting for worker confirmation from their notification panel...
                </p>
                <div className="bg-indigo-800/80 p-2.5 rounded-xl border border-indigo-700/60 flex items-center justify-between text-xs">
                  <span className="text-indigo-200 font-medium">Worker Status:</span>
                  <span className="font-bold text-amber-300">
                    Awaiting {matchedWorker?.name || 'Manoj Chauhan'} Approval ({Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')})
                  </span>
                </div>
              </div>
            )}

            {bookingStatus === 'ACCEPTED' && (
              <div className="bg-emerald-900 text-white rounded-2xl p-4 shadow-xl border border-emerald-700 mb-4 animate-slide-up">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-emerald-700 text-emerald-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-300" />
                    Request Approved!
                  </span>
                  <span className="text-xs text-emerald-300 font-bold">En Route</span>
                </div>
                <h3 className="text-base font-bold mb-1">{matchedWorker?.name || 'Manoj Chauhan'} Accepted your job and is on his way!</h3>
                <p className="text-xs text-emerald-200 mb-3">
                  The worker has approved your request and has received your address and location details.
                </p>
                <button
                  onClick={() => onTrackService && onTrackService()}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  <span>Track Worker & View Route Map</span>
                </button>
              </div>
            )}

            {/* Search Bar */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center space-x-2 mb-4">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search verified coop services (e.g. pipe repair)..."
                className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none"
              />
            </div>

            {/* Live Precise GPS Location Map Card */}
            <div className="mb-5 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 mr-1" /> My Precise Service Pin
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
                  📍 {coordinates[0].toFixed(4)} N, {coordinates[1].toFixed(4)} E
                </div>
              </div>
            </div>

            {/* Categories Header */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Service Categories</h3>
              <span className="text-[11px] font-bold text-indigo-600">6 Available</span>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-center space-y-2 text-center group"
                  >
                    <div className={`w-11 h-11 rounded-2xl ${cat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Cooperative Trust Banner */}
            <div
              onClick={() => setShowCoopInfoModal(true)}
              className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-lg border border-indigo-700/50 flex items-center justify-between cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all group"
            >
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  100% Cooperative Owned
                </span>
                <h4 className="text-sm font-bold leading-tight mb-1 group-hover:text-indigo-200 transition-colors">Fair Pay & Verified Workers</h4>
                <p className="text-[11px] text-slate-300">Direct digital access to verified local labor.</p>
              </div>
              <ChevronRight className="w-6 h-6 text-indigo-300 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </>
        )}
      </div>

      {/* Cooperative Info Modal */}
      {showCoopInfoModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <button
                onClick={() => setShowCoopInfoModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                100% Cooperative Owned
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-2">Fair Pay & Verified Workers</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                CoDSM connects households directly with local labor cooperatives.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-start space-x-2.5 text-xs">
                <span className="text-sm">🛡️</span>
                <div>
                  <span className="font-bold text-slate-900 block">Zero Commission Gouging</span>
                  <span className="text-[11px] text-slate-500">95%+ of payment goes directly to workers.</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 text-xs">
                <span className="text-sm">📜</span>
                <div>
                  <span className="font-bold text-slate-900 block">Guild & ITI Certified</span>
                  <span className="text-[11px] text-slate-500">Skills & background verified by local trade guilds.</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 text-xs">
                <span className="text-sm">⚖️</span>
                <div>
                  <span className="font-bold text-slate-900 block">Transparent Fair Rates</span>
                  <span className="text-[11px] text-slate-500">Standardized cooperative pricing without surging.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowCoopInfoModal(false);
                if (onSelectCategory) onSelectCategory('plumbing');
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition-all mt-2"
            >
              Book Verified Worker
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="bg-white border-t border-slate-200 px-4 py-2 grid grid-cols-3 gap-1 z-10">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center py-1 rounded-xl transition-colors ${
            activeTab === 'home' ? 'text-indigo-600 font-bold bg-indigo-50/60' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex flex-col items-center py-1 rounded-xl transition-colors ${
            activeTab === 'requests' ? 'text-indigo-600 font-bold bg-indigo-50/60' : 'text-slate-400'
          }`}
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">My Requests</span>
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

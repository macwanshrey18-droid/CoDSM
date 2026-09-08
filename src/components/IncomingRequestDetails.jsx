import React from 'react';
import { ArrowLeft, MapPin, Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

const destinationIcon = L.divIcon({
  className: 'custom-dest-pin',
  html: `<div className="w-7 h-7 bg-emerald-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">🏠</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function IncomingRequestDetails({ request, onApprove, onDecline, onBack }) {
  const req = request || {
    _id: 'req_88492',
    category: 'Plumbing',
    customer: 'Priya S.',
    area: 'Navrangpura, Ahmedabad',
    distance: '0.8 km away',
    time: 'Today, 4:00 PM',
    estimatedPayout: '₹800.00',
  };

  const coordinates = [23.0225, 72.5714];

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col justify-between overflow-y-auto p-4 animate-fade-in">
      <div>
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4 pt-1">
          <button onClick={onBack} className="p-1.5 rounded-full hover:bg-slate-200 text-indigo-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Incoming Request Details</h2>
        </div>

        {/* Small Location Map Preview */}
        <div className="w-full h-36 rounded-2xl overflow-hidden border border-slate-200 shadow-xs mb-4 relative">
          <MapContainer center={coordinates} zoom={15} zoomControl={false} style={{ width: '100%', height: '100%' }}>
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              attribution="&copy; Google Maps India"
            />
            <Marker position={coordinates} icon={destinationIcon} />
          </MapContainer>
          <div className="absolute top-2 left-2 bg-indigo-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow">
            Customer Location • 0.8 km
          </div>
        </div>

        {/* Request Overview Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3 mb-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase">Service</span>
            <span className="text-sm font-extrabold text-indigo-900">{req.category}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase">Customer</span>
            <span className="text-xs font-bold text-slate-800">{req.customer} ({req.area})</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase">Scheduled Time</span>
            <span className="text-xs font-semibold text-slate-800">{req.time}</span>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-xs font-bold text-slate-900 uppercase">Estimated Payout</span>
            <span className="text-lg font-extrabold text-emerald-600">{req.estimatedPayout}</span>
          </div>
        </div>
      </div>

      {/* Approve & Decline Action Buttons */}
      <div className="flex space-x-3 pb-2">
        <button
          onClick={onDecline}
          className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-1"
        >
          <XCircle className="w-4 h-4" />
          <span>Decline</span>
        </button>

        <button
          onClick={onApprove}
          className="flex-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-1"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Approve & Start Route</span>
        </button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Navigation, MapPin, Play, Phone } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';

const workerPinIcon = L.divIcon({
  className: 'custom-w-pin',
  html: `<div className="w-8 h-8 bg-emerald-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs animate-bounce">🛠️</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const destPinIcon = L.divIcon({
  className: 'custom-h-pin',
  html: `<div className="w-8 h-8 bg-indigo-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs">📍</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function RouteToHouseholdMap({ onStartJob }) {
  const workerPos = [23.0280, 72.5800];
  const householdPos = [23.0225, 72.5714];
  const polylineCoords = [workerPos, householdPos];

  return (
    <div className="relative w-full h-full bg-slate-100 flex flex-col overflow-hidden">
      {/* Top Turn-by-Turn Guidance Strip */}
      <div className="absolute top-3 left-3 right-3 bg-slate-900 text-white p-3 rounded-2xl shadow-xl z-20 border border-slate-700 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
          <Navigation className="w-5 h-5 rotate-45" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Turn-by-Turn Route</span>
          <h4 className="text-xs font-bold text-white">In 200m, turn right onto CG Road</h4>
          <p className="text-[10px] text-slate-300">Destination: Navrangpura, Ahmedabad (~4 min)</p>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 w-full relative z-10">
        <MapContainer center={householdPos} zoom={14} zoomControl={false} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            attribution="&copy; Google Maps India"
          />
          <Marker position={workerPos} icon={workerPinIcon}><Popup>Your Position</Popup></Marker>
          <Marker position={householdPos} icon={destPinIcon}><Popup>Customer Household Pin</Popup></Marker>
          <Polyline positions={polylineCoords} color="#10B981" weight={5} />
        </MapContainer>
      </div>

      {/* Bottom Sheet CTA */}
      <div className="bg-white p-4 shadow-2xl border-t border-slate-200 z-20">
        <div className="flex items-center justify-between mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Customer: Priya S.</h4>
            <p className="text-[10px] text-slate-500">Plumbing Repair • 0.8 km</p>
          </div>
          <button className="p-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold flex items-center space-x-1">
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </button>
        </div>

        <button
          onClick={onStartJob}
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Arrived & Start Job</span>
        </button>
      </div>
    </div>
  );
}

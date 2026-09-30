import React from 'react';
import { Plane, Palmtree, Building2, Landmark, Train, CheckCircle2 } from 'lucide-react';
import { HUBS } from '../data/hubsData';

export default function LocationsSection({ onSelectHub }) {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'plane':
        return <Plane className="w-5 h-5 text-teal-600" />;
      case 'palmtree':
        return <Palmtree className="w-5 h-5 text-purple-600" />;
      case 'building':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'landmark':
        return <Landmark className="w-5 h-5 text-indigo-600" />;
      case 'train':
        return <Train className="w-5 h-5 text-purple-600" />;
      default:
        return <Plane className="w-5 h-5 text-purple-600" />;
    }
  };

  const getIconBg = (color) => {
    switch (color) {
      case 'teal':
        return 'bg-teal-50 border-teal-100';
      case 'purple':
        return 'bg-purple-50 border-purple-100';
      case 'blue':
        return 'bg-blue-50 border-blue-100';
      case 'indigo':
        return 'bg-indigo-50 border-indigo-100';
      default:
        return 'bg-purple-50 border-purple-100';
    }
  };

  return (
    <section id="lokasi-hub" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 scroll-mt-24">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
          JANGKAUAN LUAS LAYANAN
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Tersedia di Bandara & Pusat Kota Utama
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pengantaran gratis ke terminal kedatangan dan hotel area perkotaan.
        </p>
      </div>

      {/* 5 Hubs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {HUBS.map((hub) => (
          <div
            key={hub.id}
            onClick={() => onSelectHub && onSelectHub(hub)}
            className="group bg-white rounded-2xl p-4 sm:p-5 border border-purple-100/70 hover:border-purple-300 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-between"
          >
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-3.5 group-hover:scale-110 transition duration-200 ${getIconBg(hub.color)}`}>
                {getIcon(hub.icon)}
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-purple-700 transition">
                {hub.code}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium line-clamp-1">
                {hub.name}
              </p>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-100 w-full flex items-center justify-center">
              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                {hub.status}
              </span>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}

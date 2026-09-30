import React from 'react';
import { Users, Gauge, Fuel, Zap, Star, Shield, ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '../data/fleetData';

export default function FleetSection({ 
  vehicles, 
  activeCategory, 
  setActiveCategory, 
  onSelectVehicle 
}) {
  const formatPrice = (price) => {
    return 'Rp ' + price.toLocaleString('id-ID');
  };

  const getBadgeStyle = (badgeColor) => {
    switch (badgeColor) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <section id="armada" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 scroll-mt-24">
      
      {/* Header and Filter Category Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
            PILIHAN TERFAVORIT
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Armada Siap Jalan Hari Ini
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Semua unit telah melewati 25 titik inspeksi kebersihan dan sanitasi semi-dalam.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-[#0e0c1f] text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Vehicles */}
      {vehicles.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <p className="text-slate-500 font-medium text-sm">
            Tidak ada kendaraan yang sesuai dengan kriteria pencarian atau kategori ini.
          </p>
          <button
            onClick={() => setActiveCategory('Semua')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
          >
            Tampilkan Semua Armada
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((car) => (
            <div
              key={car.id}
              className="group bg-white rounded-2xl border border-slate-200/80 hover:border-purple-300 shadow-sm hover:shadow-xl hover:shadow-purple-900/5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Image Container with Badges */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={car.image}
                    alt={car.name}
                    onError={(e) => {
                      if (car.fallbackImage && e.target.src !== car.fallbackImage) {
                        e.target.src = car.fallbackImage;
                      }
                    }}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-sm backdrop-blur-sm ${getBadgeStyle(car.badgeColor)}`}>
                      {car.badge}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-slate-700 border border-white/60 shadow-sm backdrop-blur-sm">
                      Tahun {car.year}
                    </span>
                  </div>
                </div>

                {/* Car Details */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-purple-700 transition">
                      {car.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-1 mb-4">
                    {car.description}
                  </p>

                  {/* Specs Row */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50/80 rounded-xl border border-slate-100 text-[11px] text-slate-600 font-semibold mb-4">
                    <div className="flex items-center gap-1.5 truncate">
                      <Users className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                      <span className="truncate">{car.seats}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <Gauge className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                      <span className="truncate">{car.transmission}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      {car.fuel.includes('Listrik') ? (
                        <Zap className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Fuel className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                      )}
                      <span className="truncate">{car.fuel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Action Button Footer */}
              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block -mb-0.5">
                      Mulai dari
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-extrabold text-slate-900 tracking-tight">
                        {formatPrice(car.price)}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {car.priceUnit}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectVehicle(car)}
                    className="bg-[#0e0c1f] hover:bg-purple-900 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition duration-150 shadow-sm"
                  >
                    Sewa Sekarang
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </section>
  );
}

import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  Bike, 
  Crown, 
  CheckCircle2, 
  Search,
  ChevronDown
} from 'lucide-react';

export default function BookingWidget({ 
  onSearch, 
  selectedVehicleType, 
  setSelectedVehicleType,
  rentalType,
  setRentalType 
}) {
  const [location, setLocation] = useState('Jakarta (CGK Bandara / Kota)');
  const [pickupDate, setPickupDate] = useState('Kamis, 09:00 WIB');
  const [returnDate, setReturnDate] = useState('Senin, 09:00 WIB (3 Hari)');

  const locations = [
    'Jakarta (CGK Bandara / Kota)',
    'Bali (DPS Ngurah Rai / Kuta)',
    'Surabaya (SUB Juanda / Gubeng)',
    'Yogyakarta (YIA Bandara / Malioboro)',
    'Bandung (BDO / Stasiun WHOOSH)'
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        location,
        rentalType,
        vehicleType: selectedVehicleType,
        pickupDate,
        returnDate
      });
    }
    const fleetSection = document.getElementById('armada');
    if (fleetSection) {
      fleetSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-100/90 shadow-xl shadow-purple-950/5">
        
        {/* Top Header Switch / Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          
          {/* Left Toggle: Lepas Kunci vs Dengan Supir */}
          <div className="inline-flex p-1 bg-slate-100/80 rounded-full border border-slate-200/60 self-start">
            <button
              type="button"
              onClick={() => setRentalType('self')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all ${
                rentalType === 'self'
                  ? 'bg-[#0e0c1f] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lepas Kunci (Self Drive)
            </button>
            <button
              type="button"
              onClick={() => setRentalType('driver')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all ${
                rentalType === 'driver'
                  ? 'bg-[#0e0c1f] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dengan Supir (With Driver)
            </button>
          </div>

          {/* Right Tabs: Mobil, Motor, Luxury VIP */}
          <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedVehicleType('car')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedVehicleType === 'car'
                  ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm'
                  : 'bg-white text-slate-500 border-transparent hover:border-slate-200 hover:text-slate-800'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Mobil</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedVehicleType('motor')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedVehicleType === 'motor'
                  ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm'
                  : 'bg-white text-slate-500 border-transparent hover:border-slate-200 hover:text-slate-800'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Motor</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedVehicleType('luxury')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedVehicleType === 'luxury'
                  ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm'
                  : 'bg-white text-slate-500 border-transparent hover:border-slate-200 hover:text-slate-800'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Luxury VIP</span>
            </button>
          </div>

        </div>

        {/* Inputs Form */}
        <form onSubmit={handleSearchSubmit} className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            
            {/* Input 1: Lokasi Penjemputan */}
            <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 transition group focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-300">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                LOKASI PENJEMPUTAN
              </label>
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer pr-5 appearance-none truncate"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc} className="text-slate-900 font-normal">
                      {loc}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 pointer-events-none" />
              </div>
            </div>

            {/* Input 2: Tanggal & Jam Ambil */}
            <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 transition group focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-300">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                TANGGAL & JAM AMBIL
              </label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-text truncate"
                  placeholder="Kamis, 09:00 WIB"
                />
              </div>
            </div>

            {/* Input 3: Tanggal & Jam Kembali */}
            <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 transition group focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-300">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                TANGGAL & JAM KEMBALI
              </label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-text truncate"
                  placeholder="Senin, 09:00 WIB (3 Hari)"
                />
              </div>
            </div>

            {/* Button: Cari Kendaraan Tersedia */}
            <div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#6320ee] to-[#5113d9] hover:from-[#571ad6] hover:to-[#450ec2] active:scale-[0.98] text-white font-bold text-xs sm:text-sm py-4 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition duration-200"
              >
                <Search className="w-4 h-4" />
                <span>Cari Kendaraan Tersedia</span>
              </button>
            </div>

          </div>
        </form>

        {/* Bottom Status / Guarantee Line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 mt-5 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-medium">
            <div className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gratis Pembatalan s/d 24 Jam</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unit Terawat 2022-2024</span>
            </div>
          </div>

          <div className="text-slate-400 text-[11px] sm:text-right">
            Butuh sewa bulanan? <span className="font-semibold text-purple-700 cursor-pointer hover:underline">Dapatkan diskon perusahaan s/d 30%.</span>
          </div>
        </div>

      </div>
    </div>
  );
}

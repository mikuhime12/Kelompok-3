import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  CreditCard,
  User,
  Phone,
  Car
} from 'lucide-react';

export default function BookingModal({ vehicle, isOpen, onClose, defaultLocation }) {
  if (!isOpen || !vehicle) return null;

  const [days, setDays] = useState(2);
  const [withDriver, setWithDriver] = useState(vehicle.fuel === 'Termasuk Supir');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const driverRate = withDriver && vehicle.fuel !== 'Termasuk Supir' ? 200000 : 0;
  const basePricePerDay = vehicle.price;
  const totalBase = (basePricePerDay + driverRate) * days;
  const discount = Math.round(totalBase * 0.05); // 5% Member cashback
  const grandTotal = totalBase;

  const formatPrice = (p) => 'Rp ' + p.toLocaleString('id-ID');

  const handleConfirm = (e) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      // simulate completed reservation
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-purple-100 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Pemesanan Berhasil Disiapkan!
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Tim concierge AutoLuxe akan segera menghubungi nomor WhatsApp Anda dalam kurun 10 menit untuk konfirmasi penjemputan.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#0e0c1f] text-white py-3 rounded-2xl text-xs font-bold hover:bg-purple-900 transition"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                {vehicle.badge}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                Tahun {vehicle.year}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mb-2">
              {vehicle.name}
            </h3>

            {/* Vehicle preview bar */}
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-5">
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="w-20 h-14 object-cover rounded-xl"
              />
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px]">Tarif Harian</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {formatPrice(vehicle.price)}
                </span>
                <span className="text-slate-400 text-[10px]"> {vehicle.priceUnit}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Nama Pemesan
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <User className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Contoh: Alexander Pratama"
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Nomor WhatsApp
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <Phone className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="tel"
                    required
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Durasi Sewa
                  </label>
                  <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value={1}>1 Hari (24 Jam)</option>
                    <option value={2}>2 Hari</option>
                    <option value={3}>3 Hari</option>
                    <option value={5}>5 Hari</option>
                    <option value={7}>1 Minggu (Diskon 5%)</option>
                    <option value={30}>1 Bulan (Diskon 20%)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Opsi Supir
                  </label>
                  <select
                    value={withDriver ? 'yes' : 'no'}
                    onChange={(e) => setWithDriver(e.target.value === 'yes')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="no">Lepas Kunci (Self-Drive)</option>
                    <option value="yes">+ Supir Ramah (+Rp 200rb/hr)</option>
                  </select>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Sewa ({days} Hari)</span>
                  <span>{formatPrice(basePricePerDay * days)}</span>
                </div>
                {driverRate > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Layanan Supir</span>
                    <span>{formatPrice(driverRate * days)}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Estimasi Cashback Member Plus</span>
                  <span>+{formatPrice(discount)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-dashed border-slate-200">
                  <span>Total Pembayaran</span>
                  <span className="text-purple-700">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-purple-50/60 p-2.5 rounded-xl border border-purple-100">
                <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>Termasuk Proteksi All-Risk & Bebas Biaya Pembatalan s/d 24 Jam.</span>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#6320ee] to-[#5113d9] hover:from-[#571ad6] hover:to-[#450ec2] text-white text-xs sm:text-sm font-bold py-3.5 rounded-2xl shadow-lg shadow-purple-600/25 transition active:scale-[0.98]"
              >
                Konfirmasi & Pesan Sekarang
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

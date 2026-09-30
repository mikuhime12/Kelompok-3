import React, { useState } from 'react';
import { X, Gem, CheckCircle2, Sparkles, Shield, Gift } from 'lucide-react';

export default function MemberModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [registered, setRegistered] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setRegistered(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-purple-100 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {registered ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center mx-auto">
              <Gem className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Selamat Datang di AutoLuxe Plus!
            </h3>
            <p className="text-xs text-slate-500">
              Voucher welcome diskon Rp 150.000 telah dikirimkan ke WhatsApp & Email Anda. Gunakan kode promo <strong className="text-purple-600 font-bold">PLUSFIRST150</strong> saat booking pertama Anda.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-[#0e0c1f] text-white py-3 rounded-2xl text-xs font-bold hover:bg-purple-900 transition"
            >
              Mulai Sewa Armada
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <Gem className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">
                  PROGRAM LOYALITAS
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  AutoLuxe Plus Membership
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Nikmati sewa lepas kunci tanpa deposit tunai, prioritas unit baru 2024, dan cashback 5-10% setiap transaksi.
            </p>

            <ul className="space-y-2 mb-6 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Gratis voucher diskon Rp 150.000 hari ini</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Cashback s/d 10% masuk ke dompet digital</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Bebas uang jaminan deposit tunai</span>
              </li>
            </ul>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap Sesuai KTP"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nomor WhatsApp"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Alamat Email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#6320ee] to-[#5113d9] hover:from-[#571ad6] hover:to-[#450ec2] text-white text-xs font-bold py-3 rounded-2xl shadow-lg shadow-purple-600/25 transition mt-2"
              >
                Daftar Member Plus Gratis
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

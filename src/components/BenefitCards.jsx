import React from 'react';
import { Gem, Zap, ShieldCheck, ChevronRight } from 'lucide-react';

export default function BenefitCards({ onOpenMemberModal }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        
        {/* Card 1: Member Plus */}
        <div 
          onClick={onOpenMemberModal}
          className="group relative bg-white/90 hover:bg-white rounded-2xl p-5 border border-purple-100/70 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover:scale-105 transition">
              <Gem className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100 tracking-wide">
              Cashback
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              MEMBER PLUS
            </span>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-purple-700 transition">
              Plus Tier
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              5-10% Cashback Tiap Rental
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-0.5 transition">
            <span>Gabung</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </div>
        </div>

        {/* Card 2: Garansi Penjemputan */}
        <div className="group relative bg-white/90 hover:bg-white rounded-2xl p-5 border border-purple-100/70 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition">
              <Zap className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 tracking-wide">
              Serba Cepat
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              GARANSI PENJEMPUTAN UNIT
            </span>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition">
              &lt; 45 Menit di Bandara
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gratis antar jemput Terminal 1-3
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-slate-700 group-hover:text-purple-700 transition">
            <span>Lihat Rute</span>
          </div>
        </div>

        {/* Card 3: Proteksi Perjalanan */}
        <div className="group relative bg-white/90 hover:bg-white rounded-2xl p-5 border border-purple-100/70 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 tracking-wide">
              ALL RISK
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              PROTEKSI PERJALANAN
            </span>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition">
              Perlindungan Penuh
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              0% Biaya Kejadian Kecil
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-medium text-slate-400">
            <span>Bantuan 24/7 Terawat</span>
          </div>
        </div>

      </div>
    </section>
  );
}

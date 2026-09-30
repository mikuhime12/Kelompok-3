import React from 'react';
import { Star, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';

export default function TrustStats() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
      <div className="bg-white rounded-3xl p-7 sm:p-9 border border-purple-100/80 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          
          {/* Metric 1: Rating */}
          <div className="pt-6 sm:pt-0 sm:pr-4 first:pt-0">
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                4.9 / 5.0
              </span>
            </div>
            
            {/* Stars */}
            <div className="flex items-center gap-1 text-amber-400 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <p className="text-xs font-bold text-slate-700">
              Dari 15.000+ Ulasan Pengguna
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Terverifikasi di Google & Traveloka
            </p>
          </div>

          {/* Metric 2: Armada Sendiri */}
          <div className="pt-6 sm:pt-0 sm:px-6">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight block mb-1">
              250+ Unit
            </span>
            <p className="text-xs font-bold text-slate-800 mb-1">
              Armada Milik Sendiri
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Bukan perantara lepas, kondisi mesin selalu dalam pengawasan tim teknis internal.
            </p>
          </div>

          {/* Metric 3: Bebas Asap */}
          <div className="pt-6 sm:pt-0 sm:px-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                100%
              </span>
              <span className="text-xs font-extrabold text-slate-900">
                Bebas Asap
              </span>
            </div>

            <div className="mb-1.5">
              <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Non-Smoking Policy
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Interior segar, higienis terjamin, dan denda ketat diberlakukan bila terbukti disalahgunakan.
            </p>
          </div>

          {/* Metric 4: 24/7 Hotline */}
          <div className="pt-6 sm:pt-0 sm:pl-6">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight block mb-1">
              24/7 Hotline
            </span>
            <p className="text-xs font-bold text-slate-800 mb-1">
              Roadside Assistance
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Bantuan mekanik & mobil serep darurat siap sedia kapan pun Anda membutuhkan.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

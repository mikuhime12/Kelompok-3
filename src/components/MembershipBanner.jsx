import React from 'react';
import { Sparkles, ArrowRight, Gem, ShieldCheck, CreditCard } from 'lucide-react';

export default function MembershipBanner({ onOpenRegister }) {
  return (
    <section id="member-plus" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 scroll-mt-24">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#120e29] via-[#1a143d] to-[#0f0b24] p-8 sm:p-12 border border-purple-900/40 shadow-2xl">
        
        {/* Background ambient lighting effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text & CTA */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-700/50 text-purple-200 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Program Loyalitas AutoLuxe Plus</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Sewa Tanpa Deposit Tunai & Nikmati Cashback s/d 10% Setiap Pemesanan
            </h2>

            <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed mb-8 max-w-xl">
              Daftar gratis hari ini dan dapatkan welcome voucher potongan Rp 150.000 untuk perjalanan pertama Anda di seluruh Indonesia.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onOpenRegister}
                className="bg-white hover:bg-slate-100 text-slate-950 font-bold px-6 py-3 rounded-full text-xs sm:text-sm shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Daftar Jadi Member Plus
              </button>

              <button
                type="button"
                onClick={onOpenRegister}
                className="text-xs sm:text-sm font-bold text-purple-200 hover:text-white inline-flex items-center gap-1.5 transition group"
              >
                <span>Pelajari Keuntungan</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

          {/* Right Floating VIP Black Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-sm rounded-2xl p-6 bg-gradient-to-br from-[#1c183b]/90 via-[#26214f]/80 to-[#14112b]/95 border border-purple-500/30 backdrop-blur-xl shadow-2xl shadow-purple-950/50 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              
              {/* Card glossy shimmer */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold tracking-widest text-slate-200 uppercase">
                    AUTOLUXE BLACK
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
                  <Gem className="w-4 h-4 text-purple-300" />
                </div>
              </div>

              {/* Card Number */}
              <div className="text-base sm:text-lg font-mono font-bold tracking-widest text-white/90 mb-8 select-none">
                •••• &nbsp;•••• &nbsp;•••• &nbsp;8859
              </div>

              {/* Card Bottom Meta */}
              <div className="flex items-end justify-between border-t border-purple-800/40 pt-4">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-purple-300/60 block">
                    MEMBER NAME
                  </span>
                  <span className="text-xs font-bold text-white tracking-wider">
                    ALEXANDER PRATAMA
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-purple-300/60 block">
                    SALDO CASHBACK
                  </span>
                  <span className="text-sm font-extrabold text-emerald-400 tracking-tight">
                    Rp 450.000
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

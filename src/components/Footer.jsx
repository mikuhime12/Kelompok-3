import React from 'react';
import { ShieldCheck, MessageCircle } from 'lucide-react';

export default function Footer({ onSelectCategory }) {
  return (
    <footer className="bg-white border-t border-purple-100/70 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">

          {/* Col 1: Brand Info (span 2 on lg) */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6320ee] to-[#8d42ff] flex items-center justify-center text-white shadow-sm">
                <span className="font-extrabold text-base tracking-tight">Ca</span>
              </div>
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                AutoLuxe Indonesia
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mb-6">
              Platform persewaan kendaraan mobil dan motor dengan standar kenyamanan eksekutif, fleksibilitas tinggi, dan kepastian unit terlengkap di Indonesia.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5">
              <a
                href="#facebook"
                aria-label="Facebook AutoLuxe"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-purple-100 hover:text-purple-600 text-slate-600 flex items-center justify-center transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z" />
                </svg>
              </a>
              <a
                href="#instagram"
                aria-label="Instagram AutoLuxe"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-purple-100 hover:text-purple-600 text-slate-600 flex items-center justify-center transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="#twitter"
                aria-label="X Twitter AutoLuxe"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-purple-100 hover:text-purple-600 text-slate-600 flex items-center justify-center transition"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://wa.me/6281234567890"
                aria-label="WhatsApp AutoLuxe"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-emerald-100 hover:text-emerald-600 text-slate-600 flex items-center justify-center transition"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Layanan Kami */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4">
              LAYANAN KAMI
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <a href="#armada" className="hover:text-purple-600 transition">
                  Sewa Lepas Kunci
                </a>
              </li>
              <li>
                <a href="#armada" className="hover:text-purple-600 transition">
                  Sewa Dengan Supir
                </a>
              </li>
              <li>
                <a href="#lokasi-hub" className="hover:text-purple-600 transition">
                  Antar Jemput Bandara
                </a>
              </li>
              <li>
                <a
                  href="#armada"
                  onClick={() => onSelectCategory && onSelectCategory('Sewa Motor')}
                  className="hover:text-purple-600 transition"
                >
                  Rental Motor Harian
                </a>
              </li>
              <li>
                <a href="#member-plus" className="hover:text-purple-600 transition">
                  Sewa Mobil Bulanan / Korporat
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Destinasi Hub */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4">
              DESTINASI HUB
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <a href="#lokasi-hub" className="hover:text-purple-600 transition">
                  Jakarta & Tangerang
                </a>
              </li>
              <li>
                <a href="#lokasi-hub" className="hover:text-purple-600 transition">
                  Bali (Kuta, Seminyak, Canggu)
                </a>
              </li>
              <li>
                <a href="#lokasi-hub" className="hover:text-purple-600 transition">
                  Surabaya & Malang
                </a>
              </li>
              <li>
                <a href="#lokasi-hub" className="hover:text-purple-600 transition">
                  Yogyakarta & Solo
                </a>
              </li>
              <li>
                <a href="#lokasi-hub" className="hover:text-purple-600 transition">
                  Bandung & Lembang
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Dukungan & Legal */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4">
              DUKUNGAN & LEGAL
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <a href="#" className="hover:text-purple-600 transition">
                  Syarat & Ketentuan Rental
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-600 transition">
                  Klaim Asuransi All-Risk
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-600 transition">
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a href="https://wa.me/6281234567890" className="hover:text-purple-600 transition">
                  Pusat Bantuan WhatsApp 24/7
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-600 transition">
                  Karir & Kemitraan Armada
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © 2024 PT AutoLuxe Mobilitas Nusantara. Seluruh hak cipta dilindungi.
          </div>

          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pembayaran Aman ISO 27001 | BCA • Mandiri • BRI • QRIS • Visa/Mastercard</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

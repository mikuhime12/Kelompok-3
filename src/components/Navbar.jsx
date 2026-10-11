import { useState } from 'react';
import { Headphones, Menu, X, LogOut, CarFront } from 'lucide-react';

export default function Navbar({ onOpenBooking, onSelectCategory, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#faf9fe]/90 backdrop-blur-md border-b border-purple-100/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-2xl bg-[#173c35] flex items-center justify-center text-[#d5f36a]">
              <CarFront className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">Rent-Go</span>
              </div>
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase -mt-1">
                RENTAL KENDARAAN
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            <a 
              href="#armada"
              className="text-sm font-semibold text-slate-700 hover:text-purple-700 transition"
              onClick={() => onSelectCategory && onSelectCategory('Semua')}
            >
              Armada
            </a>
            <a 
              href="#armada" 
              className="text-sm font-semibold text-slate-700 hover:text-purple-700 transition"
              onClick={() => onSelectCategory && onSelectCategory('Sewa Motor')}
            >
              Sewa Motor
            </a>
            <a 
              href="#armada" 
              className="text-sm font-semibold text-slate-700 hover:text-purple-700 transition"
              onClick={() => onSelectCategory && onSelectCategory('Semua')}
            >
              Sewa Mobil
            </a>
            <a 
              href="#lokasi-hub" 
              className="text-sm font-semibold text-slate-700 hover:text-purple-700 transition"
            >
              Lokasi Hub
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-5">
            <a 
              href="https://wa.me/6281234567890" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-purple-700 transition"
            >
              <Headphones className="w-3.5 h-3.5 text-purple-600" />
              <span>Bantuan</span>
            </a>

            <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-800 transition px-2 py-1.5">
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>

            <button
              type="button"
              onClick={onOpenBooking}
              className="bg-[#173c35] hover:bg-[#20564b] active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-200"
            >
              Sewa Sekarang
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={onOpenBooking}
              className="bg-[#173c35] text-white text-xs font-bold px-3 py-2 rounded-full"
            >
              Sewa
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-100/80 space-y-3 bg-white/95 backdrop-blur-lg rounded-b-2xl px-4 shadow-xl">
            <a
              href="#armada"
              onClick={() => {
                setMobileMenuOpen(false);
                onSelectCategory && onSelectCategory('Semua');
              }}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-purple-700"
            >
              Armada
            </a>
            <a
              href="#armada"
              onClick={() => {
                setMobileMenuOpen(false);
                onSelectCategory && onSelectCategory('Sewa Motor');
              }}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-purple-700"
            >
              Sewa Motor
            </a>
            <a
              href="#armada"
              onClick={() => {
                setMobileMenuOpen(false);
                onSelectCategory && onSelectCategory('Semua');
              }}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-purple-700"
            >
              Sewa Mobil
            </a>
            <a
              href="#lokasi-hub"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-purple-700"
            >
              Lokasi Hub
            </a>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href="https://wa.me/6281234567890"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"
              >
                <Headphones className="w-3.5 h-3.5 text-purple-600" />
                <span>Bantuan 24/7</span>
              </a>
              <button type="button" onClick={onLogout} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200">
                <LogOut className="w-3.5 h-3.5" /> Keluar
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

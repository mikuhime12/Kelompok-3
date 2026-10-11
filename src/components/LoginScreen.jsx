import { useState } from 'react';
import { ArrowRight, CarFront, KeyRound, Mail } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin();
  };

  return (
    <main className="min-h-screen bg-[#f4f5ef] p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl min-h-[620px] grid lg:grid-cols-[1.05fr_0.95fr] bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-950/10">
        <section className="relative min-h-[270px] lg:min-h-full bg-[#173c35] text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=85"
            alt="Mobil siap disewa"
            className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#173c35]/95 via-[#173c35]/70 to-[#173c35]/20" />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#d5f36a] text-[#173c35] flex items-center justify-center">
              <CarFront className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black">Rent-Go</span>
          </div>
          <div className="relative max-w-md py-10 lg:py-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d5f36a] mb-4">Rental mobil & motor</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">Perjalananmu, pilih kendaraanmu.</h1>
            <p className="text-sm text-white/75 leading-relaxed">Temukan kendaraan yang pas untuk jalan hari ini. Masuk untuk melihat armada dan mulai menyewa.</p>
          </div>
          <p className="relative text-xs text-white/55">© 2026 Rent-Go</p>
        </section>

        <section className="p-7 sm:p-12 lg:p-14 flex flex-col justify-center">
          <div className="w-12 h-1 bg-[#d5f36a] rounded-full mb-8" />
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-800 mb-3">Selamat datang</p>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Masuk ke Rent-Go</h2>
          <p className="text-sm text-slate-500 mb-8">Masuk untuk melanjutkan ke layanan rental kendaraan.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="block text-xs font-bold text-slate-700 mb-2">Email</span>
              <span className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 h-12 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/10">
                <Mail className="w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nama@email.com"
                  className="w-full text-sm outline-none placeholder:text-slate-400"
                />
              </span>
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-slate-700 mb-2">Kata sandi</span>
              <span className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 h-12 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/10">
                <KeyRound className="w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full text-sm outline-none placeholder:text-slate-400"
                />
              </span>
            </label>
            <button type="submit" className="w-full h-12 rounded-xl bg-[#173c35] hover:bg-[#20564b] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors">
              Masuk <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[11px] text-slate-400 mt-6 leading-relaxed">Tampilan demo front end. Form ini belum terhubung ke sistem akun.</p>
        </section>
      </div>
    </main>
  );
}

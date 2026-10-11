import { Search, ArrowRight } from 'lucide-react';

export default function Hero({ searchQuery, setSearchQuery, onSearchSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit();
    const fleetSection = document.getElementById('armada');
    if (fleetSection) {
      fleetSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-8 pb-10 sm:pt-14 sm:pb-12 text-center">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-purple-200/40 via-purple-100/20 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-[#110e2d] tracking-tight leading-[1.14] mb-5">
          Sewa Mobil dan Motor <br className="hidden sm:inline" />
          dengan Mudah
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-slate-500 text-xs sm:text-sm md:text-[15px] leading-relaxed mb-8">
          Pilih kendaraan yang sesuai kebutuhan, tentukan jadwal sewa, lalu pesan langsung dari Rent-Go.
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto">
          <form 
            onSubmit={handleSubmit}
            className="relative flex items-center bg-white rounded-full border border-purple-100/80 shadow-lg shadow-purple-900/5 p-1.5 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-300 transition-all"
          >
            <div className="pl-4 pr-2 text-slate-400">
              <Search className="w-4 h-4 text-slate-400" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari mobil atau motor..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none py-2"
            />

            <button
              type="submit"
              aria-label="Cari armada"
              className="w-9 h-9 flex-shrink-0 rounded-full bg-[#0e0c1f] hover:bg-purple-900 active:scale-95 text-white flex items-center justify-center transition shadow-md"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}

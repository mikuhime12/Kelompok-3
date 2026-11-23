import { useEffect } from 'react';
import { CalendarClock, CarFront, CheckCircle2, Clock3, Phone, User, X } from 'lucide-react';

export default function HistoryModal({ isOpen, onClose, history }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);

  const formatDate = (isoDate) =>
    new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(isoDate));

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
        className="w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[82vh] bg-white sm:rounded-3xl rounded-t-3xl border border-purple-100 shadow-2xl overflow-hidden flex flex-col"
      >
        <header className="px-5 sm:px-7 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-purple-600 mb-1">
              Aktivitas Sewa
            </p>
            <h2 id="history-title" className="text-xl sm:text-2xl font-extrabold text-slate-900">
              History Pemesanan
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Tutup history"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="overflow-y-auto p-4 sm:p-7">
          {history.length === 0 ? (
            <div className="py-14 px-5 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-purple-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CalendarClock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 mb-1">Belum ada riwayat pemesanan</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Pemesanan yang berhasil dikonfirmasi akan otomatis muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((booking) => (
                <article
                  key={booking.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-purple-200 transition"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {booking.vehicleImage ? (
                      <img
                        src={booking.vehicleImage}
                        alt={booking.vehicleName}
                        className="w-20 h-16 sm:w-24 sm:h-20 object-cover rounded-xl bg-slate-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <CarFront className="w-6 h-6" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                            {booking.vehicleType === 'motor' ? 'Rental Motor' : 'Rental Mobil'}
                          </p>
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                            {booking.vehicleName}
                          </h3>
                        </div>
                        <span className="hidden sm:inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 text-[10px] font-bold">
                          <Clock3 className="w-3 h-3" />
                          {booking.status}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <User className="w-3 h-3 text-purple-500 flex-shrink-0" />
                          <span className="truncate">{booking.customerName}</span>
                        </span>
                        <span className="flex items-center gap-1.5 min-w-0">
                          <Phone className="w-3 h-3 text-purple-500 flex-shrink-0" />
                          <span className="truncate">{booking.customerPhone}</span>
                        </span>
                        <span>{booking.days} hari{booking.withDriver ? ' + supir' : ''}</span>
                        <span className="font-extrabold text-slate-900 text-right">
                          {formatPrice(booking.total)}
                        </span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
                        <span className="inline-flex sm:hidden items-center gap-1 text-[9px] font-bold text-amber-700">
                          <Clock3 className="w-3 h-3" />
                          {booking.status}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-auto">
                          {formatDate(booking.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <footer className="px-5 sm:px-7 py-3 border-t border-slate-100 bg-slate-50/60">
            <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Riwayat tersimpan di perangkat ini
            </p>
          </footer>
        )}
      </section>
    </div>
  );
}

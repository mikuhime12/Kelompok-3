import { useEffect, useState } from 'react';
import { MapPin, Palmtree, Building2, Landmark, Train, ExternalLink } from 'lucide-react';
// [TAMBAHAN BELAJAR] Leaflet adalah mesin peta; React-Leaflet menyediakan komponen React-nya.
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { HUBS } from '../data/hubsData';
import { apiFetch } from '../lib/api';

// [TAMBAHAN BELAJAR] Atur asset marker Leaflet agar ikon pin tetap tampil saat dibundel Vite.
const locationMarker = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function LocationsSection({ onSelectHub }) {
  const [hubs, setHubs] = useState(HUBS);
  const [usingFallback, setUsingFallback] = useState(false);
  const [mapStates, setMapStates] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    apiFetch('/api/locations', { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !Array.isArray(result.data) || result.data.length === 0) {
          throw new Error(result.error?.message || 'Lokasi gagal dimuat.');
        }
        setHubs(result.data);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setUsingFallback(true);
      });

    return () => controller.abort();
  }, []);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'palmtree': return <Palmtree className="w-5 h-5 text-purple-600" />;
      case 'building': return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'landmark': return <Landmark className="w-5 h-5 text-indigo-600" />;
      case 'train': return <Train className="w-5 h-5 text-purple-600" />;
      default: return <MapPin className="w-5 h-5 text-purple-600" />;
    }
  };

  const getIconBg = (color) => {
    switch (color) {
      case 'teal': return 'bg-teal-50 border-teal-100';
      case 'purple': return 'bg-purple-50 border-purple-100';
      case 'blue': return 'bg-blue-50 border-blue-100';
      case 'indigo': return 'bg-indigo-50 border-indigo-100';
      default: return 'bg-purple-50 border-purple-100';
    }
  };

  const loadMap = async (hubId) => {
    setMapStates((current) => ({ ...current, [hubId]: { loading: true } }));
    try {
      // [TAMBAHAN BELAJAR] Minta koordinat dan konfigurasi tile dari endpoint backend.
      const response = await apiFetch(`/api/locations/${encodeURIComponent(hubId)}/map`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'Peta gagal dimuat.');
      setMapStates((current) => ({ ...current, [hubId]: { data: result.data.map } }));
    } catch (error) {
      setMapStates((current) => ({ ...current, [hubId]: { error: error.message } }));
    }
  };

  return (
    <section id="lokasi-hub" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
          JANGKAUAN LUAS LAYANAN
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Lokasi Rental Rent-Go
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pilih kota untuk melihat ketersediaan kendaraan rental.
        </p>
        {usingFallback && (
          <p className="text-xs text-amber-700 mt-2" role="status">
            Data lokasi backend kosong atau tidak tersambung. Menampilkan data contoh.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {hubs.map((hub) => {
          const mapState = mapStates[hub.id];
          return (
            <article
              key={hub.id}
              className="group bg-white rounded-2xl p-4 sm:p-5 border border-purple-100/70 hover:border-purple-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center text-center"
            >
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-3.5 group-hover:scale-110 transition duration-200 ${getIconBg(hub.color)}`}>
                  {getIcon(hub.icon)}
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-purple-700 transition">
                  {hub.code}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium line-clamp-1">
                  {hub.name}
                </p>
              </div>

              <span className="mt-4 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                {hub.status}
              </span>

              <button
                type="button"
                onClick={() => onSelectHub?.(hub)}
                className="mt-3 text-xs font-bold text-slate-600 hover:text-purple-700"
              >
                Pilih kota
              </button>
              <button
                type="button"
                onClick={() => loadMap(hub.id)}
                disabled={mapState?.loading}
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 disabled:opacity-60"
              >
                <MapPin className="w-3.5 h-3.5" />
                {mapState?.loading ? 'Memuat peta…' : 'Lihat peta'}
              </button>

              {mapState?.data && (
                <div className="mt-3 w-full text-left text-[10px] text-slate-500">
                  {/* [TAMBAHAN BELAJAR] MapContainer menampilkan peta, TileLayer menggambar OSM,
                      Marker memberi pin, dan Popup menampilkan keterangan saat pin diklik. */}
                  <MapContainer
                    key={hub.id}
                    center={[mapState.data.latitude, mapState.data.longitude]}
                    zoom={12}
                    scrollWheelZoom={false}
                    className="h-36 w-full rounded-xl border border-slate-200 z-0"
                  >
                    <TileLayer
                      url={mapState.data.tileUrl}
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
                    />
                    <Marker
                      position={[mapState.data.latitude, mapState.data.longitude]}
                      icon={locationMarker}
                    >
                      <Popup>{hub.code} — titik perkiraan pusat kota</Popup>
                    </Marker>
                  </MapContainer>
                  <p className="mt-2">Titik perkiraan pusat kota</p>
                  <a
                    href={mapState.data.openStreetMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 font-bold text-purple-700 hover:underline"
                  >
                    Buka OpenStreetMap <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {mapState?.error && (
                <p className="mt-2 text-[10px] text-red-600" role="status">
                  {mapState.error}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

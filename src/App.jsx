import { useEffect, useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import LoginScreen from './components/LoginScreen';
import Hero from './components/Hero';
import BookingWidget from './components/BookingWidget';
import FleetSection from './components/FleetSection';
import LocationsSection from './components/LocationsSection';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import HistoryModal from './components/HistoryModal';
import { VEHICLES } from './data/fleetData';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('rent-go-theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [rentalType, setRentalType] = useState('self'); // 'self' | 'driver'
  const [selectedVehicleType, setSelectedVehicleType] = useState('car');
  
  // Modals state
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState(null);
  const [activeLocation, setActiveLocation] = useState('Jakarta');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [bookingHistory, setBookingHistory] = useState(() => {
    try {
      const savedHistory = localStorage.getItem('rent-go-booking-history');
      if (!savedHistory) return [];
      const parsedHistory = JSON.parse(savedHistory);
      return Array.isArray(parsedHistory) ? parsedHistory : [];
    } catch {
      return [];
    }
  });

  const saveBookingHistory = (booking) => {
    setBookingHistory((currentHistory) => {
      const nextHistory = [booking, ...currentHistory];
      localStorage.setItem('rent-go-booking-history', JSON.stringify(nextHistory));
      return nextHistory;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';
    localStorage.setItem('rent-go-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((currentMode) => !currentMode);

  // Filter vehicles based on active category, vehicle type tab, and search query
  const filteredVehicles = useMemo(() => {
    return VEHICLES.filter((vehicle) => {
      // The "Semua" fleet tab includes every vehicle type.
      if (activeCategory !== 'Semua') {
        if (selectedVehicleType === 'motor' && vehicle.type !== 'motor') {
          return false;
        }
        if (selectedVehicleType === 'car' && vehicle.type === 'motor') {
          return false;
        }
      }

      // 2. Fleet category tab filter
      if (activeCategory === 'Mobil' && (vehicle.type === 'motor' || vehicle.category === 'Mobil Listrik (EV)')) {
        return false;
      }
      if (activeCategory === 'Mobil Listrik' && vehicle.category !== 'Mobil Listrik (EV)') {
        return false;
      }
      if (activeCategory === 'Motor' && vehicle.type !== 'motor') {
        return false;
      }

      // 3. Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = vehicle.name.toLowerCase().includes(q);
        const matchesDesc = vehicle.description.toLowerCase().includes(q);
        const matchesCat = vehicle.category.toLowerCase().includes(q);
        const matchesFuel = vehicle.fuel.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat && !matchesFuel) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, activeCategory, selectedVehicleType]);

  const handleBookingSearch = (searchData) => {
    setSelectedVehicleType(searchData.vehicleType);
    if (searchData.vehicleType === 'motor') {
      setRentalType('self');
    }
    setActiveCategory(searchData.vehicleType === 'motor' ? 'Motor' : 'Mobil');
    setActiveLocation(searchData.location);
  };

  const handleSelectHub = (hub) => {
    setActiveLocation(hub.city);
    const bookingWidget = document.getElementById('booking-widget');
    if (bookingWidget) {
      bookingWidget.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectNavCategory = (category) => {
    if (category === 'Sewa Motor') {
      setSelectedVehicleType('motor');
      setRentalType('self');
      setActiveCategory('Motor');
    } else {
      setSelectedVehicleType('car');
      setActiveCategory(category);
    }
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={() => setIsLoggedIn(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9fe] text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900 flex flex-col">
      {/* Top Navigation */}
      <Navbar 
        onSelectCategory={handleSelectNavCategory}
        onLogout={() => setIsLoggedIn(false)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={bookingHistory.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <main className="flex-grow">
        {/* Hero Section */}
        <Hero 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={() => {}}
        />

        {/* Main Booking Search Widget */}
        <div id="booking-widget">
          <BookingWidget 
            rentalType={rentalType}
            setRentalType={setRentalType}
            selectedVehicleType={selectedVehicleType}
            setSelectedVehicleType={(type) => {
              setSelectedVehicleType(type);
              if (type === 'motor') {
                setRentalType('self');
                setActiveCategory('Motor');
              } else if (activeCategory === 'Motor') {
                setActiveCategory('Mobil');
              }
            }}
            onSearch={handleBookingSearch}
          />
        </div>

        {/* Fleet Showcase Grid */}
        <FleetSection 
          vehicles={filteredVehicles}
          activeCategory={activeCategory}
          setActiveCategory={(category) => {
            setSelectedVehicleType(category === 'Motor' ? 'motor' : 'car');
            if (category === 'Motor') {
              setRentalType('self');
            }
            setActiveCategory(category);
          }}
          onSelectVehicle={(car) => setSelectedVehicleForBooking(car)}
        />

        {/* Location Hubs */}
        <LocationsSection 
          onSelectHub={handleSelectHub}
        />

      </main>

      {/* Footer */}
      <Footer onSelectCategory={handleSelectNavCategory} />

      {/* Booking Interactive Modal */}
      <BookingModal 
        key={`${selectedVehicleForBooking?.id ?? 'closed'}-${Boolean(selectedVehicleForBooking)}`}
        vehicle={selectedVehicleForBooking}
        isOpen={!!selectedVehicleForBooking}
        onClose={() => setSelectedVehicleForBooking(null)}
        defaultLocation={activeLocation}
        onConfirm={saveBookingHistory}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={bookingHistory}
      />

    </div>
  );
}

import { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import LoginScreen from './components/LoginScreen';
import Hero from './components/Hero';
import BookingWidget from './components/BookingWidget';
import FleetSection from './components/FleetSection';
import LocationsSection from './components/LocationsSection';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import { VEHICLES } from './data/fleetData';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [rentalType, setRentalType] = useState('self'); // 'self' | 'driver'
  const [selectedVehicleType, setSelectedVehicleType] = useState('car');
  
  // Modals state
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState(null);
  const [activeLocation, setActiveLocation] = useState('Jakarta');

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
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#faf9fe] text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900 flex flex-col">
      {/* Top Navigation */}
      <Navbar 
        onSelectCategory={handleSelectNavCategory}
        onLogout={() => setIsLoggedIn(false)}
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
      />

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Zap, Calendar } from 'lucide-react';

interface MapPin {
  id: string;
  type: 'practice' | 'event';
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
  intensity?: string;
  time: string;
}

const Map: React.FC = () => {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [userLocation, setUserLocation] = useState({ lat: 35.6762, lng: 139.6503 }); // Tokyo

  useEffect(() => {
    // Mock map pins
    const mockPins: MapPin[] = [
      {
        id: 'p1',
        type: 'practice',
        lat: 35.6762 + Math.random() * 0.01,
        lng: 139.6503 + Math.random() * 0.01,
        title: 'Morning Easy Run',
        subtitle: '8.5km • 4:42/km',
        intensity: 'easy',
        time: '2h ago'
      },
      {
        id: 'p2',
        type: 'practice',
        lat: 35.6762 + Math.random() * 0.01,
        lng: 139.6503 + Math.random() * 0.01,
        title: 'Tempo Workout',
        subtitle: '12km • 5:00/km',
        intensity: 'hard',
        time: '4h ago'
      },
      {
        id: 'e1',
        type: 'event',
        lat: 35.6762 + Math.random() * 0.01,
        lng: 139.6503 + Math.random() * 0.01,
        title: 'Group 10K Run',
        subtitle: 'Tomorrow 7:00 AM',
        time: 'upcoming'
      }
    ];
    setPins(mockPins);
  }, []);

  const getPinColor = (pin: MapPin) => {
    if (pin.type === 'event') {
      return 'bg-yellow-500 border-yellow-600';
    }
    
    switch (pin.intensity) {
      case 'easy':
        return 'bg-green-500 border-green-600';
      case 'moderate':
        return 'bg-blue-500 border-blue-600';
      case 'hard':
      case 'workout':
        return 'bg-orange-500 border-orange-600';
      case 'race':
        return 'bg-red-500 border-red-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const getPinIcon = (pin: MapPin) => {
    return pin.type === 'event' ? Calendar : Zap;
  };

  return (
    <div className="relative h-screen bg-gray-100">
      {/* Mock Map Container */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        {/* Map Grid Pattern */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* User Location */}
        <div 
          className="absolute w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg z-20"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
        </div>

        {/* Map Pins */}
        {pins.map((pin, index) => {
          const offsetX = (pin.lng - userLocation.lng) * 8000; // Mock conversion
          const offsetY = (userLocation.lat - pin.lat) * 8000; // Mock conversion
          const Icon = getPinIcon(pin);
          
          return (
            <button
              key={pin.id}
              onClick={() => setSelectedPin(pin)}
              className={`absolute w-10 h-10 ${getPinColor(pin)} border-2 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform z-10`}
              style={{
                left: `calc(50% + ${offsetX}px)`,
                top: `calc(50% + ${offsetY}px)`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-30">
        <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Navigation size={18} className="text-gray-700" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-20 left-4 bg-white rounded-lg shadow-lg p-3 z-30">
        <div className="text-sm font-medium text-gray-900 mb-2">Legend</div>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Easy runs</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Hard workouts</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Events</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span>Your location</span>
          </div>
        </div>
      </div>

      {/* Selected Pin Details */}
      {selectedPin && (
        <div className="absolute bottom-20 right-4 left-4 bg-white rounded-xl shadow-lg p-4 z-30">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{selectedPin.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedPin.subtitle}</p>
              <p className="text-xs text-gray-500 mt-1">{selectedPin.time}</p>
            </div>
            <button
              onClick={() => setSelectedPin(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>
          
          <div className="flex space-x-2 mt-3">
            {selectedPin.type === 'practice' ? (
              <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors">
                Join Next Time
              </button>
            ) : (
              <button className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium hover:bg-yellow-100 transition-colors">
                Join Event
              </button>
            )}
            <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
              View Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
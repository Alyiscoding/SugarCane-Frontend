import React, { useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LocateFixed, Search, MapPin, Globe, Map as MapIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// Fix default marker icon issue in leaflet
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

const TILE_LAYERS = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    labelUrl: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
  },
  vector: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: "&copy; <a href='https://carto.com/attributions'>CARTO</a>",
  },
};

const currentLocationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function FlyToLocation({ position }) {
  const map = useMap();
  React.useEffect(() => {
    if (position) map.flyTo(position, 4);
  }, [position, map]);
  return null;
}

function MapInfoCard({ position, zoom, mapStyle }) {
  return (
    <Card className="absolute bottom-4 left-4 z-[1000] bg-white/80 backdrop-blur-md shadow-lg rounded-xl px-4 py-2 text-xs md:text-sm flex flex-col gap-1">
      <div className="flex items-center gap-1 text-green-700 font-semibold">
        <MapPin className="w-4 h-4" />
        Lat: {position[0].toFixed(5)}, Lon: {position[1].toFixed(5)}
      </div>
      <div className="text-muted-foreground">Zoom: {zoom}</div>
      <div className="flex items-center gap-1 mt-1">
        {mapStyle === 'satellite' ? <Globe className="w-4 h-4 text-green-700" /> : <MapIcon className="w-4 h-4 text-green-700" />}
        <span>{mapStyle === 'satellite' ? 'Satellite' : 'Modern Vector'}</span>
      </div>
    </Card>
  );
}

function MapEvents({ setZoom }) {
  useMapEvents({
    zoomend: (e) => setZoom(e.target.getZoom()),
  });
  return null;
}

export default function MapPage() {
  const [position, setPosition] = useState([31.9686, -99.9018]); // Default: Texas
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [locating, setLocating] = useState(false);
  const [zoom, setZoom] = useState(4);
  const [mapStyle, setMapStyle] = useState('satellite'); // 'satellite' or 'vector'
  const mapRef = useRef();

  // Current location handler
  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        setSelected({ name: 'Your Location', lat: coords[0], lon: coords[1], current: true });
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  // Search handler
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`
    );
    const data = await res.json();
    setSearchResults(data);
    if (data[0]) {
      setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      setSelected(data[0]);
    }
  };

  // Adjust this if your Navbar is a different height
  const NAVBAR_HEIGHT = 64;

  return (
    <div className="relative w-full" style={{ height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, maxWidth: '100vw', overflow: 'hidden' }}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-green-50 via-white to-green-200 animate-pulse-slow" />

      {/* Search Bar & Controls */}
      <Card className="absolute top-4 left-1/2 z-[1001] -translate-x-1/2 flex flex-row flex-wrap items-center gap-2 px-2 py-2 bg-white/80 backdrop-blur-md shadow-2xl rounded-xl w-[95vw] max-w-xl md:px-4 md:py-2 border border-green-200">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2 min-w-0">
          <Input
            type="text"
            placeholder="Search location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-0 text-sm md:text-base"
          />
          <Button type="submit" variant="outline" className="px-3">
            <Search className="w-5 h-5" />
          </Button>
        </form>
        <Button
          variant="secondary"
          className="ml-0 md:ml-2 px-3 mt-2 md:mt-0"
          onClick={handleLocate}
          disabled={locating}
        >
          <LocateFixed className="w-5 h-5 mr-1" />
          {locating ? 'Locating...' : 'Current'}
        </Button>
        {/* Map style toggle */}
        <div className="flex items-center gap-2 ml-2 mt-2 md:mt-0">
          <Switch
            checked={mapStyle === 'vector'}
            onCheckedChange={v => setMapStyle(v ? 'vector' : 'satellite')}
            id="map-style-toggle"
          />
          <label htmlFor="map-style-toggle" className="text-xs md:text-sm text-green-700 font-semibold cursor-pointer select-none">
            {mapStyle === 'vector' ? <MapIcon className="inline w-4 h-4 mr-1" /> : <Globe className="inline w-4 h-4 mr-1" />} {mapStyle === 'vector' ? 'Modern' : 'Satellite'}
          </label>
        </div>
      </Card>

      {/* Map */}
      <div className="w-full h-full rounded-xl overflow-hidden shadow-xl border border-green-200" style={{ height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, width: '100%', maxWidth: '100vw' }}>
        <MapContainer
          center={position}
          zoom={zoom}
          scrollWheelZoom
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          ref={mapRef}
        >
          {mapStyle === 'satellite' ? (
            <>
              <TileLayer
                url={TILE_LAYERS.satellite.url}
                attribution={TILE_LAYERS.satellite.attribution}
              />
              {/* Overlay: Esri Reference Labels */}
              <TileLayer
                url={TILE_LAYERS.satellite.labelUrl}
                attribution=""
                pane="overlayPane"
              />
            </>
          ) : (
            <TileLayer
              url={TILE_LAYERS.vector.url}
              attribution={TILE_LAYERS.vector.attribution}
            />
          )}
          <FlyToLocation position={position} />
          <MapEvents setZoom={setZoom} />
          {selected && (
            <Marker
              position={[parseFloat(selected.lat), parseFloat(selected.lon)]}
              icon={selected.current ? currentLocationIcon : DefaultIcon}
            >
              <Popup>
                <div className="font-semibold text-green-700">
                  {selected.display_name || selected.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  Lat: {parseFloat(selected.lat).toFixed(5)}, Lon: {parseFloat(selected.lon).toFixed(5)}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Search Results Dropdown (optional, for multiple results) */}
      {searchResults.length > 1 && (
        <Card className="absolute top-20 left-1/2 -translate-x-1/2 z-[1102] w-[95vw] max-w-xl bg-white/95 shadow-lg rounded-xl border border-green-200">
          <div className="max-h-60 overflow-y-auto divide-y">
            {searchResults.map((r, i) => (
              <div
                key={r.place_id}
                className="px-4 py-2 cursor-pointer hover:bg-green-50"
                onClick={() => {
                  setPosition([parseFloat(r.lat), parseFloat(r.lon)]);
                  setSelected(r);
                  setSearchResults([]);
                }}
              >
                <div className="font-medium">{r.display_name}</div>
                <div className="text-xs text-muted-foreground">
                  Lat: {parseFloat(r.lat).toFixed(5)}, Lon: {parseFloat(r.lon).toFixed(5)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Info Card (bottom left) */}
      <MapInfoCard position={position} zoom={zoom} mapStyle={mapStyle} />
    </div>
  );
}

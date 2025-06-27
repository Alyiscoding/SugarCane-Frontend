import React, { useRef, useEffect, useState } from 'react';
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Polygon, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import 'leaflet-draw';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LocateFixed, Search, MapPin, Globe, Map as MapIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// Custom icons
const mosqueIcon = new L.Icon({
  iconUrl: '/icons/mosque.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const roadIcon = new L.Icon({
  iconUrl: '/icons/road.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const placeIcon = new L.Icon({
  iconUrl: '/icons/place.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const userIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
const currentLocationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

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

const mosques = [
  { name: 'Mosque A', position: [31.5501, 74.3436] },
  { name: 'Mosque B', position: [31.5480, 74.3400] },
];
const roads = [
  { name: 'Main Road', position: [31.5510, 74.3450] },
];
const places = [
  { name: 'Market', position: [31.5470, 74.3420] },
];

// ... (rest of your icon and TILE_LAYERS code remains unchanged)

function DrawControl({ onBoundaryChange, measureMode }) {
  const map = useMap();
  const drawnItemsRef = useRef(new L.FeatureGroup());
  const drawControlRef = useRef(null);

  useEffect(() => {
    const drawnItems = drawnItemsRef.current;
    map.addLayer(drawnItems);

    // Remove any previous draw controls
    if (drawControlRef.current) {
      map.removeControl(drawControlRef.current);
    }

    const drawControl = new L.Control.Draw({
      position: 'topright',
      edit: { featureGroup: drawnItems },
      draw: {
        polygon: !measureMode,
        marker: false,
        polyline: measureMode,
        rectangle: false,
        circle: false,
        circlemarker: false,
      },
    });
    drawControlRef.current = drawControl;
    map.addControl(drawControl);

    const onCreated = function (event) {
      if (measureMode && event.layerType === 'polyline') {
        // Calculate distance
        const latlngs = event.layer.getLatLngs();
        let distance = 0;
        for (let i = 1; i < latlngs.length; i++) {
          distance += latlngs[i - 1].distanceTo(latlngs[i]);
        }
        toast(`Distance: ${(distance / 1000).toFixed(2)} km`);
        drawnItems.clearLayers();
        drawnItems.addLayer(event.layer);
      } else if (!measureMode && event.layerType === 'polygon') {
        drawnItems.clearLayers();
        drawnItems.addLayer(event.layer);
        const geojson = event.layer.toGeoJSON();
        if (onBoundaryChange) {
          onBoundaryChange(geojson.geometry);
        }
      }
    };
    map.on(L.Draw.Event.CREATED, onCreated);

    // No search control (handled by React search bar)
    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
  }, [map, onBoundaryChange, measureMode]);

  return null;
}

function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 4);
  }, [position, map]);
  return null;
}


export default function FieldMap({ onBoundaryChange, fields = [], sidebarOpen }) {
  // Search bar state (like Map.jsx)
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selected, setSelected] = useState(null);
  // Texas default: [31.9686, -99.9018]
  const TEXAS = [31.9686, -99.9018];
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(TEXAS);
  const [mapStyle, setMapStyle] = useState('satellite');
  const [locating, setLocating] = useState(false);
  const [measureMode, setMeasureMode] = useState(false);

  // Example static POIs ...
  // ... (your mosques, roads, places code remains unchanged)

  // Get user location
  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setMapCenter(coords);
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  useEffect(() => {
    // Move Leaflet controls down on the screen to avoid overlap with search bar
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      .leaflet-top.leaflet-right, .leaflet-top.leaflet-left {
        margin-top: 60px !important;
      }
    `;
    document.head.appendChild(styleTag);
    return () => { document.head.removeChild(styleTag); };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Search Bar & Controls (EXACTLY like Map.jsx) */}
      <Card className="absolute top-2 left-2 right-auto md:top-4 md:left-1/2 md:-translate-x-1/2 md:right-auto z-20 flex flex-row flex-wrap items-center gap-1 md:gap-2 px-1.5 py-1.5 md:px-4 md:py-2 bg-white/80 backdrop-blur-md shadow-2xl rounded-xl w-[98vw] max-w-xs md:max-w-xl border border-green-200">
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!search.trim()) return;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`
          );
          const data = await res.json();
          setSearchResults(data);
          if (data[0]) {
            setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
            setSelected(data[0]);
          }
        }} className="flex flex-1 gap-1 md:gap-2 min-w-0">
          <Input
            type="text"
            placeholder="Search location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-0 text-xs md:text-base px-2 py-1 md:px-3 md:py-2 md:w-80 lg:w-96"
          />
          <Button type="submit" variant="outline" className="px-2 py-1 md:px-2 md:py-2 md:w-8">
            <Search className="w-4 h-4" />
          </Button>
        </form>
        <Button
        variant="secondary"
        className="ml-0 md:ml-2 px-2 py-1 md:px-2 md:py-2 md:w-8 mt-0"
        onClick={handleLocate}
        disabled={locating}
        title="Current Location"
        >
        <LocateFixed className="w-4 h-4" />
        </Button>
        {/* Map style toggle and measure - hidden on small screens */}
        <Button
        type="button"
        variant={measureMode ? "default" : "outline"}
        className={(measureMode ? "bg-green-700 text-white " : "") + "flex px-2 py-1 md:px-2 md:py-2 md:w-8"}
        onClick={() => setMeasureMode((m) => !m)}
        title="Measure Distance"
        >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l6-6 4 4 8-8" /></svg>
        </Button>
        <Button
        type="button"
        variant={mapStyle === 'vector' ? "default" : "outline"}
        className="flex px-2 py-1 md:px-2 md:py-2 md:w-8"
        onClick={() => setMapStyle(mapStyle === 'vector' ? 'satellite' : 'vector')}
        title="Toggle Map Style"
        >
        {mapStyle === 'vector' ? <MapIcon className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
        </Button>
      </Card>
      {/* Search Results Dropdown (optional, for multiple results) */}
      {searchResults.length > 1 && (
        <Card className="absolute top-20 left-1/2 -translate-x-1/2 z-[1102] w-[95vw] max-w-xl bg-white/95 shadow-lg rounded-xl border border-green-200">
          <div className="max-h-60 overflow-y-auto divide-y">
            {searchResults.map((r, i) => (
              <div
                key={r.place_id}
                className="px-4 py-2 cursor-pointer hover:bg-green-50"
                onClick={() => {
                  setMapCenter([parseFloat(r.lat), parseFloat(r.lon)]);
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
      <MapContainer
        center={mapCenter}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
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
        <DrawControl onBoundaryChange={onBoundaryChange} measureMode={measureMode} />
        {/* User Location Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={currentLocationIcon}>
            <Popup>Your Current Location</Popup>
          </Marker>
        )}
        {/* Selected Search Result Marker */}
        {selected && (
          <Marker
            position={[parseFloat(selected.lat), parseFloat(selected.lon)]}
            icon={userIcon}
          >
            <Popup>
              <div style={{ fontWeight: 600 }}>{selected.display_name}</div>
              <div style={{ fontSize: 12, color: '#888' }}>
                Lat: {parseFloat(selected.lat).toFixed(5)}, Lon: {parseFloat(selected.lon).toFixed(5)}
              </div>
            </Popup>
          </Marker>
        )}
        {/* Mosques */}
        {mosques.map((mosque, idx) => (
          <Marker key={idx} position={mosque.position} icon={mosqueIcon}>
            <Popup>{mosque.name}</Popup>
          </Marker>
        ))}
        {/* Roads */}
        {roads.map((road, idx) => (
          <Marker key={idx} position={road.position} icon={roadIcon}>
            <Popup>{road.name}</Popup>
          </Marker>
        ))}
        {/* Places */}
        {places.map((place, idx) => (
          <Marker key={idx} position={place.position} icon={placeIcon}>
            <Popup>{place.name}</Popup>
          </Marker>
        ))}
        {/* Existing Fields Polygons */}
        {fields.map((field, idx) => {
          if (
            field.boundary &&
            field.boundary.type === 'Polygon' &&
            Array.isArray(field.boundary.coordinates)
          ) {
            // Leaflet expects [lat, lng], GeoJSON is [lng, lat]
            const latlngs = field.boundary.coordinates[0].map(([lng, lat]) => [lat, lng]);
            return <Polygon key={field._id || idx} positions={latlngs} color="#2ecc40" />;
          }
          return null;
        })}
        {/* Fly to location if changed */}
        <FlyToLocation position={mapCenter} />
      </MapContainer>
    </div>
  );
}

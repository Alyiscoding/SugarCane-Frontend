"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { fieldsAPI } from '../services/api'
import { useAuth } from "../context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, Area, AreaChart, XAxis, YAxis } from "recharts"
import { Cloud, Thermometer, Droplets, TrendingUp, MapPin, Calendar, Download } from "lucide-react"
import { MapContainer, TileLayer, Polygon, Rectangle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE = "http://localhost:5000"

// Lower Leaflet z-index so maps never overlap navbar
const leafletZIndexStyle = `
  .leaflet-pane, .leaflet-top, .leaflet-bottom {
    z-index: 10 !important;
  }
`;

// Chart configurations
const ndviChartConfig = {
  ndvi: {
    label: "NDVI",
    color: "hsl(var(--chart-1))",
  },
}

const precipitationChartConfig = {
  precipitation: {
    label: "Precipitation (mm)",
    color: "hsl(var(--chart-2))",
  },
}

const temperatureChartConfig = {
  gdd: {
    label: "Growing Degree Days",
    color: "hsl(var(--chart-3))",
  },
}

function Dashboard() {
  const { token } = useAuth()
  const [fields, setFields] = useState([])
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedField, setSelectedField] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError("")
      try {
        const [fieldsRes, predictionsRes] = await Promise.all([
          fieldsAPI.getAllFields(),
          fieldsAPI.getPredictions()
        ])
        setFields(fieldsRes.data)
        setPredictions(predictionsRes.data)
        if (fieldsRes.data.length > 0) {
          setSelectedField(fieldsRes.data[0])
        }
      } catch (err) {
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchData()
  }, [token])

  // Helper functions
  const getPredictionsForField = (fieldId) => {
    return predictions
      .filter((p) =>
        (p.field && typeof p.field === 'object' && String(p.field._id) === String(fieldId)) ||
        (typeof p.field === 'string' && String(p.field) === String(fieldId))
      )
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }

  const getLatestPrediction = (fieldId) => {
    const preds = getPredictionsForField(fieldId)
    if (preds.length === 0) return null
    return preds[preds.length - 1]
  }

  const getHealthStatus = (ndvi) => {
    if (ndvi === undefined) return { status: "No Data", color: "secondary" }
    if (ndvi < 0.4) return { status: "Poor", color: "destructive" }
    if (ndvi < 0.7) return { status: "Fair", color: "default" }
    return { status: "Excellent", color: "default" }
  }

  // Only use real time series data for charts
  const generateNDVIData = (fieldId) => {
    const latestPred = getLatestPrediction(fieldId)
    if (latestPred?.result?.ndvi_series) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return latestPred.result.ndvi_series.slice(0, 12).map((value, index) => ({
        month: monthNames[index],
        ndvi: Number.parseFloat(value.toFixed(3)),
      }))
    }
    return [];
  }

  // Use real precipitation data if available, otherwise fallback to dummy
  const generatePrecipitationData = (fieldId) => {
    const latestPred = getLatestPrediction(fieldId)
    if (latestPred?.result?.precipitation_series) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return latestPred.result.precipitation_series.slice(0, 12).map((value, index) => ({
        month: monthNames[index],
        precipitation: Number.parseFloat(value.toFixed(1)),
      }))
    }
    // Dummy data fallback
    return [
      { month: "Jan", precipitation: 25 },
      { month: "Feb", precipitation: 45 },
      { month: "Mar", precipitation: 78 },
      { month: "Apr", precipitation: 120 },
      { month: "May", precipitation: 155 },
      { month: "Jun", precipitation: 168 },
    ];
  }

  // Use real GDD data if available, otherwise fallback to dummy
  const generateGDDData = (fieldId) => {
    const latestPred = getLatestPrediction(fieldId)
    if (latestPred?.result?.gdd_series) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return latestPred.result.gdd_series.slice(0, 12).map((value, index) => ({
        month: monthNames[index],
        gdd: Number.parseFloat(value.toFixed(1)),
      }))
    }
    // Dummy data fallback
    return [
      { month: "Jan", gdd: 180 },
      { month: "Feb", gdd: 420 },
      { month: "Mar", gdd: 780 },
      { month: "Apr", gdd: 1250 },
      { month: "May", gdd: 1850 },
      { month: "Jun", gdd: 2362 },
    ];
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <style>{leafletZIndexStyle}</style>
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="h-96 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!selectedField) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No fields found</h3>
          <p className="text-muted-foreground">Go to the Fields page to add your first field.</p>
        </div>
      </div>
    )
  }

  // All variable declarations must be here, before any JSX uses them
  const latestPred = getLatestPrediction(selectedField._id);
  const currentNDVI = latestPred?.result?.ndvi;
  const healthStatus = getHealthStatus(currentNDVI);
  const ndviData = generateNDVIData(selectedField._id);
  const precipitationData = generatePrecipitationData(selectedField._id);
  const gddData = generateGDDData(selectedField._id);

  // Debug: log selectedField to check its structure
  console.log('selectedField', selectedField)

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-green-700 mb-1 drop-shadow">{selectedField.name}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold shadow">
            <Calendar className="h-3 w-3 mr-1" />
            Last updated: {new Date(selectedField.updatedAt || Date.now()).toLocaleDateString()}
          </span>
          <Button variant="outline" size="sm" className="rounded-full px-4 py-1 text-green-700 border-green-300 hover:bg-green-100" onClick={() => navigate('/feedback')}>
            Feedback
          </Button>
        </div>
      </div>

      {/* Field Selection */}
      {fields.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 pl-2">
          {fields.map((field) => (
            <button
              key={field._id}
              onClick={() => setSelectedField(field)}
              className={`px-5 py-2 rounded-full font-bold shadow transition-all duration-200 whitespace-nowrap border-2
                ${selectedField._id === field._id
                  ? 'bg-green-600 text-white border-green-600 scale-105'
                  : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-400'}
              `}
              style={{ minWidth: 100 }}
            >
              {field.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Navigation Tabs */}
          <Tabs defaultValue="status" className="w-full">
            <TabsList className="flex w-full flex-nowrap overflow-x-auto md:grid md:grid-cols-5 bg-green-50 rounded-xl shadow mb-2">
              <TabsTrigger value="status" className="font-bold text-green-700 min-w-[120px]">Status</TabsTrigger>
              <TabsTrigger value="field-report" className="font-bold text-green-700 min-w-[120px]">Field Report</TabsTrigger>
              <TabsTrigger value="precipitation" className="font-bold text-green-700 min-w-[120px]">Precipitation</TabsTrigger>
              <TabsTrigger value="data" className="font-bold text-green-700 min-w-[120px]">Data</TabsTrigger>
              <TabsTrigger value="yield" className="font-bold text-green-700 min-w-[120px]">Yield Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-6">
              {/* Satellite Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-green-100 via-green-50 to-emerald-100 shadow-xl border-0 hover:scale-[1.02] transition-transform duration-200">
                  <CardHeader className="pb-3 flex flex-row items-center gap-2">
                    <span className="inline-flex items-center justify-center bg-green-600 text-white rounded-full w-8 h-8 shadow-lg mr-2">
                      <TrendingUp className="w-5 h-5" />
                    </span>
                    <CardTitle className="text-sm font-bold text-green-800">NDVI - Jun 10, 2025</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* NDVI Map Preview (Leaflet) */}
                    <div className="aspect-video rounded-2xl flex items-center justify-center relative overflow-hidden shadow-lg">
                      {typeof window !== "undefined" && selectedField.boundary && selectedField.boundary.type === "Polygon" && Array.isArray(selectedField.boundary.coordinates) && (
                        <div className="w-full h-full" style={{ minHeight: 180 }}>
                          <MapContainer
                            key={selectedField._id}
                            style={{ width: "100%", height: "100%", borderRadius: 16 }}
                            bounds={L.latLngBounds(selectedField.boundary.coordinates[0].map(([lng, lat]) => [lat, lng]))}
                            minZoom={3}
                            maxZoom={18}
                            zoom={13}
                            scrollWheelZoom={false}
                            dragging={false}
                            doubleClickZoom={false}
                            zoomControl={false}
                            attributionControl={false}
                            keyboard={false}
                            touchZoom={false}
                            boxZoom={false}
                          >
                            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                            {/* Demo: grid of rectangles with random NDVI values */}
                            {(() => {
                              const coords = selectedField.boundary.coordinates[0].map(([lng, lat]) => [lat, lng]);
                              // Get bounding box
                              const lats = coords.map(([lat, lng]) => lat);
                              const lngs = coords.map(([lat, lng]) => lng);
                              const minLat = Math.min(...lats), maxLat = Math.max(...lats);
                              const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
                              const rows = 15, cols = 15;
                              const latStep = (maxLat - minLat) / rows;
                              const lngStep = (maxLng - minLng) / cols;
                              // Helper to get color for NDVI
                              const getColor = (ndvi) => ndvi < 0.3 ? 'red' : ndvi < 0.4 ? 'orange' : ndvi < 0.7 ? 'yellow' : 'green';
                              // Simple point-in-polygon check
                              function pointInPolygon(point, vs) {
                                // ray-casting algorithm
                                var x = point[1], y = point[0];
                                var inside = false;
                                for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                                  var xi = vs[i][1], yi = vs[i][0];
                                  var xj = vs[j][1], yj = vs[j][0];
                                  var intersect = ((yi > y) !== (yj > y)) &&
                                    (x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi);
                                  if (intersect) inside = !inside;
                                }
                                return inside;
                              }
                              // Generate rectangles
                              const rects = [];
                              for (let i = 0; i < rows; i++) {
                                for (let j = 0; j < cols; j++) {
                                  const lat1 = minLat + i * latStep;
                                  const lat2 = minLat + (i + 1) * latStep;
                                  const lng1 = minLng + j * lngStep;
                                  const lng2 = minLng + (j + 1) * lngStep;
                                  // Center of the box
                                  const center = [(lat1 + lat2) / 2, (lng1 + lng2) / 2];
                                  // Only render if center is inside polygon
                                  if (pointInPolygon(center, coords)) {
                                    // Use real NDVI value from series, repeat if needed
                                    const ndviSeries = latestPred?.result?.ndvi_series || [];
                                    const ndviIdx = (i * cols + j) % ndviSeries.length;
                                    const ndvi = ndviSeries.length > 0 ? ndviSeries[ndviIdx] : Math.random();
                                    rects.push(
                                      <Rectangle
                                        key={`rect-${i}-${j}`}
                                        bounds={[[lat1, lng1], [lat2, lng2]]}
                                        pathOptions={{ color: getColor(ndvi), fillColor: getColor(ndvi), fillOpacity: 0.7, weight: 0.5 }}
                                      />
                                    );
                                  }
                                }
                              }
                              return rects;
                            })()}
                            {/* Main field outline */}
                            <Polygon
                              positions={selectedField.boundary.coordinates[0].map(([lng, lat]) => [lat, lng])}
                              pathOptions={{ color: '#166534', weight: 2, fillOpacity: 0 }}
                            />
                          </MapContainer>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-gradient-to-tr from-green-700 to-green-400 text-white px-3 py-1 rounded-full text-xs z-10 font-bold shadow">NDVI</div>
                      <div className="absolute bottom-2 right-2 bg-white/80 text-green-800 px-3 py-1 rounded-full text-xs z-10 font-bold shadow border border-green-200">
                        {(currentNDVI * 100).toFixed(0)}%
                      </div>
                    </div>
                  </CardContent>
                  {/* NDVI Color Legend */}
                  <div className="flex flex-row gap-3 mt-2 mb-2 items-center justify-center">
                    <span className="inline-flex items-center gap-1 text-xs font-bold"><span className="inline-block w-3 h-3 rounded-full bg-red-500"></span> Poor</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold"><span className="inline-block w-3 h-3 rounded-full bg-orange-400"></span> Low</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold"><span className="inline-block w-3 h-3 rounded-full bg-yellow-400"></span> Fair</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold"><span className="inline-block w-3 h-3 rounded-full bg-green-500"></span> Excellent</span>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-gray-100 via-gray-50 to-green-100 shadow-xl border-0 hover:scale-[1.02] transition-transform duration-200">
                  <CardHeader className="pb-3 flex flex-row items-center gap-2">
                    <span className="inline-flex items-center justify-center bg-green-400 text-white rounded-full w-8 h-8 shadow-lg mr-2">
                      <MapPin className="w-5 h-5" />
                    </span>
                    <CardTitle className="text-sm font-bold text-green-800">Satellite Image - Jun 20, 2025</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Satellite Map Preview (Leaflet) */}
                    <div className="aspect-video rounded-2xl flex items-center justify-center relative overflow-hidden shadow-lg">
                      {typeof window !== "undefined" && selectedField.boundary && selectedField.boundary.type === "Polygon" && Array.isArray(selectedField.boundary.coordinates) && (
                        <div className="w-full h-full" style={{ minHeight: 180 }}>
                          <MapContainer
                            key={selectedField._id}
                            style={{ width: "100%", height: "100%", borderRadius: 16 }}
                            bounds={L.latLngBounds(selectedField.boundary.coordinates[0].map(([lng, lat]) => [lat, lng]))}
                            zoom={13}
                            scrollWheelZoom={false}
                            dragging={false}
                            doubleClickZoom={false}
                            zoomControl={false}
                            attributionControl={false}
                            keyboard={false}
                            touchZoom={false}
                            boxZoom={false}
                          >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Polygon
                              positions={selectedField.boundary.coordinates[0].map(([lng, lat]) => [lat, lng])}
                              pathOptions={{ color: "#22c55e", weight: 2, fillOpacity: 0 }}
                            />
                          </MapContainer>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="space-y-6">
                {/* NDVI Chart */}
                <Card className="bg-gradient-to-br from-green-50 via-green-100 to-white shadow-lg border-0 rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-green-800">NDVI Trend</CardTitle>
                      <CardDescription className="text-green-700">Normalized Difference Vegetation Index over time</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-green-600">{(currentNDVI * 100).toFixed(0)}%</div>
                      <Badge variant={healthStatus.color === "destructive" ? "destructive" : "default"} className="text-xs px-3 py-1 font-bold">
                        {healthStatus.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {ndviData.length > 0 ? (
                      <ChartContainer config={ndviChartConfig} className="h-64 w-full rounded-xl bg-white/80 shadow-inner">
                        <LineChart data={ndviData}>
                          <XAxis dataKey="month" stroke="#16a34a" fontSize={14} tickLine={false} axisLine={false} />
                          <YAxis domain={[0, 1]} stroke="#16a34a" fontSize={14} tickLine={false} axisLine={false} />
                          <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "#bbf7d0", fillOpacity: 0.2 }} />
                          <Line
                            type="monotone"
                            dataKey="ndvi"
                            stroke="#16a34a"
                            strokeWidth={4}
                            dot={{ fill: "#16a34a", strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8, fill: "#22c55e", stroke: "#16a34a", strokeWidth: 3 }}
                          />
                        </LineChart>
                      </ChartContainer>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-gray-400 font-bold text-lg">No NDVI data available</div>
                    )}
                  </CardContent>
                </Card>

                {/* Precipitation and GDD Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-white shadow-lg border-0 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 font-bold text-blue-800">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        Accumulated Precipitation
                      </CardTitle>
                      <CardDescription className="text-blue-700">Total: 168 mm (17 day period)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={precipitationChartConfig} className="h-48 w-full rounded-xl bg-white/80 shadow-inner">
                        {precipitationData.length > 0 ? (
                          <AreaChart data={precipitationData}>
                            <XAxis dataKey="month" stroke="#2563eb" fontSize={14} tickLine={false} axisLine={false} />
                            <YAxis stroke="#2563eb" fontSize={14} tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "#dbeafe", fillOpacity: 0.2 }} />
                            <Area
                              type="monotone"
                              dataKey="precipitation"
                              stroke="#2563eb"
                              fill="url(#precip-gradient)"
                              fillOpacity={1}
                              strokeWidth={3}
                              activeDot={{ r: 7, fill: "#2563eb", stroke: "#1e40af", strokeWidth: 2 }}
                            />
                            <defs>
                              <linearGradient id="precip-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.2} />
                              </linearGradient>
                            </defs>
                          </AreaChart>
                        ) : (
                          <div className="h-48 flex items-center justify-center text-gray-400 font-bold text-lg">No precipitation data available</div>
                        )}
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-50 via-yellow-100 to-white shadow-lg border-0 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 font-bold text-yellow-800">
                        <TrendingUp className="h-5 w-5 text-orange-500" />
                        Growing Degree Days
                      </CardTitle>
                      <CardDescription className="text-yellow-700">
                        +2362° (in 10% of 10 days, the temperature was between 10°C and 30°C)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={temperatureChartConfig} className="h-48 w-full rounded-xl bg-white/80 shadow-inner">
                        {gddData.length > 0 ? (
                          <AreaChart data={gddData}>
                            <XAxis dataKey="month" stroke="#f59e42" fontSize={14} tickLine={false} axisLine={false} />
                            <YAxis stroke="#f59e42" fontSize={14} tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "#fef9c3", fillOpacity: 0.2 }} />
                            <Area
                              type="monotone"
                              dataKey="gdd"
                              stroke="#f59e42"
                              fill="url(#gdd-gradient)"
                              fillOpacity={1}
                              strokeWidth={3}
                              activeDot={{ r: 7, fill: "#f59e42", stroke: "#b45309", strokeWidth: 2 }}
                            />
                            <defs>
                              <linearGradient id="gdd-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e42" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#fde68a" stopOpacity={0.2} />
                              </linearGradient>
                            </defs>
                          </AreaChart>
                        ) : (
                          <div className="h-48 flex items-center justify-center text-gray-400 font-bold text-lg">No GDD data available</div>
                        )}
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="field-report">
              <Card className="bg-gradient-to-br from-green-50 via-green-100 to-white shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-green-800">Field Report</CardTitle>
                  <CardDescription className="text-green-700">Detailed analysis and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-100 rounded-xl shadow flex flex-col items-center">
                      <h4 className="font-semibold text-green-800 mb-2 text-center">Current Status</h4>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-2 ${healthStatus.status === 'Excellent' ? 'bg-green-200 text-green-800' : healthStatus.status === 'Fair' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>{healthStatus.status}</span>
                      <p className="text-green-700 text-center">
                        Field shows <b>{healthStatus.status.toLowerCase()}</b> vegetation health with NDVI of <b>{(currentNDVI * 100).toFixed(0)}%</b>.
                      </p>
                    </div>
                    {latestPred && (
                      <div className="p-4 bg-white rounded-xl shadow">
                        <h4 className="font-semibold mb-2 text-green-800">Latest Prediction Data</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20m10-10H2" /></svg>
                            NDVI: {latestPred.result.ndvi ? `${(latestPred.result.ndvi * 100).toFixed(0)}%` : 'N/A'}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16" /></svg>
                            EVI: {latestPred.result.evi ? `${(latestPred.result.evi * 100).toFixed(0)}%` : 'N/A'}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
                            SAVI: {latestPred.result.savi ? `${(latestPred.result.savi * 100).toFixed(0)}%` : 'N/A'}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            GNDVI: {latestPred.result.gndvi ? `${(latestPred.result.gndvi * 100).toFixed(0)}%` : 'N/A'}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold gap-1 ${latestPred.result.yield < 2 ? 'bg-red-100 text-red-800' : latestPred.result.yield < 4 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                            <TrendingUp className="w-4 h-4" />
                            Yield: {latestPred.result.yield ? `${latestPred.result.yield.toFixed(2)} tons/acre` : 'N/A'}
                          </span>
                        </div>
                        <div className="mt-2 bg-green-50 rounded-lg p-2 flex flex-col items-center">
                          <span className="text-xs font-semibold text-green-700 mb-1">NDVI Trend:</span>
                          <div className="flex flex-row flex-nowrap overflow-x-auto gap-1 w-full pb-1">
                            {latestPred.result.ndvi_series && latestPred.result.ndvi_series.length > 0
                              ? latestPred.result.ndvi_series.slice(0, 12).map((v, i) => (
                                <span key={i} className="inline-block min-w-[36px] text-center font-mono text-xs rounded bg-green-100 text-green-800 px-1">
                                  {(v * 100).toFixed(0)}%
                                </span>
                              ))
                              : <span className="text-xs text-gray-400">N/A</span>}
                            {latestPred.result.ndvi_series && latestPred.result.ndvi_series.length > 12 && (
                              <span className="text-xs text-gray-400 ml-1">...</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="precipitation">
              <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-white shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    Precipitation Analysis
                  </CardTitle>
                  <CardDescription className="text-blue-700">Detailed precipitation data and forecasts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={precipitationChartConfig} className="h-96 w-full rounded-xl bg-white/80 shadow-inner">
                    <AreaChart data={precipitationData}>
                      <XAxis dataKey="month" stroke="#2563eb" fontSize={14} tickLine={false} axisLine={false} />
                      <YAxis stroke="#2563eb" fontSize={14} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "#dbeafe", fillOpacity: 0.2 }} />
                      <Area
                        type="monotone"
                        dataKey="precipitation"
                        stroke="#2563eb"
                        fill="url(#precip-gradient)"
                        fillOpacity={1}
                        strokeWidth={3}
                        activeDot={{ r: 7, fill: "#2563eb", stroke: "#1e40af", strokeWidth: 2 }}
                      />
                      <defs>
                        <linearGradient id="precip-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data">
              <Card className="bg-gradient-to-br from-yellow-50 via-yellow-100 to-white shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-yellow-800">Raw Data</CardTitle>
                  <CardDescription className="text-yellow-700">All collected field data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-white rounded-xl shadow">
                        <div className="text-2xl font-bold text-green-700">{(currentNDVI * 100).toFixed(0)}%</div>
                        <div className="text-sm text-green-800 font-semibold">Current NDVI</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-xl shadow">
                        <div className="text-2xl font-bold text-blue-700">168</div>
                        <div className="text-sm text-blue-800 font-semibold">Total Precipitation (mm)</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-xl shadow">
                        <div className="text-2xl font-bold text-yellow-700">2362</div>
                        <div className="text-sm text-yellow-800 font-semibold">Growing Degree Days</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-xl shadow">
                        <div className="text-2xl font-bold text-purple-700">37°</div>
                        <div className="text-sm text-purple-800 font-semibold">Current Temp</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="yield">
              <Card className="bg-gradient-to-br from-green-50 via-green-100 to-white shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-green-800">Yield Analysis</CardTitle>
                  <CardDescription className="text-green-700">Predicted yield based on current conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-green-600 mb-2">{(currentNDVI * 100).toFixed(0)}%</div>
                    <div className="text-lg text-green-800 font-semibold mb-4">Predicted yield efficiency</div>
                    <p className="text-sm text-green-700 max-w-md mx-auto">
                      Based on current NDVI readings and historical data, the field is performing at <b>{(currentNDVI * 100).toFixed(0)}%</b> of optimal yield potential.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weather Card */}
          <Card className="bg-gradient-to-br from-blue-100 via-blue-50 to-green-100 shadow-xl border-0 hover:scale-[1.02] transition-transform duration-200">
            <CardHeader className="pb-3 flex flex-row items-center gap-2">
              <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full w-8 h-8 shadow-lg mr-2">
                <Cloud className="h-5 w-5" />
              </span>
              <CardTitle className="text-sm font-bold text-blue-800">Weather</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-600">+37°</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-blue-700">Feels like</div>
                  <div className="text-sm font-bold text-blue-900">40°C</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gradient-to-br from-yellow-100 via-yellow-50 to-green-100 shadow-xl border-0 hover:scale-[1.02] transition-transform duration-200">
            <CardHeader className="pb-3 flex flex-row items-center gap-2">
              <span className="inline-flex items-center justify-center bg-yellow-400 text-white rounded-full w-8 h-8 shadow-lg mr-2">
                <TrendingUp className="w-5 h-5" />
              </span>
              <CardTitle className="text-sm font-bold text-yellow-800">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-700 font-semibold">Crop Type</span>
                <span className="font-bold text-green-800">{selectedField.crop ? selectedField.crop.charAt(0).toUpperCase() + selectedField.crop.slice(1) : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-700 font-semibold">Planting Date</span>
                <span className="font-bold text-green-800">{selectedField.from ? new Date(selectedField.from).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-700 font-semibold">Harvest Date</span>
                <span className="font-bold text-green-800">{selectedField.to ? new Date(selectedField.to).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-700 font-semibold">Days to Harvest</span>
                <span className="font-bold text-green-800">{selectedField.to ? Math.max(0, Math.ceil((new Date(selectedField.to) - new Date()) / (1000 * 60 * 60 * 24))) + ' days' : 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Health Status */}
          <Card className="bg-gradient-to-br from-green-100 via-green-50 to-yellow-100 shadow-xl border-0 hover:scale-[1.02] transition-transform duration-200">
            <CardHeader className="pb-3 flex flex-row items-center gap-2">
              <span className="inline-flex items-center justify-center bg-green-500 text-white rounded-full w-8 h-8 shadow-lg mr-2">
                <Droplets className="w-5 h-5" />
              </span>
              <CardTitle className="text-sm font-bold text-green-800">Health Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-700">Vegetation Health</span>
                  <Badge variant={healthStatus.color === "destructive" ? "destructive" : "default"} className="text-xs px-3 py-1 font-bold">
                    {healthStatus.status}
                  </Badge>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width: `${currentNDVI * 100}%`,
                      height: "100%",
                      background:
                        currentNDVI < 0.3
                          ? "red"
                          : currentNDVI < 0.4
                            ? "orange"
                            : currentNDVI < 0.7
                              ? "yellow"
                              : "green",
                    }}
                  ></div>
                </div>
                <div className="text-xs text-green-800 font-bold">NDVI: {(currentNDVI * 100).toFixed(0)}%</div>
              </div>
            </CardContent>
          </Card>

          {/* Final Prediction Card */}
          <Card className="bg-gradient-to-br from-purple-100 via-purple-50 to-green-100 shadow-xl border-0 hover:scale-[1.02] transition-transform duration-200">
            <CardHeader className="pb-3 flex flex-row items-center gap-2">
              <span className="inline-flex items-center justify-center bg-purple-500 text-white rounded-full w-8 h-8 shadow-lg mr-2">
                <TrendingUp className="w-5 h-5" />
              </span>
              <CardTitle className="text-sm font-bold text-purple-800">Final Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-2">
                <div className="text-3xl font-extrabold text-purple-700 mb-2">
                  {latestPred && latestPred.result && typeof latestPred.result.yield === 'number'
                    ? `${latestPred.result.yield.toFixed(2)} tons/acre`
                    : 'N/A'}
                </div>
                <div className="flex flex-row gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-200 text-green-800">
                    NDVI: {latestPred?.result?.ndvi ? `${(latestPred.result.ndvi * 100).toFixed(0)}%` : 'N/A'}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-200 text-blue-800">
                    EVI: {latestPred?.result?.evi ? `${(latestPred.result.evi * 100).toFixed(0)}%` : 'N/A'}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-200 text-yellow-800">
                    SAVI: {latestPred?.result?.savi ? `${(latestPred.result.savi * 100).toFixed(0)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex flex-row gap-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${latestPred?.result?.yield < 2 ? 'bg-red-200 text-red-800' : latestPred?.result?.yield < 4 ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                    {latestPred?.result?.yield < 2 ? 'Low Yield' : latestPred?.result?.yield < 4 ? 'Medium Yield' : 'High Yield'}
                  </span>
                  {latestPred && latestPred.result && latestPred.result.yield > 0 && latestPred.result.yield <= 1.2 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-purple-200 text-purple-800">
                      Efficiency: {(latestPred.result.yield * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}

export default Dashboard

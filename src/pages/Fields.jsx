/* eslint-disable */
"use client"

import { useEffect, useState, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Calendar as ShadCalendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { format, addDays, isBefore } from "date-fns"
import { fieldsAPI } from '../services/api'
import { useAuth } from "../context/AuthContext"
import FieldMap from "../components/FieldMap"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Calendar, Grid3X3, MapPin, TrendingUp, FileText, Users, Search, SortAsc, Plus, ChevronLeft, ChevronRight, Trash2, Pencil } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "sonner";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import L from "leaflet";

function Fields() {
  const { user, token } = useAuth()
  const [fields, setFields] = useState([])
  const [form, setForm] = useState({ name: "", boundary: null, crop: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [predicting, setPredicting] = useState(null)
  const [predictions, setPredictions] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [slotConfirmed, setSlotConfirmed] = useState(false)
  const [hoveredDate, setHoveredDate] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [editField, setEditField] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const calendarButtonRef = useRef(null)
  const sidebarRef = useRef(null)

  // For season year and showing date range
  const [showSeasonRange, setShowSeasonRange] = useState(false)
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const fetchFields = async () => {
      setLoading(true)
      try {
        const res = await fieldsAPI.getAllFields()
        setFields(res.data)
      } catch (err) {
        setError("Failed to fetch fields")
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchFields()
  }, [token])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCropChange = (value) => {
    setForm((prev) => ({ ...prev, crop: value }))
  }

  const handleBoundaryChange = (geojson) => {
    setForm((prev) => ({ ...prev, boundary: geojson }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (!form.boundary) {
      setError("Please select a boundary on the map.")
      return
    }
    try {
      const res = await fieldsAPI.createField({ name: form.name, boundary: form.boundary })
      // Add new field at the beginning of the array
      setFields([res.data, ...fields])
      setForm({ name: "", boundary: null })
      toast.success("Field added successfully!")
      setShowAddForm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add field.")
    }
  }

  const handlePredict = async (fieldId) => {
    setPredicting(fieldId)
    setError("")
    try {
      const res = await fieldsAPI.runFlaskPrediction(fieldId, user?._id)
      setPredictions((prev) => ({ ...prev, [fieldId]: res.data }))
    } catch (err) {
      setError(err.response?.data?.message || "Prediction failed")
    } finally {
      setPredicting(null)
    }
  }

  const filteredFields = fields.filter((field) => field.name.toLowerCase().includes(searchTerm.toLowerCase()))
  const totalArea = fields.reduce((sum, field) => sum + (field.area || 0), 0)

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Calendar, id: "calendar", tooltip: "Select 14-day slot" },
    { icon: Grid3X3, route: "/fields", tooltip: "Fields" },
    { icon: MapPin, id: "location", tooltip: "Go to Current Location" },
    { icon: TrendingUp, route: "/analytics", tooltip: "Analytics" },
    { icon: FileText, route: "/feedback", tooltip: "Reports/Feedback" },
    { icon: Users, route: "/profile", tooltip: "Profile" },
  ];

  // Enforce exactly 14-day slot selection
  const handleDateRangeSelect = (range) => {
    if (range && range.from) {
      const from = range.from
      const to = addDays(from, 13)
      setDateRange({ from, to })
      setSlotConfirmed(false)
    } else {
      setDateRange({ from: null, to: null })
      setSlotConfirmed(false)
    }
  }

  // Confirm slot and send to backend/model
  const handleConfirmSlot = async () => {
    setError("")
    setSuccess("")
    if (!form.boundary) {
      setError("Please select a boundary on the map.")
      return
    }
    if (!form.name) {
      setError("Please enter a field name.")
      return
    }
    if (!form.crop) {
      setError("Please select a crop category.")
      return
    }
    if (!dateRange.from || !dateRange.to) {
      setError("Please select a 14-day slot.")
      return
    }
    try {
      // Save all data to backend
      await fieldsAPI.createSlot({
        name: form.name,
        boundary: form.boundary,
        crop: form.crop,
        from: dateRange.from,
        to: dateRange.to
      })
      setSuccess("14-day slot and field data sent to backend!")
      setSlotConfirmed(true)
      // Reset all form fields
      setForm({ name: "", boundary: null, crop: "" });
      setDateRange({ from: null, to: null });
      setHoveredDate(null);
      setShowAddForm(false);
      toast.success("Field added successfully!");
      // Refresh fields list
      if (token) {
        try {
          const res = await fieldsAPI.getAllFields();
          setFields(res.data);
        } catch (fetchErr) {
          // Optionally handle fetch error
        }
      }
      // Optionally, send to model for prediction here
      // await axios.post("http://localhost:5000/api/predictions", { ... })
    } catch (err) {
      setError("Failed to send slot and field data to backend")
    }
  }

  const handleLocationClick = () => {
    window.dispatchEvent(new CustomEvent("centerMapToCurrentLocation"))
  }

  return (
    <div className="h-screen bg-gray-50 w-full pl-6">
      <style>{`
        .leaflet-pane, .leaflet-top, .leaflet-bottom {
          z-index: 10 !important;
        }
      `}</style>
      {/* Main container with fixed layout */}
      <div className="flex flex-row h-screen w-full">
        {/* Sidebar toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute z-30 top-4 transition-all duration-300 rounded-full p-2 bg-white border border-gray-200 shadow-md hover:bg-gray-50 ${
            sidebarOpen ? 'left-[19rem] md:left-[20rem]' : 'left-4'
          }`}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Left sidebar - Fixed width and scrolling */}
        <div
          ref={sidebarRef}
          className={`w-80 bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 absolute md:relative z-20 ${
            sidebarOpen ? 'left-0' : '-left-80 md:left-0'
          }`}
        >
          {/* Header section */}
          <div className="pr-6 border-b border-gray-200 sticky top-0 bg-white z-10 pb-4">
            <div className="mt-4">
              <h2
                className="text-xl font-semibold text-gray-900 cursor-pointer select-none"
                onClick={() => setShowSeasonRange((prev) => !prev)}
              >
                Season {currentYear}
              </h2>
              {showSeasonRange && (
                <div className="text-sm text-gray-600 mt-1">
                  (from Jan 01 {previousYear} to Dec 31 {previousYear})
                </div>
              )}
            </div>

            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showAddForm ? "Cancel" : "Add Field"}
            </Button>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>

            {showAddForm && (
              <div className="mt-4">
                <div className="mb-2">
                  <p className="text-sm text-gray-700 font-semibold">Draw boundary on map</p>
                  <p className="text-xs text-gray-500">Click on the map to create field boundary points</p>
                </div>
                <Input
                  placeholder="Field Name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full mb-2"
                  disabled={!form.boundary}
                />
                {form.boundary && (
                  <Select value={form.crop} onValueChange={handleCropChange} required>
                    <SelectTrigger className="w-full mb-2">
                      <SelectValue placeholder="Select crop category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sugarcane">Sugarcane</SelectItem>
                      <SelectItem value="wheat">Wheat</SelectItem>
                      <SelectItem value="rice">Rice</SelectItem>
                      <SelectItem value="maize">Maize</SelectItem>
                      <SelectItem value="cotton">Cotton</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {form.boundary && form.name && form.crop && (
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`flex items-center mt-2 w-full justify-start ${dateRange.from && dateRange.to ? 'bg-green-100 text-green-900 font-semibold' : 'text-green-700'}`}
                        ref={calendarButtonRef}
                      >
                        <Calendar className="w-5 h-5 mr-2" />
                        <span>
                          {dateRange.from && dateRange.to
                            ? `${format(dateRange.from, 'MMM dd, yyyy')} to ${format(dateRange.to, 'MMM dd, yyyy')}`
                            : 'Select 14-day slot'}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full max-w-[400px] p-0" align="start" style={{ minWidth: 0, maxWidth: 400 }}>
                      <div className="px-3 pt-3 pb-0">
                        {dateRange.from && dateRange.to && (
                          <div className="text-sm font-semibold text-green-800 mb-2 text-center">
                            {format(dateRange.from, 'MMM dd, yyyy')} to {format(dateRange.to, 'MMM dd, yyyy')}
                          </div>
                        )}
                      </div>
                      <ShadCalendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => handleDateRangeSelect({ from: date })}
                        numberOfMonths={1}
                        disabled={(date) => isBefore(date, new Date(2000, 0, 1))}
                        modifiers={{
                          preview: hoveredDate
                            ? {
                                from: hoveredDate,
                                to: addDays(hoveredDate, 13),
                              }
                            : undefined,
                          selectedSlot: dateRange.from && dateRange.to
                            ? {
                                from: dateRange.from,
                                to: dateRange.to,
                              }
                            : undefined,
                        }}
                        modifiersClassNames={{
                          preview: "bg-green-100 border-green-400 text-green-800",
                          selectedSlot: "bg-green-700 text-white border-green-900",
                        }}
                        onDayMouseEnter={(date) => setHoveredDate(date)}
                        onDayMouseLeave={() => setHoveredDate(null)}
                        className="!p-1"
                      />
                      <style>{`
                        .rdp {
                          font-size: 13px !important;
                          width: 100% !important;
                          min-width: 0 !important;
                        }
                        .rdp-months {
                          gap: 0 !important;
                          width: 100% !important;
                          min-width: 0 !important;
                        }
                        .rdp-month {
                          width: 100% !important;
                          min-width: 0 !important;
                        }
                        .rdp-table {
                          margin: 0 !important;
                          width: 100% !important;
                          min-width: 0 !important;
                        }
                        .rdp-tbody, .rdp-thead, .rdp-tr {
                          width: 100% !important;
                        }
                        .rdp-table {
                          margin: 0 !important;
                          width: 100% !important;
                          min-width: 0 !important;
                          table-layout: fixed !important;
                        }
                        .rdp-months, .rdp-month, .rdp {
                          width: 100% !important;
                          min-width: 0 !important;
                          max-width: 100% !important;
                        }
                        .rdp-day, .rdp-day_selectedSlot, .rdp-day_preview {
                          height: 18px !important;
                          padding: 0 !important;
                          box-sizing: border-box !important;
                        }
                        .rdp-caption_label, .rdp-dropdown {
                          font-size: 13px !important;
                          padding: 0 2px !important;
                        }
                        .rdp-day_preview {
                          background: #d1fae5 !important;
                          color: #166534 !important;
                          border: 1.5px solid #22c55e !important;
                        }
                        .rdp-day_selectedSlot {
                          background: #166534 !important;
                          color: #fff !important;
                          border: 1.5px solid #166534 !important;
                        }
                        .rdp-day_selectedSlot.rdp-day_preview {
                          background: #166534 !important;
                          color: #fff !important;
                          border: 1.5px solid #166534 !important;
                        }
                      `}</style>
                    </PopoverContent>
                  </Popover>
                )}
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white mt-3"
                  onClick={handleConfirmSlot}
                  disabled={!(form.name && form.boundary && form.crop && dateRange.from && dateRange.to)}
                >
                  Save Field
                </Button>
                {error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertTitle className="text-green-800">Success</AlertTitle>
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          {/* Fields List */}
          <div className="flex-1 pt-6 pr-6 space-y-3 pb-6 overflow-y-auto fields-scroll-area">
            <style>{`
              .fields-scroll-area {
                scrollbar-width: none !important; /* Firefox */
                -ms-overflow-style: none !important; /* IE 10+ */
              }
              .fields-scroll-area::-webkit-scrollbar {
                display: none !important; /* Chrome, Safari, Edge */
              }
            `}</style>
            <h3 className="font-medium text-gray-900 mb-2">Your Fields</h3>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredFields.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-24 h-24 mb-4">
                  <img
                    src="/images/farmer-illustration.png"
                    alt="No fields"
                    className="w-full h-full object-contain opacity-70"
                  />
                </div>
                <p className="text-sm text-gray-500">No fields found. Add your first field.</p>
              </div>
            ) : (
              filteredFields.map((field) => {
                let mapImg = null;
                if (field.boundary && field.boundary.type === "Polygon" && Array.isArray(field.boundary.coordinates)) {
                  const ring = field.boundary.coordinates[0];
                  if (Array.isArray(ring) && ring.length > 2) {
                    const coords = ring.map(([lng, lat]) => `${lng},${lat}`).join(";");
                    mapImg = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/path-3+ff0000-2(${coords})/auto/200x120?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndjJ6bWl2bWgifQ.rJcFIG214AriISLbB6B5aw`;
                  }
                }
                return (
                  <Card key={field._id} className="border border-gray-100 shadow-md hover:shadow-xl hover:border-green-400 transition-all duration-200 rounded-2xl bg-gradient-to-br from-white via-green-50 to-green-100/60 group">
                    <CardContent className="p-5 relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-green-700 text-lg truncate group-hover:text-green-800 transition-colors">
                            {field.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs border-green-200 bg-green-100 text-green-700 group-hover:border-green-400 group-hover:bg-green-200 group-hover:text-green-800 transition-colors">
                              {field.crop ? field.crop.charAt(0).toUpperCase() + field.crop.slice(1) : "N/A"}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {field.createdAt ? format(new Date(field.createdAt), 'MMM dd, yyyy') : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-row gap-2 absolute top-3 right-3 z-10">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-blue-600 transition-colors h-8 w-8 flex items-center justify-center bg-white/80 shadow-sm border border-gray-100 hover:border-blue-200"
                            onClick={() => {
                              setEditField(field._id);
                              setEditForm({
                                name: field.name || '',
                                crop: field.crop || '',
                                from: field.from ? format(new Date(field.from), 'yyyy-MM-dd') : '',
                                to: field.to ? format(new Date(field.to), 'yyyy-MM-dd') : '',
                                saving: false
                              });
                            }}
                            aria-label="Edit"
                          >
                            <Pencil className="w-5 h-5" />
                          </Button>
                          <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-red-600 transition-colors h-8 w-8 flex items-center justify-center bg-white/80 shadow-sm border border-gray-100 hover:border-red-200"
                              onClick={async (e) => {
                                   e.preventDefault();
                                   e.stopPropagation();
                                   if (!field._id) return;
                                   try {
                                     await fieldsAPI.deleteField(field._id);
                                     setFields(prevFields => prevFields.filter(f => f._id !== field._id));
                                     toast.success("Field deleted successfully!");
                                   } catch (err) {
                                     console.error("Delete field error:", err);
                                     toast.error(err.response?.data?.message || "Failed to delete field");
                                   }
                                 }}
                              aria-label="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                        </div>
                      </div>
                      {field.boundary && field.boundary.type === "Polygon" && Array.isArray(field.boundary.coordinates) && (
                        <div className="w-full h-28 rounded-xl mb-3 overflow-hidden border border-green-100 shadow-sm">
                          <MapContainer
                            style={{ width: "100%", height: "100%" }}
                            bounds={L.latLngBounds(field.boundary.coordinates[0].map(([lng, lat]) => [lat, lng]))}
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
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Polygon
                              positions={field.boundary.coordinates[0].map(([lng, lat]) => [lat, lng])}
                              pathOptions={{ color: "#22c55e", weight: 2 }}
                            />
                          </MapContainer>
                        </div>
                      )}
                      <div className="flex flex-row items-center justify-center mt-4 gap-3">
                        <Button
                          size="sm"
                          onClick={() => handlePredict(field._id)}
                          disabled={predicting === field._id}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white transition-colors h-8 px-5 rounded-lg shadow-md font-semibold"
                        >
                          {predicting === field._id ? "Predicting..." : "Run Prediction"}
                        </Button>
                        {predicting === field._id && (
                          <Button
                            size="sm"
                            onClick={() => setPredicting(null)}
                            className="text-xs bg-gray-200 hover:bg-gray-300 text-black transition-colors h-8 px-4 rounded-lg shadow-sm ml-2"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                      {editField === field._id && editForm && (
                        <div className={`mt-4 p-4 rounded-lg bg-white shadow border border-green-200 relative transition-all duration-300 ${editForm.saving ? 'blur-sm pointer-events-none' : ''}`}>
                          <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={() => { setEditField(null); setEditForm(null); }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <h3 className="text-lg font-semibold mb-4">Edit Field</h3>
                          <div className="space-y-3">
                            <Input
                              placeholder="Field Name"
                              name="editName"
                              type="text"
                              value={editForm.name}
                              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full"
                            />
                            <Select value={editForm.crop} onValueChange={val => setEditForm({ ...editForm, crop: val })}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select crop category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sugarcane">Sugarcane</SelectItem>
                                <SelectItem value="wheat">Wheat</SelectItem>
                                <SelectItem value="rice">Rice</SelectItem>
                                <SelectItem value="maize">Maize</SelectItem>
                                <SelectItem value="cotton">Cotton</SelectItem>
                              </SelectContent>
                            </Select>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Slot (14 days)</label>
                              <Input
                                type="date"
                                value={editForm.from}
                                onChange={e => {
                                  const from = e.target.value;
                                  const to = from ? format(addDays(new Date(from), 13), 'yyyy-MM-dd') : '';
                                  setEditForm({ ...editForm, from, to });
                                }}
                                className="w-full"
                              />
                              {editForm.from && editForm.to && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {format(new Date(editForm.from), 'MMM dd, yyyy')} to {format(new Date(editForm.to), 'MMM dd, yyyy')}
                                </div>
                              )}
                            </div>
                            <Button
                              className="w-full bg-green-600 hover:bg-green-700 text-white mt-2"
                              onClick={async () => {
                                setEditForm({ ...editForm, saving: true });
                                try {
                                  await fieldsAPI.updateSlot(field._id, {
                                    name: editForm.name,
                                    crop: editForm.crop,
                                    from: editForm.from,
                                    to: editForm.to
                                  });
                                  toast.success('Field updated successfully!');
                                  setTimeout(() => { setEditField(null); setEditForm(null); }, 500); // Blur for 0.5s then close
                                  // Refresh fields
                                  if (token) {
                                    const res = await fieldsAPI.getAllFields();
                                    setFields(res.data);
                                  }
                                } catch (err) {
                                  toast.error('Failed to update field');
                                  setEditForm({ ...editForm, saving: false });
                                }
                              }}
                              disabled={!editForm.name || !editForm.crop || !editForm.from || !editForm.to || editForm.saving}
                            >
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      )}
                      {predictions[field._id] && (
                        <>
                          <div className="mt-4 p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl text-xs border border-green-200 shadow-inner">
                            <span className="font-semibold text-green-700">Prediction:</span>
                            <div className="mt-1 text-green-700 truncate">
                              {JSON.stringify(predictions[field._id], null, 2)}
                            </div>
                          </div>
                          <button
                            className="mt-3 w-full py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white font-semibold shadow transition-all text-sm"
                            onClick={() => navigate('/dashboard', { state: { fieldId: field._id } })}
                          >
                            View Analytics
                          </button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Map Section - Fixed to prevent overlapping */}
        <div className="flex-1 h-full relative">
          <FieldMap 
            onBoundaryChange={handleBoundaryChange} 
            fields={fields} 
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  )
}

export default Fields

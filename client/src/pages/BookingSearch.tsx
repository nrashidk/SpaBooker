import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Clock, Sparkles, Hand, Scissors, Flower2, Star, Droplet } from "lucide-react";

export default function BookingSearch() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [dateQuery, setDateQuery] = useState("");
  const [timeQuery, setTimeQuery] = useState("");

  const handleSearch = (overrideSearch?: string) => {
    // Navigate to booking flow with search parameters
    const params = new URLSearchParams();
    const search = String(overrideSearch ?? searchQuery ?? '').trim();
    if (search) params.set("search", search);
    const location = String(locationQuery ?? '').trim();
    if (location) params.set("location", location);
    const date = String(dateQuery ?? '').trim();
    if (date) params.set("date", date);
    const time = String(timeQuery ?? '').trim();
    if (time) params.set("time", time);
    
    setLocation(`/booking/flow?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Book local beauty and wellness services
            </h1>
          </div>

          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              {/* Treatments and Venues */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="All treatments and venues"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  data-testid="input-search-treatments"
                />
              </div>

              {/* Location */}
              <div className="relative flex-1 border-l dark:border-gray-700">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Current location"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  data-testid="input-search-location"
                />
              </div>

              {/* Date */}
              <div className="relative flex-1 border-l dark:border-gray-700">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="date"
                  placeholder="Any date"
                  value={dateQuery}
                  onChange={(e) => setDateQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  data-testid="input-search-date"
                />
              </div>

              {/* Time */}
              <div className="relative flex-1 border-l dark:border-gray-700 flex items-center">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="time"
                  placeholder="Any time"
                  value={timeQuery}
                  onChange={(e) => setTimeQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  data-testid="input-search-time"
                />
                <Button 
                  onClick={() => handleSearch()}
                  className="ml-2 h-12 px-8 rounded-xl font-semibold"
                  data-testid="button-search"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="text-center mt-8">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              <span className="font-bold text-2xl text-gray-900 dark:text-white">271,257</span> appointments booked today
            </p>
          </div>

          {/* Quick Browse Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Popular Services</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Massage", Icon: Hand },
                { name: "Facial", Icon: Sparkles },
                { name: "Manicure", Icon: Hand },
                { name: "Hair Styling", Icon: Scissors },
                { name: "Waxing", Icon: Star },
                { name: "Spa Package", Icon: Droplet },
                { name: "Body Treatment", Icon: Flower2 },
                { name: "Makeup", Icon: Sparkles },
              ].map((service) => (
                <button
                  key={service.name}
                  onClick={() => handleSearch(service.name)}
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover-elevate active-elevate-2 text-center transition-all"
                  data-testid={`quick-service-${service.name.toLowerCase().replace(" ", "-")}`}
                >
                  <service.Icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

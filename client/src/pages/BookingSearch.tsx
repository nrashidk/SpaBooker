import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Calendar, Clock, Sparkles, Hand, Scissors, Flower2, Star, Droplet, Users, DollarSign } from "lucide-react";
import type { Spa, Service, Staff } from "@shared/schema";

type SearchResult = Spa & { services: Service[]; staff: Staff[] };

export default function BookingSearch() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [dateQuery, setDateQuery] = useState("");
  const [timeQuery, setTimeQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Build query URL for API
  const buildQueryUrl = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (locationQuery.trim()) params.set("location", locationQuery.trim());
    if (dateQuery.trim()) params.set("date", dateQuery.trim());
    if (timeQuery.trim()) params.set("time", timeQuery.trim());
    const queryString = params.toString();
    return `/api/search/spas${queryString ? `?${queryString}` : ''}`;
  };

  // Fetch search results
  const { data: searchResults, isLoading } = useQuery<SearchResult[]>({
    queryKey: [buildQueryUrl()],
    enabled: hasSearched,
  });

  const handleSearch = (overrideSearch?: string) => {
    if (overrideSearch) {
      // Set search query and trigger search in next render
      setSearchQuery(overrideSearch);
      // Use setTimeout to ensure state update completes before enabling query
      setTimeout(() => setHasSearched(true), 0);
    } else {
      setHasSearched(true);
    }
  };

  const handleBookSpa = (spaId: number) => {
    // Navigate to booking flow with selected spa
    const params = new URLSearchParams();
    params.set("spaId", spaId.toString());
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (dateQuery.trim()) params.set("date", dateQuery.trim());
    if (timeQuery.trim()) params.set("time", timeQuery.trim());
    
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

          {/* Search Results Section */}
          {hasSearched && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">
                {isLoading ? "Searching..." : `Found ${searchResults?.length || 0} spas`}
              </h2>
              
              {isLoading ? (
                <div className="grid gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32 mt-2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <div className="grid gap-6" data-testid="search-results">
                  {searchResults.map((spa) => (
                    <Card key={spa.id} className="hover-elevate" data-testid={`spa-card-${spa.id}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-2xl" data-testid={`spa-name-${spa.id}`}>
                                {spa.name}
                              </CardTitle>
                              {spa.featured && (
                                <Badge variant="default" data-testid={`spa-featured-${spa.id}`}>
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {spa.address}
                              </span>
                              {spa.rating && (
                                <span className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  {typeof spa.rating === 'string' ? parseFloat(spa.rating).toFixed(1) : spa.rating.toFixed(1)}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          <Button 
                            onClick={() => handleBookSpa(spa.id)}
                            size="lg"
                            data-testid={`button-book-spa-${spa.id}`}
                          >
                            Book Now
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {spa.description && (
                          <p className="text-muted-foreground mb-4">{spa.description}</p>
                        )}
                        
                        <div className="space-y-4">
                          {/* Services */}
                          {spa.services.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Services ({spa.services.length})
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {spa.services.slice(0, 6).map((service) => (
                                  <Badge key={service.id} variant="secondary" data-testid={`service-${service.id}`}>
                                    {service.name} - ${typeof service.price === 'string' ? parseFloat(service.price).toFixed(2) : service.price.toFixed(2)}
                                  </Badge>
                                ))}
                                {spa.services.length > 6 && (
                                  <Badge variant="outline">+{spa.services.length - 6} more</Badge>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Staff */}
                          {spa.staff.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Team ({spa.staff.length})
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {spa.staff.slice(0, 5).map((member) => (
                                  <Badge key={member.id} variant="outline" data-testid={`staff-${member.id}`}>
                                    {member.name}
                                  </Badge>
                                ))}
                                {spa.staff.length > 5 && (
                                  <Badge variant="outline">+{spa.staff.length - 5} more</Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground text-lg">
                      No spas found. Try adjusting your search criteria.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Quick Browse Section */}
          {!hasSearched && (
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
          )}
        </div>
      </div>
    </div>
  );
}

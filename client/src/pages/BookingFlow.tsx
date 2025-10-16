import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import ServiceCategorySelector, { type Service } from "@/components/ServiceCategorySelector";
import ProfessionalSelector, { type Professional, type ServiceProfessionalMap } from "@/components/ProfessionalSelector";
import TimeSelectionView from "@/components/TimeSelectionView";
import BookingConfirmation from "@/components/BookingConfirmation";
import CustomerDetailsForm, { type CustomerFormData } from "@/components/CustomerDetailsForm";
import BookingSummary from "@/components/BookingSummary";
import BookingSteps from "@/components/BookingSteps";
import ThemeToggle from "@/components/ThemeToggle";
import type { Spa, Service as DbService, Staff } from "@shared/schema";

//todo: remove mock functionality
const mockServices: Service[] = [
  {
    id: "1",
    name: "Express Haircut - اكسبريس قص الشعر - عادي",
    description: "Quick and professional haircut service",
    duration: 25,
    price: 50,
    category: "Hair Services",
    featured: true,
    package: {
      description: "Get 6 sessions for AED 250 with 5 Haircuts + 1 Free Haircut ✨",
      originalPrice: 300,
    },
  },
  {
    id: "2",
    name: "Beard Styling- خط اللحية",
    description: "Professional beard trim and styling",
    duration: 25,
    price: 50,
    category: "Shave Services",
    featured: true,
  },
  {
    id: "3",
    name: "Headshave - حلق الرأس (على الصفر)",
    description: "Complete head shave service",
    duration: 25,
    price: 50,
    category: "Hair Services",
  },
  {
    id: "4",
    name: "Little Master Haircut - قص الشعر|الأطفل",
    description: "Haircut for children",
    duration: 25,
    price: 40,
    category: "Hair Services",
  },
  {
    id: "5",
    name: "Executive Pedicure - اكسيكيوتف بادكير - حامي (دقيقة)",
    description: "Premium pedicure service",
    duration: 40,
    price: 80,
    category: "Nails",
    featured: true,
    discount: 33,
  },
  {
    id: "6",
    name: "Executive Manicure - اكسيكيوتف مانيكير - حامي (دقيقة)",
    description: "Premium manicure service",
    duration: 30,
    price: 65,
    category: "Nails",
    discount: 24,
  },
];

//todo: remove mock functionality
const mockProfessionals: Professional[] = [
  {
    id: "1",
    name: "Saqib",
    specialty: "Hairdresser/Massage Therapist",
    rating: 4.9,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    specialty: "Skincare Specialist",
    rating: 4.8,
  },
  {
    id: "3",
    name: "Michael Chen",
    specialty: "Massage Therapist",
    rating: 4.7,
  },
];

//todo: remove mock functionality  
const mockTimeSlots = [
  { time: "5:30PM", available: true, price: 180, originalPrice: 220, discount: 18 },
  { time: "5:45PM", available: true, price: 180, originalPrice: 220, discount: 18 },
  { time: "6:00PM", available: true, price: 180, originalPrice: 220, discount: 18 },
  { time: "6:15PM", available: true, price: 180, originalPrice: 220, discount: 18 },
  { time: "6:30PM", available: true, price: 180, originalPrice: 220, discount: 18 },
  { time: "6:45PM", available: true, price: 180, originalPrice: 220, discount: 18 },
  { time: "7:00PM", available: true, price: 180, originalPrice: 220, discount: 18 },
  { time: "7:15PM", available: true, price: 180, originalPrice: 220, discount: 18 },
  { time: "7:30PM", available: true, price: 180, originalPrice: 220, discount: 18 },
  { time: "7:45PM", available: true, price: 180, originalPrice: 220, discount: 18 },
  { time: "8:00PM", available: true, price: 180, originalPrice: 220, discount: 18 },
];

export default function BookingPage() {
  const [location] = useLocation();
  const [step, setStep] = useState(1);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [professionalMode, setProfessionalMode] = useState<'any' | 'per-service' | 'specific' | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [serviceProfessionalMap, setServiceProfessionalMap] = useState<ServiceProfessionalMap>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerFormData | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Get spaId from URL parameters (wouter's useLocation only returns pathname, so use window.location.search)
  const urlParams = new URLSearchParams(window.location.search);
  const spaId = urlParams.get('spaId');

  // Fetch spa details
  const { data: spa } = useQuery<Spa>({
    queryKey: [`/api/spas/${spaId}`],
    enabled: !!spaId,
  });

  // Fetch services for the spa
  const { data: dbServices = [] } = useQuery<DbService[]>({
    queryKey: [`/api/spas/${spaId}/services`],
    enabled: !!spaId,
  });

  // Fetch staff for the spa
  const { data: dbStaff = [] } = useQuery<Staff[]>({
    queryKey: [`/api/spas/${spaId}/staff`],
    enabled: !!spaId,
  });

  // Convert DB services to component format
  const services: Service[] = dbServices.map(s => ({
    id: s.id.toString(),
    name: s.name,
    description: s.description || '',
    duration: s.duration,
    price: typeof s.price === 'string' ? parseFloat(s.price) : s.price,
    category: s.categoryId?.toString() || 'General',
  }));

  // Convert DB staff to component format
  const professionals: Professional[] = dbStaff.map(s => ({
    id: s.id.toString(),
    name: s.name,
    specialty: s.specialty || 'Staff Member',
    rating: typeof s.rating === 'string' ? parseFloat(s.rating) : (s.rating || 5.0),
  }));

  const spaName = spa?.name || "Loading...";

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleContinueToProfessional = () => {
    if (selectedServiceIds.length > 0) {
      setStep(2);
    }
  };

  const handleContinueToTime = () => {
    if (professionalMode !== null) {
      setStep(3);
    }
  };

  const handleContinueToDetails = () => {
    if (selectedTime) {
      setStep(4);
    }
  };

  const handleCustomerDetailsSubmit = async (data: CustomerFormData) => {
    setCustomerDetails(data);
    
    try {
      // Validate required data
      if (!spaId || isNaN(parseInt(spaId))) {
        throw new Error('Invalid spa selection. Please try again.');
      }

      if (selectedServiceIds.length === 0) {
        throw new Error('Please select at least one service');
      }

      if (!selectedDate || !selectedTime) {
        throw new Error('Please select a date and time');
      }

      // Prepare booking data
      const bookingData = {
        spaId: parseInt(spaId),
        customerName: data.name,
        customerEmail: data.email || undefined,
        customerPhone: data.mobile || undefined,
        services: selectedServiceIds,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        staffId: professionalMode === 'specific' && selectedProfessionalId ? parseInt(selectedProfessionalId) : null,
        notes: '',
      };

      // Send to backend to save booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create booking');
      }

      const result = await response.json();
      console.log('Booking created:', result);
      
      setIsConfirmed(true);
    } catch (error) {
      console.error('Error creating booking:', error);
      // Show error toast or message
      alert('Failed to create booking. Please try again.');
    }
  };

  const handleNewBooking = () => {
    setStep(1);
    setSelectedServiceIds([]);
    setProfessionalMode(null);
    setSelectedProfessionalId(null);
    setServiceProfessionalMap({});
    setSelectedDate(null);
    setSelectedTime(null);
    setCustomerDetails(null);
    setIsConfirmed(false);
  };

  const selectedServices = services.filter(s => selectedServiceIds.includes(s.id));
  const selectedProfessional = professionals.find(p => p.id === selectedProfessionalId) || null;
  
  // Calculate total duration of selected services
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

  // Fetch available time slots for selected date and services
  const shouldFetchSlots = step === 3 && !!spaId && !!selectedDate && selectedServiceIds.length > 0;
  const staffForSlots = professionalMode === 'specific' && selectedProfessionalId ? parseInt(selectedProfessionalId) : undefined;
  
  const { data: availableSlots = [], isLoading: slotsLoading } = useQuery({
    queryKey: [
      `/api/spas/${spaId}/available-slots`,
      selectedDate?.toISOString().split('T')[0],
      totalDuration,
      staffForSlots
    ],
    queryFn: async () => {
      if (!selectedDate) {
        throw new Error('Date is required');
      }
      const params = new URLSearchParams({
        date: selectedDate.toISOString().split('T')[0],
        duration: totalDuration.toString(),
        ...(staffForSlots && { staffId: staffForSlots.toString() })
      });
      const response = await fetch(`/api/spas/${spaId}/available-slots?${params}`);
      if (!response.ok) throw new Error('Failed to fetch slots');
      return response.json();
    },
    enabled: shouldFetchSlots,
  });
  
  const getStaffName = () => {
    if (professionalMode === 'any') return "Any Available";
    if (professionalMode === 'specific' && selectedProfessional) return selectedProfessional.name;
    if (professionalMode === 'per-service') {
      const professionalNames = Object.values(serviceProfessionalMap)
        .map(id => professionals.find(p => p.id === id)?.name)
        .filter(Boolean);
      return professionalNames.length > 0 ? professionalNames.join(', ') : "Per Service";
    }
    return "Not Selected";
  };

  if (isConfirmed) {
    // Safety check: ensure we have required data before showing confirmation
    if (!selectedDate || !selectedTime) {
      console.error('Missing required booking data');
      return null;
    }

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b sticky top-0 bg-background z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold" data-testid="spa-name">{spaName}</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <BookingConfirmation
            services={selectedServices}
            date={selectedDate}
            time={selectedTime}
            staffName={getStaffName()}
            customerName={customerDetails?.name || "Customer"}
            customerPhone={customerDetails?.mobile || ""}
            customerEmail={customerDetails?.email || ""}
            smsNotificationSent={!!customerDetails?.mobile}
            emailNotificationSent={!!customerDetails?.email}
            onNewBooking={handleNewBooking}
            spaName={spaName}
          />
        </main>
      </div>
    );
  }

  const breadcrumbItems = ["Services", "Professional", "Time", "Details"];
  const currentBreadcrumb = breadcrumbItems[step - 1];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold" data-testid="spa-name">{spaName}</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            {breadcrumbItems.map((item, index) => (
              <div key={item} className="flex items-center gap-2">
                <span
                  className={`${
                    index + 1 === step
                      ? 'text-foreground font-medium'
                      : index + 1 < step
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item}
                </span>
                {index < breadcrumbItems.length - 1 && (
                  <span className="text-muted-foreground">›</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {step === 1 && (
            <div>
              <h2 className="text-4xl font-bold mb-8">Services</h2>
              <ServiceCategorySelector
                selectedServiceIds={selectedServiceIds}
                onServiceToggle={handleServiceToggle}
                services={mockServices}
                onContinue={handleContinueToProfessional}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-4xl font-bold mb-8">Select professional</h2>
              <ProfessionalSelector
                selectedProfessionalId={selectedProfessionalId}
                onProfessionalSelect={setSelectedProfessionalId}
                professionals={mockProfessionals}
                onContinue={handleContinueToTime}
                mode={professionalMode}
                onModeChange={setProfessionalMode}
                services={selectedServices.map(s => ({ id: s.id, name: s.name }))}
                serviceProfessionalMap={serviceProfessionalMap}
                onServiceProfessionalMapChange={setServiceProfessionalMap}
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-4xl font-bold mb-8">Select time</h2>
              <TimeSelectionView
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                selectedProfessional={selectedProfessional}
                onDateSelect={setSelectedDate}
                onTimeSelect={setSelectedTime}
                onProfessionalChange={(id) => {
                  if (id === 'any') {
                    setProfessionalMode('any');
                    setSelectedProfessionalId(null);
                  } else {
                    setProfessionalMode('specific');
                    setSelectedProfessionalId(id);
                  }
                }}
                timeSlots={availableSlots}
                professionals={professionalMode === 'any' ? mockProfessionals : []}
                onContinue={handleContinueToDetails}
              />
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-4xl font-bold mb-8">Confirm booking</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CustomerDetailsForm
                  onSubmit={handleCustomerDetailsSubmit}
                />
                <BookingSummary
                  services={selectedServices}
                  date={selectedDate}
                  time={selectedTime}
                  staffName={getStaffName()}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

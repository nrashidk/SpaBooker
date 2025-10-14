import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ServiceSelector, { type Service } from "@/components/ServiceSelector";
import BookingCalendar from "@/components/BookingCalendar";
import TimeSlotPicker from "@/components/TimeSlotPicker";
import StaffSelector from "@/components/StaffSelector";
import CustomerDetailsForm from "@/components/CustomerDetailsForm";
import BookingSummary from "@/components/BookingSummary";
import BookingConfirmation from "@/components/BookingConfirmation";
import BookingSteps from "@/components/BookingSteps";
import ThemeToggle from "@/components/ThemeToggle";

//todo: remove mock functionality
const mockServices: Service[] = [
  {
    id: "1",
    name: "Swedish Massage",
    description: "Relaxing full-body massage with gentle pressure",
    duration: 60,
    price: 80,
  },
  {
    id: "2",
    name: "Deep Tissue Massage",
    description: "Therapeutic massage targeting muscle tension",
    duration: 90,
    price: 110,
  },
  {
    id: "3",
    name: "Aromatherapy Facial",
    description: "Rejuvenating facial with essential oils",
    duration: 45,
    price: 65,
  },
  {
    id: "4",
    name: "Hot Stone Therapy",
    description: "Soothing heated stone massage treatment",
    duration: 75,
    price: 95,
  },
];

//todo: remove mock functionality
const mockStaff = [
  { id: "1", name: "Sarah Johnson", specialty: "Massage Therapist", available: true },
  { id: "2", name: "Michael Chen", specialty: "Skincare Specialist", available: true },
  { id: "3", name: "Emma Williams", specialty: "Aromatherapist", available: false },
  { id: "4", name: "David Martinez", specialty: "Wellness Expert", available: true },
];

//todo: remove mock functionality
const mockTimeSlots = [
  { time: "9:00 AM", available: true, duration: 60 },
  { time: "10:00 AM", available: true, duration: 60 },
  { time: "11:00 AM", available: false, duration: 60 },
  { time: "12:00 PM", available: true, duration: 60 },
  { time: "1:00 PM", available: false, duration: 60 },
  { time: "2:00 PM", available: true, duration: 60 },
  { time: "3:00 PM", available: true, duration: 60 },
  { time: "4:00 PM", available: true, duration: 60 },
  { time: "5:00 PM", available: false, duration: 60 },
  { time: "6:00 PM", available: true, duration: 60 },
];

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleContinueToDate = () => {
    if (selectedServiceIds.length > 0) {
      setStep(2);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setStep(3);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(4);
  };

  const handleStaffSelect = (staffId: string | null) => {
    setSelectedStaffId(staffId);
  };

  const handleContinueToDetails = () => {
    setStep(5);
  };

  const handleCustomerSubmit = (data: any) => {
    setCustomerDetails(data);
    setIsConfirmed(true);
    console.log("Booking confirmed:", {
      services: selectedServices,
      date: selectedDate,
      time: selectedTime,
      staffId: selectedStaffId,
      customer: data,
    });
  };

  const handleNewBooking = () => {
    setStep(1);
    setSelectedServiceIds([]);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedStaffId(null);
    setCustomerDetails(null);
    setIsConfirmed(false);
  };

  const selectedServices = mockServices.filter(s => selectedServiceIds.includes(s.id));
  const selectedStaff = mockStaff.find(s => s.id === selectedStaffId);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

  if (isConfirmed && customerDetails) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b sticky top-0 bg-background z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Serene Spa</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <BookingConfirmation
            services={selectedServices}
            date={selectedDate!}
            time={selectedTime!}
            staffName={selectedStaff?.name || null}
            customerName={customerDetails.name}
            customerPhone={customerDetails.phone}
            customerEmail={customerDetails.email}
            smsNotificationSent={true}
            emailNotificationSent={!!customerDetails.email}
            onNewBooking={handleNewBooking}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Serene Spa</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <BookingSteps
        currentStep={step}
        steps={["Services", "Date", "Time", "Staff", "Details"]}
      />

      <main className="container mx-auto px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Book Your Spa Experience</h2>
            <p className="text-muted-foreground">
              Select your services and choose your preferred date, time, and specialist
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {step >= 1 && (
                <div className="space-y-4">
                  <ServiceSelector
                    selectedServiceIds={selectedServiceIds}
                    onServiceToggle={handleServiceToggle}
                    services={mockServices}
                  />
                  {selectedServiceIds.length > 0 && (
                    <Button
                      onClick={handleContinueToDate}
                      className="w-full"
                      data-testid="button-continue-to-date"
                    >
                      Continue to Date Selection
                    </Button>
                  )}
                </div>
              )}

              {step >= 2 && (
                <BookingCalendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  unavailableDates={[new Date(2025, 9, 18), new Date(2025, 9, 22)]}
                />
              )}

              {step >= 3 && selectedDate && (
                <TimeSlotPicker
                  selectedTime={selectedTime}
                  onTimeSelect={handleTimeSelect}
                  timeSlots={mockTimeSlots}
                  totalDuration={totalDuration}
                />
              )}

              {step >= 4 && selectedTime && (
                <div className="space-y-4">
                  <StaffSelector
                    selectedStaffId={selectedStaffId}
                    onStaffSelect={handleStaffSelect}
                    staff={mockStaff}
                  />
                  <Button
                    onClick={handleContinueToDetails}
                    className="w-full"
                    data-testid="button-continue-to-details"
                  >
                    Continue to Details
                  </Button>
                </div>
              )}

              {step >= 5 && (
                <CustomerDetailsForm
                  onSubmit={handleCustomerSubmit}
                />
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BookingSummary
                  services={selectedServices}
                  date={selectedDate}
                  time={selectedTime}
                  staffName={selectedStaff?.name || null}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

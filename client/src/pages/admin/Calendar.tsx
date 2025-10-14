import { Calendar as BigCalendar, dateFnsLocalizer, View, SlotInfo } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format as formatDate, parse as parseDate, startOfWeek as getStartOfWeek, getDay as getDayOfWeek } from 'date-fns';
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Booking, BookingItem, Staff, Service, Customer } from '@shared/schema';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const localizer = dateFnsLocalizer({
  format: formatDate,
  parse: parseDate,
  startOfWeek: getStartOfWeek,
  getDay: getDayOfWeek,
  locales: {},
});

const DragAndDropCalendar = withDragAndDrop(BigCalendar);

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resourceId?: number;
  booking: Booking;
  customer?: Customer;
  service?: Service;
  staff?: Staff;
}

export default function AdminCalendar() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('week');
  
  // Booking dialog state
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date; resourceId?: number } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  // Booking form state
  const [formCustomerId, setFormCustomerId] = useState<string>('');
  const [formServiceId, setFormServiceId] = useState<string>('');
  const [formStaffId, setFormStaffId] = useState<string>('');
  const [formDate, setFormDate] = useState<string>('');
  const [formTime, setFormTime] = useState<string>('');
  const [formStatus, setFormStatus] = useState<string>('confirmed');

  // Fetch all required data
  const { data: bookings = [], isLoading: bookingsLoading, isError: bookingsError } = useQuery<Booking[]>({
    queryKey: ['/api/admin/bookings'],
  });

  const { data: bookingItems = [], isLoading: itemsLoading } = useQuery<BookingItem[]>({
    queryKey: ['/api/admin/booking-items'],
  });

  const { data: staff = [], isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ['/api/admin/staff'],
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['/api/admin/services'],
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ['/api/admin/customers'],
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/bookings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/booking-items'] });
      setIsBookingDialogOpen(false);
      resetForm();
      toast({
        title: "Booking created",
        description: "The booking has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update booking mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PUT', `/api/admin/bookings/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/booking-items'] });
      setIsBookingDialogOpen(false);
      setSelectedEvent(null);
      resetForm();
      toast({
        title: "Booking updated",
        description: "The booking has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete booking mutation
  const deleteBookingMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/bookings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/booking-items'] });
      setIsBookingDialogOpen(false);
      setSelectedEvent(null);
      resetForm();
      toast({
        title: "Booking deleted",
        description: "The booking has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Transform bookings to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return bookings.map(booking => {
      const customer = customers.find(c => c.id === booking.customerId);
      const items = bookingItems.filter(item => item.bookingId === booking.id);
      const firstItem = items[0];
      const service = firstItem ? services.find(s => s.id === firstItem.serviceId) : null;
      const staffMember = staff.find(s => s.id === booking.staffId);
      
      const duration = firstItem?.duration || 30;
      const startTime = new Date(booking.bookingDate);
      const endTime = new Date(startTime.getTime() + duration * 60000);

      return {
        id: booking.id,
        title: `${customer?.name || 'Customer'} - ${service?.name || 'Service'}`,
        start: startTime,
        end: endTime,
        resourceId: booking.staffId || undefined,
        booking,
        customer,
        service: service || undefined,
        staff: staffMember,
      };
    });
  }, [bookings, bookingItems, customers, services, staff]);

  // Resources (staff members)
  const resources = useMemo(() => {
    return staff.map(member => ({
      id: member.id,
      title: member.name,
      avatar: member.avatarUrl,
    }));
  }, [staff]);

  // Reset form
  const resetForm = () => {
    setFormCustomerId('');
    setFormServiceId('');
    setFormStaffId('');
    setFormDate('');
    setFormTime('');
    setFormStatus('confirmed');
    setSelectedSlot(null);
    setSelectedEvent(null);
  };

  // Handle slot selection (click on empty calendar slot)
  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setSelectedSlot({
      start: slotInfo.start as Date,
      end: slotInfo.end as Date,
      resourceId: slotInfo.resourceId as number | undefined,
    });
    
    // Pre-fill form with selected slot data
    const date = slotInfo.start as Date;
    setFormDate(formatDate(date, 'yyyy-MM-dd'));
    setFormTime(formatDate(date, 'HH:mm'));
    if (slotInfo.resourceId) {
      setFormStaffId(String(slotInfo.resourceId));
    }
    
    setIsBookingDialogOpen(true);
  }, []);

  // Handle event selection (click on existing booking)
  const handleSelectEvent = useCallback((event: any) => {
    const calendarEvent = event as CalendarEvent;
    setSelectedEvent(calendarEvent);
    
    // Pre-fill form with event data
    setFormCustomerId(String(calendarEvent.booking.customerId));
    setFormServiceId(calendarEvent.service ? String(calendarEvent.service.id) : '');
    setFormStaffId(calendarEvent.booking.staffId ? String(calendarEvent.booking.staffId) : '');
    setFormDate(formatDate(calendarEvent.start, 'yyyy-MM-dd'));
    setFormTime(formatDate(calendarEvent.start, 'HH:mm'));
    setFormStatus(calendarEvent.booking.status);
    
    setIsBookingDialogOpen(true);
  }, []);

  // Handle new booking button
  const handleNewBooking = () => {
    resetForm();
    setFormDate(formatDate(new Date(), 'yyyy-MM-dd'));
    setFormTime(formatDate(new Date(), 'HH:mm'));
    setIsBookingDialogOpen(true);
  };

  // Handle form submission
  const handleSubmitBooking = () => {
    if (!formCustomerId || !formServiceId || !formDate || !formTime) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const bookingDateTime = new Date(`${formDate}T${formTime}`);
    const selectedService = services.find(s => s.id === Number(formServiceId));
    
    if (selectedEvent) {
      // Update existing booking - include services to update booking items
      updateBookingMutation.mutate({
        id: selectedEvent.booking.id,
        data: {
          customerId: Number(formCustomerId),
          staffId: formStaffId ? Number(formStaffId) : null,
          bookingDate: bookingDateTime,
          totalAmount: String(selectedService?.price || 0),
          status: formStatus,
          services: [{ serviceId: Number(formServiceId), duration: selectedService?.duration || 30 }],
        },
      });
    } else {
      // Create new booking
      createBookingMutation.mutate({
        customerId: Number(formCustomerId),
        staffId: formStaffId ? Number(formStaffId) : null,
        bookingDate: bookingDateTime,
        totalAmount: String(selectedService?.price || 0),
        status: formStatus,
        services: [{ serviceId: Number(formServiceId), duration: selectedService?.duration || 30 }],
      });
    }
  };

  // Handle booking deletion
  const handleDeleteBooking = () => {
    if (!selectedEvent) return;
    
    if (confirm('Are you sure you want to delete this booking?')) {
      deleteBookingMutation.mutate(selectedEvent.booking.id);
    }
  };

  // Handle event drag and drop
  const onEventDrop = useCallback(
    ({ event, start, end, resourceId }: any) => {
      const calendarEvent = event as CalendarEvent;
      
      updateBookingMutation.mutate({
        id: calendarEvent.booking.id,
        data: {
          bookingDate: start,
          staffId: resourceId || calendarEvent.booking.staffId,
        },
      });
    },
    [updateBookingMutation]
  );

  // Handle event resize
  const onEventResize = useCallback(
    ({ event, start, end }: any) => {
      const calendarEvent = event as CalendarEvent;
      
      updateBookingMutation.mutate({
        id: calendarEvent.booking.id,
        data: {
          bookingDate: start,
        },
      });
    },
    [updateBookingMutation]
  );

  // Check loading and error states AFTER all hooks
  const isLoading = bookingsLoading || itemsLoading || staffLoading || servicesLoading || customersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (bookingsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load calendar data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Event style getter
  const eventStyleGetter = (event: CalendarEvent) => {
    const statusColors = {
      confirmed: { backgroundColor: '#3b82f6', borderColor: '#2563eb' },
      pending: { backgroundColor: '#f59e0b', borderColor: '#d97706' },
      completed: { backgroundColor: '#10b981', borderColor: '#059669' },
      cancelled: { backgroundColor: '#ef4444', borderColor: '#dc2626' },
      'no-show': { backgroundColor: '#6b7280', borderColor: '#4b5563' },
    };

    const colors = statusColors[event.booking.status as keyof typeof statusColors] || statusColors.pending;

    return {
      style: {
        ...colors,
        color: 'white',
        borderRadius: '4px',
        border: `1px solid ${colors.borderColor}`,
        fontSize: '0.875rem',
      },
    };
  };

  // Custom resource header
  const ResourceHeader = ({ label, resource }: any) => {
    const staffMember = staff.find(s => s.id === resource.id);
    if (!staffMember) return <div>{label}</div>;

    const initials = staffMember.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();

    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <Avatar className="h-10 w-10">
          {staffMember.avatarUrl && <AvatarImage src={staffMember.avatarUrl} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{staffMember.name}</span>
      </div>
    );
  };

  const navigateToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-4">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" data-testid="admin-calendar-title">Calendar</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage appointments and staff schedules</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={handleNewBooking} size="sm" data-testid="button-new-booking">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Booking</span>
            <span className="sm:hidden">New</span>
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" onClick={navigateToPrevious} size="icon" data-testid="calendar-prev">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={navigateToToday} size="sm" data-testid="calendar-today">
              Today
            </Button>
            <Button variant="outline" onClick={navigateToNext} size="icon" data-testid="calendar-next">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-1">
            <Button
              variant={view === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('day')}
              data-testid="calendar-view-day"
            >
              <span className="hidden sm:inline">Day</span>
              <span className="sm:hidden">D</span>
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
              data-testid="calendar-view-week"
            >
              <span className="hidden sm:inline">Week</span>
              <span className="sm:hidden">W</span>
            </Button>
            <Button
              variant={view === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('month')}
              data-testid="calendar-view-month"
            >
              <span className="hidden sm:inline">Month</span>
              <span className="sm:hidden">M</span>
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-2 sm:p-4">
        <div className="h-[500px] sm:h-[600px] lg:h-[calc(100vh-250px)]">
          <DragAndDropCalendar
            localizer={localizer}
            events={events}
            resources={resources}
            resourceIdAccessor={(resource: any) => resource.id}
            resourceTitleAccessor={(resource: any) => resource.title}
            startAccessor={(event: any) => event.start}
            endAccessor={(event: any) => event.end}
            view={view}
            onView={setView}
            date={currentDate}
            onNavigate={setCurrentDate}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onEventDrop={onEventDrop}
            onEventResize={onEventResize}
            eventPropGetter={(event: any) => eventStyleGetter(event as CalendarEvent)}
            selectable
            resizable
            draggableAccessor={() => true}
            step={15}
            timeslots={4}
            min={new Date(2024, 0, 1, 8, 0, 0)}
            max={new Date(2024, 0, 1, 22, 0, 0)}
            components={{
              resourceHeader: ResourceHeader,
            }}
            toolbar={false}
            formats={{
              timeGutterFormat: 'h:mm a',
              eventTimeRangeFormat: ({ start, end }: any, culture: any, localizer: any) =>
                `${localizer?.format(start, 'h:mm a', culture)} - ${localizer?.format(end, 'h:mm a', culture)}`,
            }}
          />
        </div>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={(open) => {
        setIsBookingDialogOpen(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" data-testid="dialog-booking">
          <DialogHeader>
            <DialogTitle data-testid="dialog-booking-title">
              {selectedEvent ? 'Edit Booking' : 'New Booking'}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent ? 'Update the booking details below.' : 'Create a new booking by filling in the details below.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select value={formCustomerId} onValueChange={setFormCustomerId}>
                <SelectTrigger id="customer" data-testid="select-customer">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={String(customer.id)}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Service *</Label>
              <Select value={formServiceId} onValueChange={setFormServiceId}>
                <SelectTrigger id="service" data-testid="select-service">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={String(service.id)}>
                      {service.name} - {service.duration}min - AED {service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff">Staff (Optional)</Label>
              <Select value={formStaffId} onValueChange={setFormStaffId}>
                <SelectTrigger id="staff" data-testid="select-staff">
                  <SelectValue placeholder="Any available staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any available staff</SelectItem>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={String(member.id)}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  data-testid="input-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  data-testid="input-time"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger id="status" data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedEvent && (
              <Button
                variant="destructive"
                onClick={handleDeleteBooking}
                disabled={deleteBookingMutation.isPending}
                data-testid="button-delete-booking"
              >
                Delete
              </Button>
            )}
            <Button
              onClick={handleSubmitBooking}
              disabled={createBookingMutation.isPending || updateBookingMutation.isPending}
              data-testid="button-save-booking"
            >
              {selectedEvent ? 'Update' : 'Create'} Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format as formatDate, parse as parseDate, startOfWeek as getStartOfWeek, getDay as getDayOfWeek } from 'date-fns';
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

  // Update booking mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Booking> }) => {
      return apiRequest('PUT', `/api/admin/bookings/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
      toast({
        title: "Booking updated",
        description: "The booking has been rescheduled successfully.",
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="admin-calendar-title">Calendar</h1>
          <p className="text-muted-foreground">Manage appointments and staff schedules</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={navigateToPrevious} size="icon" data-testid="calendar-prev">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={navigateToToday} data-testid="calendar-today">
            Today
          </Button>
          <Button variant="outline" onClick={navigateToNext} size="icon" data-testid="calendar-next">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="flex gap-1 ml-4">
            <Button
              variant={view === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('day')}
              data-testid="calendar-view-day"
            >
              Day
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
              data-testid="calendar-view-week"
            >
              Week
            </Button>
            <Button
              variant={view === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('month')}
              data-testid="calendar-view-month"
            >
              Month
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-4">
        <div style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}>
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
            onEventDrop={onEventDrop}
            onEventResize={onEventResize}
            eventPropGetter={(event: any) => eventStyleGetter(event as CalendarEvent)}
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
              timeGutterFormat: 'h:mm A',
              eventTimeRangeFormat: ({ start, end }: any, culture: any, localizer: any) =>
                `${localizer?.format(start, 'h:mm A', culture)} - ${localizer?.format(end, 'h:mm A', culture)}`,
            }}
          />
        </div>
      </Card>
    </div>
  );
}

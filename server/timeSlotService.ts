import { storage } from "./storage";

interface TimeSlot {
  time: string; // HH:MM format
  available: boolean;
  staffId?: number;
}

interface BusinessHours {
  [key: string]: { open: string; close: string } | null;
}

/**
 * Generate available time slots for a spa on a given date
 */
export async function generateAvailableTimeSlots(
  spaId: number,
  date: string, // YYYY-MM-DD format
  serviceDuration: number, // in minutes
  staffId?: number
): Promise<TimeSlot[]> {
  // Get spa details with business hours
  const spa = await storage.getSpaById(spaId);
  if (!spa || !spa.businessHours) {
    return [];
  }

  // Parse the date and get day of week (0=Sunday, 6=Saturday)
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];

  // Get business hours for this day
  const businessHours = spa.businessHours as BusinessHours;
  const dayHours = businessHours[dayName];
  
  if (!dayHours || !dayHours.open || !dayHours.close) {
    // Spa is closed on this day
    return [];
  }

  // Get staff schedule if staffId is provided
  let staffSchedule = null;
  if (staffId) {
    const schedules = await storage.getStaffSchedules(staffId);
    staffSchedule = schedules.find((s: any) => s.dayOfWeek === dayOfWeek && s.active);
    
    if (!staffSchedule) {
      // Staff doesn't work on this day
      return [];
    }
  }

  // Determine working hours (intersection of business hours and staff schedule)
  let workStartTime = dayHours.open;
  let workEndTime = dayHours.close;

  if (staffSchedule) {
    // Use staff schedule if it's more restrictive
    workStartTime = staffSchedule.startTime > workStartTime ? staffSchedule.startTime : workStartTime;
    workEndTime = staffSchedule.endTime < workEndTime ? staffSchedule.endTime : workEndTime;
  }

  // Get all bookings for this date and staff (or all staff if not specified)
  const allBookings = await storage.getAllBookings();
  const dateStr = date; // YYYY-MM-DD
  
  const relevantBookings = allBookings.filter((booking: any) => {
    // Check if booking is on the same date
    const bookingDateStr = new Date(booking.bookingDate).toISOString().split('T')[0];
    if (bookingDateStr !== dateStr) return false;
    
    // Check if booking is for the same staff (or if we're checking all staff)
    if (staffId && booking.staffId !== staffId) return false;
    
    // Only consider confirmed bookings
    return booking.status === 'confirmed';
  });

  // Get booking durations by fetching booking items
  const bookingDurations = await Promise.all(
    relevantBookings.map(async (booking: any) => {
      const items = await storage.getBookingItemsByBookingId(booking.id);
      const totalDuration = items.reduce((sum: number, item: any) => sum + (item.duration || 0), 0);
      return {
        booking,
        duration: totalDuration || 60, // Default to 60 if no items found
      };
    })
  );

  // Generate all possible time slots
  const slots: TimeSlot[] = [];
  const [startHour, startMin] = workStartTime.split(':').map(Number);
  const [endHour, endMin] = workEndTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  // Generate slots in 30-minute intervals (common spa booking interval)
  const slotInterval = 30; // minutes
  
  for (let minutes = startMinutes; minutes < endMinutes; minutes += slotInterval) {
    const slotHour = Math.floor(minutes / 60);
    const slotMin = minutes % 60;
    const slotTime = `${slotHour.toString().padStart(2, '0')}:${slotMin.toString().padStart(2, '0')}`;
    
    // Check if this slot has enough time for the service before closing
    const slotEndMinutes = minutes + serviceDuration;
    if (slotEndMinutes > endMinutes) {
      break; // Not enough time before closing
    }
    
    // Check if this slot conflicts with any existing booking
    const hasConflict = bookingDurations.some(({ booking, duration: bookingDuration }) => {
      const bookingTime = new Date(booking.bookingDate);
      const bookingMinutes = bookingTime.getHours() * 60 + bookingTime.getMinutes();
      const bookingEndMinutes = bookingMinutes + bookingDuration;
      
      // Check if slots overlap
      const slotStart = minutes;
      const slotEnd = minutes + serviceDuration;
      const bookingStart = bookingMinutes;
      const bookingEnd = bookingEndMinutes;
      
      // Two time ranges overlap if: start1 < end2 AND start2 < end1
      return slotStart < bookingEnd && bookingStart < slotEnd;
    });
    
    slots.push({
      time: slotTime,
      available: !hasConflict,
      staffId: staffId,
    });
  }
  
  return slots;
}

/**
 * Check if a specific time slot is available
 */
export async function isTimeSlotAvailable(
  spaId: number,
  date: string,
  time: string, // HH:MM format
  serviceDuration: number,
  staffId?: number
): Promise<boolean> {
  const slots = await generateAvailableTimeSlots(spaId, date, serviceDuration, staffId);
  const slot = slots.find(s => s.time === time);
  return slot ? slot.available : false;
}

/**
 * Validate booking against business hours and staff availability
 */
export async function validateBooking(
  spaId: number,
  bookingDate: Date,
  serviceDuration: number,
  staffId?: number
): Promise<{ valid: boolean; message?: string }> {
  const date = bookingDate.toISOString().split('T')[0];
  const time = `${bookingDate.getHours().toString().padStart(2, '0')}:${bookingDate.getMinutes().toString().padStart(2, '0')}`;
  
  // Check if spa exists
  const spa = await storage.getSpaById(spaId);
  if (!spa) {
    return { valid: false, message: "Spa not found" };
  }
  
  // Check business hours
  const dayOfWeek = bookingDate.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];
  
  const businessHours = spa.businessHours as BusinessHours;
  const dayHours = businessHours?.[dayName];
  
  if (!dayHours || !dayHours.open || !dayHours.close) {
    return { valid: false, message: `Spa is closed on ${dayName}s` };
  }
  
  // Check if time falls within business hours
  if (time < dayHours.open || time >= dayHours.close) {
    return { 
      valid: false, 
      message: `Booking time must be between ${dayHours.open} and ${dayHours.close}` 
    };
  }
  
  // Check staff schedule if staff is specified
  if (staffId) {
    const schedules = await storage.getStaffSchedules(staffId);
    const staffSchedule = schedules.find((s: any) => s.dayOfWeek === dayOfWeek && s.active);
    
    if (!staffSchedule) {
      return { valid: false, message: "Selected staff member is not available on this day" };
    }
    
    if (time < staffSchedule.startTime || time >= staffSchedule.endTime) {
      return { 
        valid: false, 
        message: `Staff is only available from ${staffSchedule.startTime} to ${staffSchedule.endTime}` 
      };
    }
  }
  
  // Check for double booking
  const available = await isTimeSlotAvailable(spaId, date, time, serviceDuration, staffId);
  if (!available) {
    return { 
      valid: false, 
      message: "This time slot is already booked. Please choose another time." 
    };
  }
  
  return { valid: true };
}

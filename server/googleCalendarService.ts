import { decryptJSON } from "./encryptionService";

interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scope?: string;
}

// Google Calendar API types
export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  location?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
}

// Google Calendar API service
export class GoogleCalendarService {
  private baseUrl = 'https://www.googleapis.com/calendar/v3';

  constructor(
    private accessToken: string
  ) {}

  // List user's calendars
  async listCalendars(): Promise<GoogleCalendar[]> {
    const response = await fetch(`${this.baseUrl}/users/me/calendarList`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to list calendars: ${error}`);
    }

    const data = await response.json();
    return data.items || [];
  }

  // Get primary calendar
  async getPrimaryCalendar(): Promise<GoogleCalendar> {
    const calendars = await this.listCalendars();
    const primary = calendars.find(cal => cal.primary);
    
    if (!primary) {
      throw new Error('No primary calendar found');
    }

    return primary;
  }

  // Create calendar event
  async createEvent(
    calendarId: string,
    event: GoogleCalendarEvent
  ): Promise<GoogleCalendarEvent> {
    const response = await fetch(`${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create event: ${error}`);
    }

    return await response.json();
  }

  // Update calendar event
  async updateEvent(
    calendarId: string,
    eventId: string,
    event: Partial<GoogleCalendarEvent>
  ): Promise<GoogleCalendarEvent> {
    const response = await fetch(
      `${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update event: ${error}`);
    }

    return await response.json();
  }

  // Delete calendar event
  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      const error = await response.text();
      throw new Error(`Failed to delete event: ${error}`);
    }
  }

  // List events in a time range
  async listEvents(
    calendarId: string,
    timeMin: string,
    timeMax: string
  ): Promise<GoogleCalendarEvent[]> {
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    const response = await fetch(
      `${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to list events: ${error}`);
    }

    const data = await response.json();
    return data.items || [];
  }

  // Check for conflicts with existing events
  async checkConflicts(
    calendarId: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const events = await this.listEvents(calendarId, startTime, endTime);
    return events.length > 0;
  }

  // Create event from booking
  static createEventFromBooking(booking: {
    id: number;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    appointmentDate: string;
    appointmentTime: string;
    duration: number;
    services: Array<{ name: string }>;
    spaName?: string;
    spaAddress?: string;
  }): GoogleCalendarEvent {
    const startDateTime = new Date(`${booking.appointmentDate}T${booking.appointmentTime}`);
    const endDateTime = new Date(startDateTime.getTime() + booking.duration * 60 * 1000);

    const serviceNames = booking.services.map(s => s.name).join(', ');
    const attendees = booking.customerEmail ? [{ email: booking.customerEmail, displayName: booking.customerName }] : [];

    return {
      summary: `${booking.customerName} - ${serviceNames}`,
      description: `
Booking ID: ${booking.id}
Customer: ${booking.customerName}
Services: ${serviceNames}
${booking.customerPhone ? `Phone: ${booking.customerPhone}` : ''}

Created by ${booking.spaName || 'Spa Booking System'}
      `.trim(),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Dubai', // TODO: Make this configurable per spa
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Dubai',
      },
      attendees,
      location: booking.spaAddress,
      status: 'confirmed',
    };
  }
}

// Helper function to get calendar service with valid token
export async function getGoogleCalendarService(
  encryptedTokens: string
): Promise<GoogleCalendarService> {
  const tokens: OAuthTokens = decryptJSON(encryptedTokens);
  
  // For now, just use the access token directly
  // In production, implement proper token refresh logic
  return new GoogleCalendarService(tokens.accessToken);
}

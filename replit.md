# Serene Spa - Booking System

## Overview
A comprehensive spa booking system inspired by Fresha, allowing customers to book spa treatments online with an intuitive step-by-step process. The system includes service selection, calendar scheduling, staff assignment, and automated notifications.

## Current State (October 14, 2025)
The booking system is fully functional with service selection capabilities. Customers can:
- Select one or more spa services with duration and pricing
- View available dates on an interactive calendar
- Choose time slots that reflect the total duration of selected services
- Select a specific staff member or choose "Any Available"
- Enter their contact details (phone required, email optional)
- Receive booking confirmation with SMS and email notifications

## Recent Changes
**Service Selection Feature (October 14, 2025)**
- Added ServiceSelector component allowing customers to select multiple services
- Total duration is automatically calculated from selected services
- Time slots now display the total session duration based on selected services
- Booking summary and confirmation screens show all selected services with individual durations
- Fixed checkbox event handling to prevent double-toggling

## Project Architecture

### Frontend (React + TypeScript)
**Main Components:**
- `ServiceSelector`: Multi-select service picker with duration calculation
- `BookingCalendar`: Date picker with available/unavailable dates
- `TimeSlotPicker`: Time slot selection with dynamic duration display
- `StaffSelector`: Staff member selection with availability status
- `CustomerDetailsForm`: Contact information collection
- `BookingSummary`: Real-time booking summary sidebar
- `BookingConfirmation`: Final confirmation screen with notification status
- `BookingSteps`: Progress indicator for the booking flow
- `ThemeToggle`: Light/dark mode switcher

**Booking Flow (5 Steps):**
1. Services - Select one or more spa treatments
2. Date - Choose appointment date
3. Time - Select time slot (duration based on services)
4. Staff - Choose specialist or "Any Available"
5. Details - Enter customer information and confirm

### Backend (Express + PostgreSQL - Planned)
Currently using in-memory storage with mock data.

**Planned Features:**
- Database integration for persistent storage
- Admin panel for managing services and staff schedules
- Customer authentication using Replit Auth
- SMS notifications via Twilio API
- Email notifications
- Customer profile management

### Mock Data (To Be Replaced)
**Services:**
- Swedish Massage (60 min, $80)
- Deep Tissue Massage (90 min, $110)
- Aromatherapy Facial (45 min, $65)
- Hot Stone Therapy (75 min, $95)

**Staff:**
- Sarah Johnson (Massage Therapist)
- Michael Chen (Skincare Specialist)
- Emma Williams (Aromatherapist)
- David Martinez (Wellness Expert)

## Design Guidelines
The application follows a calming spa aesthetic with:
- Primary color: Deep ocean blue (210 45% 25%) - trust and calm
- Secondary: Soft mint background (160 35% 95%) - freshness
- Accent: Lighter blue (210 40% 55%) for interactions
- Typography: Inter for headings/body, DM Sans for calendar numbers
- Consistent spacing and elevation system for interactions

## User Preferences
- SMS notifications preferred but Twilio connector declined (will use API keys)
- Email notifications when customer provides email
- Customer registration via phone or email
- Booking history and profile storage required

## Next Steps
1. Implement backend database schema for services, staff, bookings, and customers
2. Add Replit Auth integration for customer accounts
3. Set up Twilio API for SMS notifications
4. Implement email notification system
5. Create admin dashboard for service/staff management
6. Add booking cancellation and rescheduling features
7. Implement recurring appointments and package bookings

## Technical Notes
- Using PostgreSQL database (Neon-backed via Replit)
- Frontend: React with Wouter for routing, TanStack Query for data fetching
- UI: Shadcn components with Tailwind CSS
- Date handling: date-fns library
- Forms: React Hook Form with Zod validation
- All interactive elements have data-testid attributes for e2e testing

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- Twilio credentials will be added when SMS is implemented

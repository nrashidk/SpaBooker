# Serene Spa - Booking System

## Overview
A comprehensive spa booking system inspired by Fresha, allowing customers to book spa treatments online with an intuitive step-by-step process. The system features a modern 4-step booking flow matching the design specifications with service categories, professional selection modes, and real-time availability.

## Current State (October 14, 2025)
The booking system is fully functional with a redesigned 4-step flow. Customers can:
- Browse and select services by category (Featured, Hair Services, Shave Services, Nails, etc.)
- Choose professional assignment mode (Any professional, Per-service, or Specific professional)
- View available dates on a horizontal week calendar
- Select time slots with pricing and discounts
- Enter contact details and receive booking confirmation

## Recent Changes
**Complete Redesign (October 14, 2025)**
- Updated booking flow from 5 steps to 4 steps: Services → Professional → Time → Confirm
- Redesigned Services page with horizontal scrollable category tabs
- Implemented featured services flag system
- Redesigned Professional selection with three modes:
  - "Any professional" for maximum availability
  - "Select professional per service" for assigning different professionals to different services
  - Specific professional selection with ratings
- Redesigned Time page with horizontal week calendar view
- Added list-style time slots with pricing and discount badges
- Fixed state management to properly reset between bookings

## Project Architecture

### Frontend (React + TypeScript)

**Main Pages:**
- `booking.tsx`: Main booking flow controller with 4-step sequence

**Core Components:**
- `ServiceCategorySelector`: Category tabs with multi-select service cards, featured services
- `ProfessionalSelector`: Three-mode professional selection (Any, Per-service, Specific)
- `TimeSelectionView`: Horizontal week calendar with time slot selection
- `BookingConfirmation`: Final confirmation with all booking details
- `BookingSteps`: Breadcrumb navigation (Services › Professional › Time › Confirm)
- `ThemeToggle`: Light/dark mode switcher

**Booking Flow (4 Steps):**
1. **Services** - Browse categories, select services with duration/pricing
2. **Professional** - Choose assignment mode and select professionals
3. **Time** - Pick date from week view, select time slot with pricing
4. **Confirm** - Review details and complete booking

### Features Implemented
**Service Selection:**
- Category tabs: Featured, Hair Services, Shave Services, Nails, Hair Treatment
- Horizontal scrollable category navigation
- Service cards with checkmark selection
- Duration and pricing display
- Package offers with special badges
- Featured services system

**Professional Selection:**
- Three selection modes with proper validation
- "Any professional" - Maximum availability
- "Per-service" - Assign different professionals to each service
- "Specific" - Choose one professional for all services
- Staff ratings (4.9, 4.8, etc.)
- Avatar display with fallback initials

**Time Selection:**
- Horizontal week calendar (7-day view)
- Navigation between weeks
- Professional dropdown (when applicable)
- Time slots as list items
- Discount badges (e.g., "18% off")
- Original and discounted pricing
- Clear availability indicators

**State Management:**
- Service selection tracking
- Professional mode and assignments
- Per-service professional mapping
- Date and time selection
- Complete state reset on new booking

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
- Express Haircut (25 min, AED 50) - Featured
- Beard Styling (25 min, AED 50) - Featured
- Headshave (25 min, AED 50)
- Little Master Haircut (25 min, AED 40)
- Executive Pedicure (40 min, AED 80) - Featured, 33% off
- Executive Manicure (30 min, AED 65) - 24% off

**Staff:**
- Saqib (Hairdresser/Massage Therapist, 4.9 rating)
- Sarah Johnson (Skincare Specialist, 4.8 rating)
- Michael Chen (Massage Therapist, 4.7 rating)

**Time Slots:**
- 5:30 PM - 8:00 PM (15-minute intervals)
- 18% discount on all slots
- AED 180 (was AED 220)

## Design Guidelines
The application follows the provided design specifications with:
- Primary color: Deep ocean blue (210 45% 25%) - trust and calm
- Secondary: Soft mint background (160 35% 95%) - freshness
- Accent: Lighter blue (210 40% 55%) for interactions
- Typography: Inter for headings/body, DM Sans for calendar numbers
- Consistent spacing and elevation system for interactions
- Horizontal scrollable category tabs
- List-style time slots with pricing
- Week-view calendar navigation

## User Preferences
- 4-step booking sequence (Services → Professional → Time → Confirm)
- Category-based service browsing
- Flexible professional assignment (any, per-service, specific)
- Time slots with pricing and discounts
- SMS/Email notifications on booking
- Customer registration via phone or email

## Next Steps
1. Implement backend database schema for services, staff, bookings, and customers
2. Replace mock data with live data from database
3. Add Replit Auth integration for customer accounts
4. Set up Twilio API for SMS notifications
5. Implement email notification system
6. Create admin dashboard for service/staff management
7. Add booking cancellation and rescheduling features
8. Implement customer booking history
9. Add staff availability management

## Technical Notes
- Using PostgreSQL database (Neon-backed via Replit)
- Frontend: React with Wouter for routing, TanStack Query for data fetching
- UI: Shadcn components with Tailwind CSS
- Date handling: date-fns library
- Forms: React Hook Form with Zod validation
- All interactive elements have data-testid attributes for e2e testing
- State properly resets between bookings (no data leakage)
- Per-service professional assignment fully implemented

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- Twilio credentials will be added when SMS is implemented

## Testing Status
✅ Complete 4-step booking flow tested
✅ Service selection with categories
✅ Per-service professional assignment
✅ Time selection with calendar
✅ Booking confirmation
✅ State reset on new booking
✅ Multiple booking sessions tested

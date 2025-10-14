# Serene Spa - Booking System

## Overview
A comprehensive spa booking system inspired by Fresha, allowing customers to book spa treatments online with an intuitive step-by-step process. The system features a modern 4-step booking flow matching the design specifications with service categories, professional selection modes, and real-time availability.

## Current State (October 14, 2025)
The booking system is fully functional with a redesigned 4-step flow. Customers can:
- Browse and select services by category (Featured, Hair Services, Shave Services, Nails, etc.)
- Choose professional assignment mode (Any professional, Per-service, or Specific professional)
- View available dates on a horizontal week calendar
- Select time slots with pricing and discounts
- Enter contact details (name + mobile OR email) and receive booking confirmation
- Receive WhatsApp/SMS and/or email notifications based on provided contact method

## Recent Changes

**Admin Calendar - Full Booking Management (October 14, 2025)**
- ✅ **Responsive Design**: Mobile/tablet optimized with adaptive layouts and text
- ✅ **New Booking Button**: Quick access to create bookings from calendar header
- ✅ **Click Empty Slots**: Click any calendar slot to create booking (pre-fills date/time/staff)
- ✅ **Click Events to Edit**: Click existing bookings to view/edit/delete
- ✅ **Comprehensive Dialog**: Customer, service, staff, date, time, status fields
- ✅ **Service Updates**: Fixed critical bug - editing bookings now properly updates services
- ✅ **Delete Bookings**: Confirmation prompt before deletion
- ✅ **Real-time Updates**: Cache invalidation ensures calendar reflects changes immediately
- ✅ **Auth Fix**: Fixed upsertUser to use email as conflict target (prevents duplicate key errors)
- ✅ **Form Validation**: SelectItem fixed to prevent empty value errors
- Mobile: Shows "D/W/M" and "New" (shortened text)
- Desktop: Shows full "Day/Week/Month" and "New Booking" text
- Calendar height: 500px mobile → 600px tablet → full height desktop

**Admin Panel Development - Complete (October 14, 2025)**
- ✅ Dashboard with real-time charts (Recharts) - revenue, appointments, top services/team
- ✅ Interactive Calendar with drag-drop booking management (react-big-calendar)
- ✅ Sales Analytics with daily transaction and cash movement tracking
- ✅ Clients Management with search and filtering
- ✅ Services page with real API integration
- ✅ Staff page with real API integration
- ✅ Marketplace page with ROI stats and integration cards
- ✅ Marketing page with campaign management
- ✅ Add-ons page with premium features
- ✅ Settings page with business info, hours, notifications
- ✅ Reports page with analytics and export options
- All pages use real database data via React Query
- Fixed revenue calculations to use actual booking totals (isSameDay for accurate date filtering)
- Resolved React hooks bundling issue with react-big-calendar
- Complete admin navigation with 15+ pages
**Authentication & Admin Protection (October 14, 2025)**
- Implemented Replit Auth integration for user authentication
- Added role-based access control (customer, staff, admin roles)
- Protected all /admin routes with admin-only middleware
- Created ProtectedRoute component for frontend route protection
- Users table updated for Replit Auth compatibility (email, firstName, lastName, profileImageUrl)
- Sessions table created for secure session storage
- Admin access requires both authentication + admin role
- Unauthorized/forbidden users redirected with toast notifications

**Customer Details & Notifications (October 14, 2025)**
- Added customer details form on step 4 before confirmation
- Implemented validation: name + at least ONE contact method (mobile OR email OR both)
- Created booking summary component showing all booking details
- Updated confirmation to show notification badges based on provided contact:
  - "WhatsApp/SMS Sent" badge when mobile is provided
  - "Email Sent" badge when email is provided
  - Both badges when both are provided
- Added spa/barber name configuration (displayed in header and confirmation)
- Updated breadcrumb from "Confirm" to "Details" for step 4
- State properly resets customer details on new booking

**Complete Redesign (October 14, 2025)**
- Updated booking flow from 5 steps to 4 steps: Services → Professional → Time → Details
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
- `CustomerDetailsForm`: Customer information form with validation (name + mobile/email)
- `BookingSummary`: Shows selected services, date, time, and professional
- `BookingConfirmation`: Final confirmation with notification badges and appointment details
- `BookingSteps`: Breadcrumb navigation (Services › Professional › Time › Details)
- `ThemeToggle`: Light/dark mode switcher

**Booking Flow (4 Steps):**
1. **Services** - Browse categories, select services with duration/pricing
2. **Professional** - Choose assignment mode and select professionals
3. **Time** - Pick date from week view, select time slot with pricing
4. **Details** - Enter customer information and review booking summary, then confirm

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

**Customer Details & Notifications:**
- Customer name (required, minimum 2 characters)
- Mobile number (optional) - for WhatsApp/SMS notifications
- Email address (optional) - for email notifications
- Validation: At least ONE contact method required (mobile OR email OR both)
- Booking summary sidebar showing all selected details
- Notification badges on confirmation based on provided contact methods
- Spa/barber name configurable and displayed throughout

**State Management:**
- Service selection tracking
- Professional mode and assignments
- Per-service professional mapping
- Date and time selection
- Customer details storage
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
- 4-step booking sequence (Services → Professional → Time → Details)
- Category-based service browsing
- Flexible professional assignment (any, per-service, specific)
- Time slots with pricing and discounts
- Customer details form with name + mobile OR email (or both)
- WhatsApp/SMS notifications when mobile is provided
- Email notifications when email is provided
- Spa/barber name displayed throughout interface

## Next Steps
1. **Set up Twilio integration** for actual WhatsApp/SMS notifications (currently simulated)
2. Implement email notification system (currently simulated)
3. Implement backend database schema for services, staff, bookings, and customers
4. Create backend API routes to save bookings and send notifications
5. Replace mock data with live data from database
6. Add Replit Auth integration for customer accounts
7. Create admin panel for spa/barber name configuration
8. Create admin dashboard for service/staff management
9. Add booking cancellation and rescheduling features
10. Implement customer booking history
11. Add staff availability management

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
✅ Complete 4-step booking flow tested (Services → Professional → Time → Details)
✅ Service selection with categories
✅ Per-service professional assignment
✅ Time selection with calendar
✅ Customer details form with validation
✅ Booking confirmation with notification badges
✅ Notifications show correctly based on contact method:
  - Both mobile and email: Shows both badges
  - Mobile only: Shows WhatsApp/SMS badge only
  - Email only: Shows Email badge only
✅ Spa name displays in header and confirmation
✅ State reset on new booking (including customer details)
✅ Multiple booking sessions tested

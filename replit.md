# Serene Spa - Booking System

## Overview
Serene Spa is an online booking system, inspired by Fresha, designed to offer customers an intuitive 4-step booking process for spa treatments. The platform supports **multiple spas/venues** using the same system, allowing customers to search across all spas and book services. It aims to boost customer satisfaction and operational efficiency for spas through features like categorized services, flexible professional selection, and real-time availability. The platform also includes a robust admin panel for managing bookings, staff, services, and analyzing business performance. Future goals include integrating with growth and analytics tools to maximize spa revenue and customer engagement.

## User Preferences
- 4-step booking sequence (Services → Professional → Time → Details)
- Category-based service browsing
- Flexible professional assignment (any, per-service, specific)
- Time slots with pricing and discounts
- Customer details form with name + mobile OR email (or both)
- WhatsApp/SMS notifications when mobile is provided
- Email notifications when email is provided
- Spa/barber name displayed throughout interface

## Recent Changes (October 15, 2025)

### Home Page & Dual Login System (Latest)
- **New Home Page (/)**: Fresha-inspired landing page with centered booking search
  - Purple/pink gradient background matching brand aesthetic
  - Prominent headline: "Book local beauty and wellness services"
  - Integrated search bar with dropdown controls (treatments, location, date, time)
  - Stats display: "339,972 appointments booked today"
  - Header with "Customer Login" and "Admin Login" buttons
- **Customer Login Page (`/login/customer`)**: Social authentication for customers
  - Google OAuth integration ("Continue with Google" button)
  - Email input option for traditional login
  - Clean, modern design matching Fresha UX patterns
  - Automatic account creation on first login
- **Admin Login Page (`/login/admin`)**: Professional credentials system
  - Tabbed interface: Login and Register
  - Login form: Email and password fields
  - Registration form: Name, spa/business name, email, password, confirmation
  - Separate authentication flow from customer accounts
- **Routing Updates**: Updated App.tsx with new page routes

### Calendar Validation System - COMPLETED ✅
- ✅ **Time Slot Generation**: Implemented service that generates available slots based on:
  - Business hours per day of week (supports string format "9:00-21:00" and object format)
  - Actual booking durations calculated from booking items (not hardcoded)
  - 30-minute interval slots
  - Proper date parsing (local time, not UTC) using `date + 'T00:00:00'`
- ✅ **Double-Booking Prevention**: Full validation before booking creation:
  - Checks for overlapping bookings using actual service durations
  - Returns 409 error with clear message when slot unavailable
  - Validated working: 75-min booking at 10:00 correctly blocks 09:30-11:00
- ✅ **Business Hours Validation**: Ensures bookings fall within operating hours
  - Time comparison using minutes conversion (not string comparison)
  - Day-specific hours support
- ✅ **Staff Availability**: Per-staff booking conflict checking
  - Different staff can book same time slot (no conflict)
  - Same staff cannot double-book
- **API Endpoints**:
  - `GET /api/spas/:id/available-slots?date=YYYY-MM-DD&duration=X&staffId=Y`
  - Returns array of `{ time, available, staffId }` objects
- **Integration**: BookingFlow.tsx now fetches real available slots from API

### Booking Search UI Redesign
- **Modern Dropdown Design**: Replaced text inputs with interactive popover dropdowns for all search fields
  - **Treatments Dropdown**: 14 treatment categories with icons (Hair & styling, Nails, Massage, Barbering, etc.)
  - **Location Dropdown**: "Current location" option with manual location input
  - **Date Dropdown**: "Any date", "Today", "Tomorrow" quick buttons with calendar picker
  - **Time Dropdown**: "Any time", "Morning", "Afternoon", "Evening" buttons with From/To time selectors
- **Visual Updates**:
  - Purple/pink gradient background (from-purple-100/50 via-pink-100/50 to-purple-200/50)
  - Rounded search bar with black search button
  - Stats display showing "339,972 appointments booked today"
- **Branding**: Changed website title from "Serene Spa" to "SpaBooker"

### Customer Account & Booking Management
- **Customer Account Page (`/my-account`)**: Customers can view and manage their bookings
  - Lists upcoming and past bookings with spa, service, date/time details
  - Modify booking dialog allows changing date, time, and notes
  - Cancel booking with optional reason and cancellation policy enforcement
- **Database Schema Updates**:
  - Added `cancellationPolicy` (jsonb) to spas table for flexible policy management
  - Added `userId` to bookings table to link bookings to Replit Auth users
  - `spaId` foreign key relationship between bookings and spas
- **API Endpoints**:
  - `GET /api/my-bookings` - Get authenticated user's bookings
  - `PUT /api/bookings/:id/cancel` - Cancel booking with policy enforcement
  - `PUT /api/bookings/:id` - Modify booking details
  - `POST /api/bookings` - Create booking with proper user/customer linkage
- **Critical Fixes**:
  - Fixed authentication: Use `req.user.claims.sub` (not `req.user.id`) for Replit Auth user ID
  - Fixed URL parameters: Use `window.location.search` instead of wouter's location (pathname only)
  - Fixed time parsing: Convert 12-hour format (5:30PM) to 24-hour format (17:30) for database
  - Type compatibility: Handle Postgres decimal fields as strings, use `parseFloat()` before `.toFixed()`
- **Security & Validation**:
  - Removed PII logging from booking endpoints (no customer email/phone in logs)
  - Added spaId validation with user-friendly error messages
  - Added comprehensive booking data validation before submission

## System Architecture

### Frontend
The frontend is built with React and TypeScript, utilizing Shadcn components with Tailwind CSS for a responsive UI.
- **Home Page (/):** Main landing page with centered booking search feature
  - Hero section with "Book local beauty and wellness services" headline
  - Integrated search bar with dropdown controls (treatments, location, date, time)
  - Customer Login and Admin Login buttons in header
  - Stats display showing appointments booked today
  - Routes to /booking with search parameters
- **Customer Login (/login/customer):** Social authentication page
  - Google OAuth integration
  - Email input option for traditional login
  - Automatic routing to Replit Auth
- **Admin Login (/login/admin):** Professional authentication portal
  - Login tab with email/password credentials
  - Registration tab for new spa businesses (name, spa name, email, password)
  - Routes to admin panel on successful authentication
- **Booking Search Landing Page (/booking):** Fresha-inspired search interface featuring:
  - Hero section with gradient background and tagline
  - Unified search bar with 4 fields: treatments/venues, location, date, and time
  - Popular services quick-access buttons with lucide-react icons
  - **Search Results Display:** Shows spa cards with name, location, rating, services, and staff
  - Each spa card has a "Book Now" button that navigates to booking flow with selected spa
- **Booking Flow (/booking/flow):** A 4-step process:
  - **Services:** Category tabs, multi-select service cards with duration and pricing.
  - **Professional:** Three selection modes: "Any professional", "Select professional per service", or "Specific professional", including staff ratings.
  - **Time:** Horizontal week calendar with navigation, list-style time slots showing pricing and discounts.
  - **Details:** Customer information form with validation, booking summary, and confirmation with notification badges.
- **Admin Panel:** Comprehensive interface for spa management.
  - **Landing Page:** Root URL for professional admin authentication and customer booking CTAs.
  - **Dashboard:** Real-time charts for revenue, appointments, top services/team (using Recharts).
  - **Calendar:** Interactive drag-and-drop booking management (react-big-calendar) with add/edit functionalities and various booking types.
  - **Sales Sidebar (POS):** Quick sales, product lookup, cart management, and checkout.
  - **Finance & Accounting:** Tab-based interface for financial management:
    - **Overview:** Financial stats (Total Revenue, Pending Payments, Expenses, Net Profit) and recent invoices
    - **Expenses:** Full CRUD expense tracking with 6 categories (Rent, Utilities, Raw Materials, Salaries, Marketing, Other) and real-time calculations
    - **Vendors:** Complete vendor management system with categories (Supplies & Equipment, Professional Services, Utilities, etc.) and payment terms (Net 7/15/30/45/60/90, Due on Receipt, COD)
    - **Bills:** Placeholder for purchase invoices/bills tracking (coming soon)
  - **Management Pages:** Sections for Clients, Services, Staff, Marketplace, Marketing, Add-ons, Settings, and Reports, using React Query for data.
- **Design Guidelines:** Uses a specific color palette (Deep ocean blue, Soft mint, Lighter blue accent) and typography (Inter, DM Sans).

### Backend
Currently uses PostgreSQL database with comprehensive data model.
- **Database:** PostgreSQL (Neon-backed via Replit) for persistent storage with tables for:
  - **Spas:** Multiple venue support with location, business hours, ratings, and featured status
  - **Services:** Linked to specific spas with pricing, duration, and category
  - **Staff:** Linked to specific spas with specialty, ratings, and availability
  - **Bookings, Customers, Invoices, Expenses, Vendors, Bills** for complete business management
- **API:** Express-based REST API with endpoints:
  - `/api/search/spas` - Search across all spas by treatment, location, date, time
  - `/api/spas/:id` - Get spa details
  - `/api/spas/:id/services` - Get services for a specific spa
  - `/api/spas/:id/staff` - Get staff for a specific spa
  - Admin routes for managing all resources
- **Authentication:** Replit Auth for user authentication with role-based access control (customer, staff, admin) and protected routes.

## External Dependencies
- **Replit Auth:** User authentication and role-based access control.
- **Recharts:** Data visualization in the admin dashboard and reports.
- **react-big-calendar:** Interactive calendar in the admin panel.
- **Wouter:** Frontend routing.
- **TanStack Query:** Data fetching and state management.
- **Shadcn components & Tailwind CSS:** UI framework and styling.
- **date-fns:** Date handling.
- **React Hook Form & Zod:** Form validation.
- **PostgreSQL (Neon-backed):** Planned database integration.
- **Twilio API:** Planned integration for SMS notifications.
- **Google Reserve:** Planned integration for bookings from Google Search & Maps.
- **Facebook & Instagram Bookings:** Planned integration for social media booking.
- **Meta Pixel Ads:** Planned integration for conversion tracking and ad optimization.
- **Google Analytics:** Planned integration for website traffic and user behavior insights.
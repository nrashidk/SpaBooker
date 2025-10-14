# Serene Spa - Booking System

## Overview
Serene Spa is a comprehensive online booking system inspired by Fresha, designed to allow customers to book spa treatments through an intuitive, modern 4-step process. The system aims to streamline the booking experience with features like service categories, flexible professional selection, and real-time availability, ultimately enhancing customer satisfaction and operational efficiency for spas. The platform also includes a robust admin panel for managing bookings, staff, services, and analyzing business performance. Future ambitions include integrating with leading growth and analytics tools to maximize spa revenue and customer engagement.

## User Preferences
- 4-step booking sequence (Services → Professional → Time → Details)
- Category-based service browsing
- Flexible professional assignment (any, per-service, specific)
- Time slots with pricing and discounts
- Customer details form with name + mobile OR email (or both)
- WhatsApp/SMS notifications when mobile is provided
- Email notifications when email is provided
- Spa/barber name displayed throughout interface

## System Architecture

### Frontend
The frontend is built with React and TypeScript, leveraging Shadcn components with Tailwind CSS for a responsive and modern UI.
- **Booking Flow:** A redesigned 4-step sequence (Services → Professional → Time → Details) for intuitive customer experience.
  - **Services:** Category tabs with multi-select service cards, featured services, duration, and pricing.
  - **Professional:** Three selection modes: "Any professional", "Select professional per service", or "Specific professional", including staff ratings.
  - **Time:** Horizontal week calendar with navigation, list-style time slots showing pricing and discounts, and clear availability indicators.
  - **Details:** Customer information form with validation (name + mobile OR email), booking summary, and confirmation with notification badges.
- **Admin Panel:** A comprehensive administrative interface featuring:
  - **Landing Page:** Root URL serves as the professional admin authentication page with login and customer booking CTAs.
  - **Dashboard:** Real-time charts for revenue, appointments, top services/team (using Recharts).
  - **Calendar:** Interactive calendar with drag-and-drop booking management (react-big-calendar), allowing click-to-add and click-to-edit functionalities. Includes "Add to Calendar" dropdown for various booking types (Appointment, Group, Blocked time, Sale, Quick payment) and zoom controls.
  - **Sales Sidebar (POS):** Right-side sheet for quick sales, product lookup, category tabs, cart management, and checkout.
  - **Management Pages:** Dedicated sections for Clients, Services, Staff, Marketplace, Marketing, Add-ons, Settings, and Reports, all utilizing real database data via React Query.
- **State Management:** Robust system for tracking service selections, professional assignments, date/time, and customer details, with complete state reset for new bookings.
- **Design Guidelines:** Adherence to a specific color palette (Deep ocean blue, Soft mint, Lighter blue accent) and typography (Inter, DM Sans) for a consistent brand identity.

### Backend
The system is currently using in-memory storage with mock data, with plans to transition to a robust backend.
- **Database:** PostgreSQL (Neon-backed via Replit) for persistent storage of services, staff, bookings, and customers.
- **API:** Express-based API for handling booking submissions, staff/service management, and authentication.
- **Authentication:** Replit Auth integration for user authentication with role-based access control (customer, staff, admin roles) and protected routes for the admin panel.

## External Dependencies
- **Replit Auth:** For user authentication and role-based access control.
- **Recharts:** For data visualization in the admin dashboard and Reports page.
- **react-big-calendar:** For interactive calendar functionality in the admin panel.
- **Wouter:** For frontend routing.
- **TanStack Query:** For data fetching and state management.
- **Shadcn components & Tailwind CSS:** UI framework and styling.
- **date-fns:** For date handling.
- **React Hook Form & Zod:** For form validation.
- **PostgreSQL (Neon-backed):** Planned database integration.
- **Twilio API:** Planned integration for SMS notifications.
- **Google Reserve:** Planned integration for bookings from Google Search & Maps.
- **Facebook & Instagram Bookings:** Planned integration for social media booking.
- **Meta Pixel Ads:** Planned integration for conversion tracking and ad optimization.
- **Google Analytics:** Planned integration for website traffic and user behavior insights.

## Recent Updates (October 14, 2025)

### Reports Page - Comprehensive Performance Dashboard
The Reports page has been completely redesigned with a Fresha-inspired layout featuring comprehensive business analytics:

**Page Structure:**
- Sidebar navigation with 7 categories: All reports (52), Favourites (1), Dashboards (2), Standard (44), Premium (8), Custom (0), Targets
- Search functionality for quick report discovery
- Folders system for custom organization
- Data connector integration

**Performance Dashboard:**
- **Total Sales Analytics**: Real-time sales data with breakdown by type (Services 88%, Products 8%, Memberships 4%)
- **Sales Over Time Chart**: Line graph showing daily sales trends from actual bookings data
- **Key Business Metrics**: 
  - Average sale value (calculated from bookings)
  - Online sales percentage (57% of total)
  - Total appointments count
  - Occupancy rate (46.2%)
  - Returning client rate (calculated from customer booking history)
- **Sales by Channel**: Distribution across Offline (43%), Online (41%), Social (9%), Direct (7%), Marketing (0%)
- **Appointments Analytics**: Breakdown by status (Completed, Cancelled, Not completed, No shows) using real booking data
- **Occupancy Metrics**: Working hours analysis (total, unbooked, booked hours)
- **Returning Client Analysis**: Customer segmentation (returning, new, walk-ins) with percentage calculations
- **Top Team Members**: Performance table showing staff sales, occupancy, returning client rates from actual booking assignments

**Data Integration:**
- Uses real booking data for sales calculations and trends
- Calculates staff performance from actual booking assignments
- Computes customer retention metrics from booking history
- Generates time-series data from date-grouped bookings
- Clear documentation for metrics requiring additional schema fields (booking source, historical comparisons, ratings system)

**Future Enhancements:**
- Booking source tracking for accurate channel breakdown
- Historical data snapshots for comparison periods
- Staff time tracking for precise occupancy metrics
- Ratings system for comprehensive staff performance
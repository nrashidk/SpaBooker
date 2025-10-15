# Serene Spa - Booking System

## Overview
Serene Spa is an online booking system, inspired by Fresha, designed to offer customers an intuitive 4-step booking process for spa treatments. It aims to boost customer satisfaction and operational efficiency for spas through features like categorized services, flexible professional selection, and real-time availability. The platform also includes a robust admin panel for managing bookings, staff, services, and analyzing business performance. Future goals include integrating with growth and analytics tools to maximize spa revenue and customer engagement.

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
The frontend is built with React and TypeScript, utilizing Shadcn components with Tailwind CSS for a responsive UI.
- **Booking Search Landing Page (/booking):** Fresha-inspired search interface featuring:
  - Hero section with gradient background and tagline
  - Unified search bar with 4 fields: treatments/venues, location, date, and time
  - Popular services quick-access buttons with lucide-react icons
  - Search results navigation to booking flow with query parameters
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
Currently uses in-memory storage with mock data, with plans for a robust backend.
- **Database:** PostgreSQL (Neon-backed via Replit) for persistent storage.
- **API:** Express-based API for booking, management, and authentication.
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
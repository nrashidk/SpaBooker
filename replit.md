# Serene Spa - Booking System

## Overview
Serene Spa is an online booking system, inspired by Fresha, offering a 4-step booking process for spa treatments. It supports multiple spa venues, allowing customers to search across all locations and book services. The platform aims to enhance customer satisfaction and operational efficiency through features like categorized services, flexible professional selection, and real-time availability. It also includes a robust admin panel for managing bookings, staff, services, and analyzing business performance, with ambitions for future integration with growth and analytics tools to maximize spa revenue and customer engagement.

## Recent Changes (October 16, 2025)
-   **Revenue Tracking System (Latest):**
    -   Added loyalty_cards table to track loyalty card purchases and redemptions
    -   Added loyalty_card_usage table to track each time a loyalty card is used
    -   Added product_sales table to track retail product purchases separate from services
    -   Implemented complete CRUD API endpoints for all new revenue streams with proper validation
    -   Updated Sales page to show unified view of all revenue (services + products + loyalty cards)
    -   Updated Clients page with detailed purchase history view showing bookings, product sales, and loyalty cards
    -   All numeric ID parameters properly validated with 400 error responses for invalid input
-   **Code Quality Improvements:**
    -   Replaced non-null assertions in BookingFlow.tsx with proper null/undefined guards to prevent runtime errors
    -   Enhanced admin bookings API endpoint to return enriched data with customer, staff, and service details
    -   Updated admin Bookings page to fetch real API data instead of using hardcoded demo bookings
-   **Configuration & Branding:**
    -   Created `shared/constants.ts` for centralized app configuration
    -   Replaced all hardcoded "SpaBooker" branding with configurable APP_CONFIG constants
    -   All branding is now managed from a single source of truth
-   **UI/UX Enhancements:**
    -   Added favicon (inline SVG sparkles icon) to index.html
    -   Added meta theme-color for better browser integration
    -   Added noscript fallback message for users without JavaScript
-   **Repository Cleanup:**
    -   Removed temporary pasted text files from attached_assets directory

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
Built with React and TypeScript, using Shadcn components and Tailwind CSS for a responsive UI. Key pages include:
-   **Home Page (/):** Landing page with a Fresha-inspired design, featuring a prominent booking search bar, customer and admin login buttons, and a stats display.
-   **Customer Login (/login/customer):** Social authentication via Google OAuth and traditional email login.
-   **Admin Login (/login/admin):** Professional authentication portal with separate login and registration for spa businesses.
-   **Booking Search Landing Page (/booking):** Fresha-inspired interface with a unified search bar for treatments, location, date, and time, displaying spa cards with details and "Book Now" options.
-   **Booking Flow (/booking/flow):** A guided 4-step process for selecting services, professionals, time slots, and entering customer details.
-   **Admin Panel:** A comprehensive interface for spa management featuring:
    -   **Dashboard:** Real-time charts for business performance.
    -   **Calendar:** Interactive drag-and-drop booking management.
    -   **Sales Sidebar (POS):** For quick sales and product lookup.
    -   **Finance & Accounting:** For managing revenues, expenses, vendors, and bills.
    -   **Management Pages:** For clients, services, staff, and settings.
The UI adheres to specific design guidelines with a defined color palette and typography.

### Backend
Utilizes a PostgreSQL database for comprehensive data management and an Express-based REST API.
-   **Database:** PostgreSQL (Neon-backed) storing data for spas, services, staff, bookings, customers, invoices, expenses, vendors, product sales, loyalty cards, and loyalty card usage.
-   **API:** Provides endpoints for searching spas, fetching spa details, services, staff, and robust admin routes for resource management including complete revenue tracking (bookings, product sales, loyalty cards).
-   **Authentication:** Replit Auth handles user authentication with role-based access control (customer, staff, admin) and secures routes.
-   **Revenue Tracking:** Complete system for tracking all revenue streams including service bookings, retail product sales, and loyalty card purchases/redemptions with proper validation and balance management.
-   **Calendar Validation System:** Ensures accurate time slot generation based on business hours, service durations, and staff availability, preventing double-bookings.
-   **Pay-As-You-Go Notification System:** Allows spa owners to configure and pay for their own notification services (Email, SMS, WhatsApp) using their credentials. It includes credential encryption, audit logging, and configurable fallback logic.

## External Dependencies
-   **Replit Auth:** User authentication and role-based access control.
-   **PostgreSQL (Neon-backed):** Primary database.
-   **Recharts:** Data visualization.
-   **react-big-calendar:** Interactive calendar components.
-   **Wouter:** Frontend routing.
-   **TanStack Query:** Data fetching and state management.
-   **Shadcn components & Tailwind CSS:** UI framework and styling.
-   **date-fns:** Date handling utilities.
-   **React Hook Form & Zod:** Form validation.
-   **SendGrid/Resend:** Optional email notification providers (configured by spa owners).
-   **Twilio:** Optional SMS/WhatsApp notification provider (configured by spa owners).
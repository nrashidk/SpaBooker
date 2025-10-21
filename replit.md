# Serene Spa - Booking System

## Overview
Serene Spa is an online booking system, inspired by Fresha, offering a 4-step booking process for spa treatments. It supports multiple spa venues, allowing customers to search across all locations and book services. The platform aims to enhance customer satisfaction and operational efficiency through features like categorized services, flexible professional selection, and real-time availability. It includes a robust admin panel for managing bookings, staff, services, and analyzing business performance, with ambitions for future integration with growth and analytics tools to maximize spa revenue and customer engagement.

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
Built with React and TypeScript, using Shadcn components and Tailwind CSS for a responsive UI. Key pages include a Home Page, Customer and Admin Login, a Booking Search Landing Page, and a guided 4-step Booking Flow. The comprehensive Admin Panel features a Dashboard, Calendar, Sales Sidebar (POS), Finance & Accounting, and management pages for Clients, Services, Staff, and Settings. The UI adheres to specific design guidelines with a defined color palette and typography.

### Backend
Utilizes a PostgreSQL database for comprehensive data management and an Express-based REST API.
-   **Database:** PostgreSQL (Neon-backed) storing data for spas, services, staff, bookings, customers, invoices, expenses, vendors, product sales, loyalty cards, and loyalty card usage.
-   **API:** Provides endpoints for searching spas, fetching spa details, services, staff, and robust admin routes for resource management including complete revenue tracking.
-   **Authentication:** Replit Auth handles user authentication with role-based access control (customer, staff, admin, super_admin) and secures routes with proper authorization middleware.
-   **Staff Role-Based Permissions:** A five-tier permission system (Basic, View Own Calendar, View All Calendars, Manage Bookings, Admin Access) controls staff access.
-   **Revenue Tracking:** Complete system for tracking all revenue streams including service bookings, retail product sales, and loyalty card purchases/redemptions. UAE VAT-compliant calculations are implemented where 5% VAT is part of the price, not added on top.
-   **Discount/Offer Tracking:** Comprehensive discount system supporting flat rate and percentage discounts on bookings, loyalty cards, and product sales. All revenue and VAT calculations account for discounts, using net amounts (after discounts) for accurate financial reporting.
-   **UAE VAT Compliance System:** Full UAE Federal Tax Authority (FTA) compliance with automatic VAT calculations (5% inclusive), tax code support (SR/ZR/ES/OP), and FTA Audit File (FAF) export functionality. All revenue streams (bookings, product sales, loyalty cards) include netAmount, vatAmount, and taxCode fields for accurate tax reporting. Multi-tenant security ensures spa-specific data isolation in all exports.
-   **Calendar Validation System:** Ensures accurate time slot generation based on business hours, service durations, and staff availability.
-   **Multi-Provider Notification System:** Supports both Twilio and MSG91 as notification providers for Email, SMS, and WhatsApp channels. Spa owners configure their own provider credentials (BYOA model) with AES-256-GCM encryption, real-time credential validation, delivery status webhooks, and per-spa provider selection.
-   **Staff Notifications:** Staff members receive booking notifications (create/modify/cancel) through the same channels enabled for customers (SMS/email/WhatsApp). Independent settings control which channels and events trigger staff notifications, ensuring staff are always informed about their appointments.
-   **Audit Trail:** Comprehensive audit logs track all important changes with user context, IP, user agent, and specific filters for compliance.
-   **Security Hardening:** Includes secure ID parameter validation, consistent error handling with Zod, environment variable validation, and proper `.env` exclusion.
-   **Admin-Spa Linkage System:** Robust middleware (`injectAdminSpa`) validates admin users are properly linked to their spa before any operations. Prevents "Spa does not exist" errors by ensuring `adminSpaId` is set during setup wizard and validated on every admin API call. Multi-layer validation includes middleware checks, storage-layer foreign key validation, and database constraints. Clear error messages with `setupRequired` flag guide users through setup completion.
-   **Admin Registration & Approval Flow:** Complete admin onboarding system with pending approval workflow. Admins register with spa name and optional business license document (`licenseUrl` field). Super admin reviews and approves applications. The `enforceSetupWizard` middleware ensures approved admins complete the 6-step setup wizard before accessing any admin features. Only 4 steps are required (Basic Info, Location, Business Hours, Activation) while Services and Staff are optional and can be configured later. Policies and inventory are managed post-activation from the admin dashboard. Middleware blocks all `/api/admin/*` routes except `/api/admin/setup/*` for admins with incomplete setup, returning `setupRequired: true` for frontend redirect handling. Super admins bypass all wizard enforcement.
-   **Setup Wizard Design:** The wizard features a clean, minimal design with progress tracking and step indicators across 6 steps:
    1. **Basic Info** (required) - Spa name, description, contact details. Contact email is locked (read-only, pre-populated from registration).
    2. **Location** (required) - Address with dropdown of all 7 UAE emirates (Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah) plus optional latitude/longitude fields with helpful tips.
    3. **Business Hours** (required) - Time pickers matching the Settings page design for all 7 days.
    4. **Services** (optional) - Can be skipped and added later from admin dashboard. Clear messaging explains services are essential for bookings but can be configured anytime.
    5. **Staff** (optional) - Can be skipped and added later from admin dashboard. Clear messaging explains staff are essential for managing bookings but can be configured anytime.
    6. **Activation** (required) - Completion summary with dynamic checklist showing completed steps (including optional ones if configured).

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
-   **Twilio:** Optional SMS/WhatsApp/Email notification provider.
-   **MSG91:** Optional SMS/WhatsApp/Email notification provider.

## Free Third-Party Integrations
Building custom OAuth implementations for all free-tier services (user dismissed Replit connectors):
-   **Google Calendar** ✅ - 2-way appointment sync (FREE - 1M requests/day) - COMPLETE with timezone preservation and per-staff calendar support
-   **Google My Business** - Review collection & SEO (FREE) - PENDING
-   **Google Analytics** - Conversion tracking (FREE) - PENDING
-   **Google Meet** - Video consultations (FREE tier) - PENDING
-   **HubSpot CRM** - Contact management (FREE tier) - PENDING
-   **Mailchimp** - Email campaigns (FREE - 500 contacts) - PENDING
-   **Wave Accounting** - Bookkeeping (FREE) - PENDING
-   **Buffer Social** - Social media (FREE - 3 accounts) - PENDING

### Google Calendar Integration Details
-   **Timezone Handling:** All datetime operations preserve the spa's timezone (Asia/Dubai default) to prevent timezone conversion errors
-   **Staff Calendar Mapping:** Integration metadata stores per-staff calendar IDs (staffCalendars object) to enable multi-staff calendar support
-   **Conflict Detection:** Time slot generation checks both internal bookings and staff-specific Google Calendar events
-   **Bidirectional Sync:** Bookings automatically create/update/delete calendar events; calendar events prevent double-booking
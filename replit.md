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
-   **Calendar Validation System:** Ensures accurate time slot generation based on business hours, service durations, and staff availability.
-   **Multi-Provider Notification System:** Supports both Twilio and MSG91 as notification providers for Email, SMS, and WhatsApp channels. Spa owners configure their own provider credentials (BYOA model) with AES-256-GCM encryption, real-time credential validation, delivery status webhooks, and per-spa provider selection.
-   **Audit Trail:** Comprehensive audit logs track all important changes with user context, IP, user agent, and specific filters for compliance.
-   **Security Hardening:** Includes secure ID parameter validation, consistent error handling with Zod, environment variable validation, and proper `.env` exclusion.

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
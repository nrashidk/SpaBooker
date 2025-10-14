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
- **Recharts:** For data visualization in the admin dashboard.
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
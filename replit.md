# Spa Booking System

## Overview

A modern spa booking application that allows customers to book wellness services through an intuitive multi-step booking flow. The system guides users through selecting services, choosing dates and times, selecting staff members, and entering their contact details before confirming their appointment. Built with a focus on creating a calming, professional user experience that reflects spa and wellness brand values.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing
- TanStack Query for server state management and caching

**UI Component System**
- shadcn/ui component library (New York style variant) for consistent, accessible components
- Radix UI primitives for headless, accessible UI components
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for type-safe component variants

**Design System**
- Custom color palette with CSS variables for light/dark theme support
- Ocean blue primary colors (#210 45% 25%) for trust and calm
- Soft mint secondary backgrounds (#160 35% 95%) for freshness
- Typography using Inter font family for clean, professional appearance
- Custom elevation system using overlay opacity (--elevate-1, --elevate-2)

**State Management Pattern**
- Local component state with React hooks (useState) for UI interactions
- Form state managed via React Hook Form with Zod schema validation
- Multi-step booking flow state managed at page level
- Mock data currently used for services, staff, and time slots

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript for type safety across the stack
- Development and production build scripts with esbuild

**Database Layer**
- Neon serverless PostgreSQL as the database provider
- Drizzle ORM for type-safe database queries and schema management
- WebSocket support via ws library for Neon serverless connections
- Migration system using drizzle-kit

**Storage Pattern**
- In-memory storage implementation (MemStorage) for development
- Interface-based design (IStorage) allowing easy swap to database persistence
- Currently implements basic user CRUD operations
- Designed to be extended with booking, service, and staff management

**API Design**
- RESTful API pattern with /api prefix for all endpoints
- Session management ready with connect-pg-simple for PostgreSQL session store
- Middleware for request logging with duration tracking
- Error handling middleware for consistent error responses

### External Dependencies

**UI & Interaction Libraries**
- @radix-ui/* suite for accessible component primitives (dialogs, popovers, dropdowns, etc.)
- react-hook-form with @hookform/resolvers for form validation
- date-fns for date manipulation and formatting
- cmdk for command palette functionality
- lucide-react for consistent icon set

**Database & ORM**
- @neondatabase/serverless for serverless PostgreSQL connections
- drizzle-orm and drizzle-zod for ORM and schema validation
- ws for WebSocket support in serverless environment

**Development Tools**
- @replit/vite-plugin-* for Replit-specific development features
- tsx for running TypeScript files directly
- PostCSS with Tailwind CSS for style processing

**Data Validation**
- Zod for runtime type validation and schema definition
- drizzle-zod for automatic Zod schema generation from database schema
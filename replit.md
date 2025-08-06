# Tourist Log Book System

## Overview

A full-stack web application for managing tourist visitor registrations with an admin dashboard for data management and reporting. The system provides two main interfaces: a tourist registration form where visitors can register themselves and receive a control number, and an admin dashboard for viewing, managing, and exporting visitor data. Built with a modern React frontend using shadcn/ui components and an Express.js backend with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with CRUD operations for visitor management
- **Middleware**: Custom logging middleware for API request tracking
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Development**: Hot reload with Vite integration in development mode

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM for database operations
- **Schema**: Visitors table with auto-generated UUIDs and control numbers
- **Migrations**: Drizzle Kit for database schema management
- **Fallback**: In-memory storage implementation for development/testing

### Authentication and Authorization
- Currently implements a basic user schema but authentication is not actively used
- Admin dashboard is accessible without authentication (suitable for internal use)
- User table exists for future authentication implementation

### Key Features
- **Tourist Registration**: Form with name, phone, and email validation
- **Control Number Generation**: Automatic assignment of unique control numbers
- **Admin Dashboard**: Data table with search, filtering, and pagination
- **Data Export**: PDF generation for visitor reports
- **Real-time Feedback**: Toast notifications for user actions
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

### Component Architecture
- **Modular UI Components**: Reusable shadcn/ui components with consistent styling
- **Custom Components**: Specialized components like PhoneInput with formatting
- **Form Validation**: Zod schemas shared between frontend and backend
- **Data Table**: Sortable, filterable table with pagination for large datasets

## External Dependencies

### Database and ORM
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: TypeScript ORM with PostgreSQL dialect
- **drizzle-kit**: Database migration and schema management tools

### UI and Styling
- **@radix-ui/react-***: Primitive UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for components
- **lucide-react**: Icon library for consistent iconography

### Data Management
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Integration between React Hook Form and Zod
- **zod**: Runtime type validation and schema definition

### Development Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for Node.js
- **@replit/vite-plugin-***: Replit-specific development plugins

### Additional Libraries
- **date-fns**: Date manipulation and formatting
- **wouter**: Lightweight client-side routing
- **cmdk**: Command palette component
- **embla-carousel-react**: Carousel/slider component
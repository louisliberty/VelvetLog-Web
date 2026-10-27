# VelvetLog - Discrete Dating Partner Management

## Overview

VelvetLog is a private and secure relationship management application built with a full-stack TypeScript architecture. The application provides a comprehensive solution for managing multiple dating connections with complete discretion, featuring detailed partner profiles, timeline tracking, smart reminders, and advanced privacy controls.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling
- **Request Handling**: Express middleware for JSON parsing and logging
- **Development**: Hot module replacement via Vite middleware

### Data Storage Solutions
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations
- **Validation**: Zod schemas for runtime type checking
- **Fallback Storage**: In-memory storage implementation for development
- **Object Storage**: Replit Object Storage for file attachments and profile photos
- **File Management**: ObjectUploader component with secure ACL policies

## Key Components

### Database Schema
The system uses four main entities:
1. **Users**: Authenticated user accounts with Replit OAuth integration
2. **Contacts**: Enhanced partner profiles with age, birthday, favorite food, last vacation location, siblings names, and relationship status
3. **Timeline Entries**: Detailed interaction tracking (calls, texts, dates, meetings, notes, gifts)
4. **Reminders**: Smart notification system for birthdays, anniversaries, dates, calls, and gifts

### Frontend Components
- **Landing Page**: Beautiful welcome page for unauthenticated users
- **Home Dashboard**: Main interface with connection grid and search functionality
- **Partner Management**: Add, edit, and delete partner profiles with detailed fields
- **Timeline Tracking**: Historical interaction logging for each connection
- **Reminder System**: Smart notifications for important dates and follow-ups
- **Search & Filter**: Real-time filtering by name, relationship status, and preferences
- **Mobile-First Design**: Fully responsive interface optimized for mobile devices
- **Profile Photos**: Avatar upload system with circular image display and proper authentication
- **File Attachments**: Secure document and media upload system for contact files

### Backend Services
- **Authentication**: Secure Replit OAuth integration with session management
- **Partner API**: CRUD operations with user isolation and data encryption
- **Timeline API**: Private activity tracking with user-scoped access
- **Reminder API**: Personalized notification management
- **Search Service**: Advanced filtering across all partner fields including preferences

## Data Flow

1. **Client Requests**: Frontend makes HTTP requests through TanStack Query
2. **API Layer**: Express routes handle requests and validate input
3. **Business Logic**: Service layer processes data and applies business rules
4. **Data Persistence**: Drizzle ORM manages database operations
5. **Response**: JSON responses sent back to client with appropriate status codes
6. **State Updates**: React Query automatically updates UI with fresh data

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation integration
- **zod**: Runtime type validation
- **date-fns**: Date manipulation utilities

### UI Libraries
- **@radix-ui/***: Accessible primitive components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe CSS class variants
- **lucide-react**: Icon library

### Development Tools
- **tsx**: TypeScript execution for Node.js
- **vite**: Build tool and development server
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with PostgreSQL 16
- **Hot Reload**: Vite development server with Express middleware
- **Database**: Automatic provisioning via environment variables
- **Build Process**: Parallel client and server compilation

### Production Deployment
- **Platform**: Replit Autoscale deployment target
- **Build Command**: `npm run build` - Vite client build + esbuild server bundle
- **Start Command**: `npm run start` - Production server on port 5000
- **Assets**: Static files served from `/dist/public`
- **Environment**: Production database via `DATABASE_URL`

### Build Pipeline
1. Client assets compiled with Vite to `/dist/public`
2. Server code bundled with esbuild to `/dist/index.js`
3. Static file serving configured for production
4. Environment-specific configurations applied

## Changelog

```
Changelog:
- June 25, 2025: Initial ContactFlow setup
- June 25, 2025: Transformed into VelvetLog - Complete rebrand for dating partner management
  * Added user authentication with Replit OAuth
  * Enhanced partner profiles with age, birthday, favorite food, vacation history, siblings
  * Implemented relationship status tracking (dating, serious, casual, ended)
  * Updated timeline entries for dating interactions (calls, texts, dates, gifts)
  * Redesigned UI with pink/purple gradient theme for discretion
  * Added mobile-first responsive design
  * Implemented secure database storage with user isolation
  * Created beautiful landing page for unauthenticated users
- June 25, 2025: Enhanced Security & Privacy Features
  * Implemented end-to-end encryption for all user data (AES-256)
  * Added local-first storage with optional encrypted cloud backup
  * Created strong password authentication with biometric support
  * Built comprehensive privacy policy and data management tools
  * Added client-side encryption before data transmission
  * Implemented zero-knowledge architecture - server cannot decrypt user data
  * Created secure local authentication system separate from OAuth
  * Added data integrity verification with cryptographic hashing
- June 25, 2025: Advanced Activity Tracking & Interaction Management
  * Built comprehensive activity summary feature showing last interactions and notes
  * Implemented quick interaction logger with mood tracking and follow-up scheduling
  * Added smart reminder system to review notes before meetings
  * Created activity timeline with rich interaction details (duration, location, mood)
  * Enhanced contact cards with quick-action buttons for logging and summaries
  * Improved navigation with clean, intuitive interface for relationship management
- June 25, 2025: Enhanced Organization & Emergency Features
  * Implemented comprehensive tag system for categorizing partners (casual, serious, long-distance, etc.)
  * Added encrypted media attachment system for photos and documents
  * Built advanced search functionality with tag and keyword filtering
  * Created emergency exit features with realistic fake call system
  * Enhanced filtering system with multi-tag support and status filters
  * Added cross-device sync infrastructure with encrypted data synchronization
  * Improved contact management with visual tag indicators and organization tools
- June 25, 2025: Advanced Security & Intelligence Features
  * Implemented multi-factor authentication with TOTP and backup codes
  * Built comprehensive privacy dashboard with scoring and recommendations
  * Created AI-powered smart reminder system with relationship insights
  * Added security audit logging and privacy compliance tools
  * Enhanced settings with tabbed interface for better organization
  * Implemented session security and device trust management
  * Added privacy score calculation with actionable improvement suggestions
- July 16, 2025: Database Schema Optimization & Field Updates
  * Fixed critical database schema mismatch issues for production stability
  * Removed unnecessary fields: "Siblings Names", "Favorite Food", "Last Vacation"
  * Added streamlined "Location" field for Country/City/State information
  * Updated contact forms and validation to match new schema structure
  * Improved database performance by removing unused columns
  * Enhanced contact creation workflow with simplified field structure
- July 19, 2025: Enhanced Contact Management & UX Improvements
  * Improved phone input with direct country code entry (e.g., "+506 1234 5678")
  * Removed Priority Level dropdown, keeping only High Priority toggle
  * Changed "Relationship Status" to "Relationship Type" with comprehensive options
  * Added relationship types: Dating, Exclusive, Open Relationship, Friends with Benefits, Long-Distance, Friends
  * Changed "Dating Status" to "Interest Level" with Low, Medium, High options
  * Changed "Job" label to "Work" for better clarity
  * Added "Where You Met" field next to Instagram for tracking connection origin
  * Fixed form submission bug where Work field wasn't being saved
  * Fixed birthday handling to properly respect "N/A" year selection
  * Updated relationship status display formatting across all views
  * Cleaned up home page to show only Relationship Type, Summary, and Quick Log buttons
  * Streamlined form interfaces for better user experience
- July 20, 2025: Phone Input Enhancement & Anniversary Date Feature
  * Fixed database connection issues with proper WebSocket configuration
  * Enhanced phone input with visual '+' symbol and automatic country code formatting
  * Removed manual country selector for streamlined phone number entry
  * Updated placeholder texts across form fields for better user guidance
  * Replaced "Interest Level" field with "Anniversary Date" feature
  * Added month/day dropdowns for tracking first date anniversaries
  * Updated database schema to support anniversary date storage
  * Improved form field organization with Phone and Email above Birthday
- July 20, 2025: Automatic Reminder System & Birthday Display Enhancement
  * Implemented automatic 9AM reminder creation for birthday and anniversary dates
  * Added recurring reminder management that generates next year's reminders 30 days in advance
  * Fixed birthday display to hide year 1900 when "N/A" is selected (shows only month/day)
  * Created background task that runs daily to maintain continuous yearly reminders
  * Birthday and anniversary reminders are created for all contacts regardless of relationship status
- August 4, 2025: Profile Photo Upload & Object Storage Integration
  * Implemented Replit Object Storage integration for secure file storage
  * Added profile photo upload functionality with ObjectUploader component
  * Created FileAttachment system for contact document and media management
  * Enhanced avatar displays across all components (contact cards, details modal, activity summary)
  * Fixed authentication flow for private object storage with ACL security policies
  * Updated all avatar components to properly authenticate image requests with tokens
  * Added image resizing with object-cover CSS for proper aspect ratio in circular avatars
- August 12, 2025: Contact Import Feature Implementation
  * Implemented comprehensive contact import functionality for iPhone and Android devices
  * Added Contact Picker API support for modern browsers (Android Chrome)
  * Created vCard file import/export system for universal device compatibility
  * Built ContactImportDialog with contact preview, selection, and batch import
  * Supports extracting name, phone, email, birthday, location, job, and notes from contacts
  * Added import button to sidebar with proper styling and user experience
  * Includes detailed instructions for iOS and Android contact export methods
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Collaboration setup: Multiple developer workspace with real-time editing
Deployment preference: Automated pipeline with staging and production environments
Security approach: Enterprise-grade with comprehensive monitoring and audit trails
```
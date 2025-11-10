# HyperDiaScense - Quick-Scan Food Analyzer

## Overview

HyperDiaScense is a health-focused food analysis application designed for diabetes and hypertension management. The application enables users to analyze nutritional information from food labels and receive personalized health risk assessments. It features instant nutrition data input, AI-powered health predictions, scan history tracking, and user profile management with health-specific recommendations.

The application serves individuals managing diabetes, hypertension, or both conditions, providing real-time guidance on food safety based on their personal health profiles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript as the primary UI framework
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight React Router alternative)
- React Hook Form with Zod for form validation and type safety

**UI Component System**
- Shadcn/ui component library (New York style variant) with Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Custom CSS variables for theming (medical blue/green color palette)
- Responsive mobile-first design with bottom navigation

**State Management**
- React Context API for authentication state (AuthProvider)
- React Context API for admin state (AdminProvider)
- TanStack Query (React Query) for server state and caching
- Local component state with React hooks

**Key Application Features**
1. **Authentication Flow**: Email/password authentication with registration requiring health profile setup
2. **Scanner/Analyzer**: Manual nutrition input form that sends data to AI for health risk assessment
3. **History Tracking**: Real-time scan history with filtering and search capabilities
4. **Profile Management**: Comprehensive health profile editor with demographics, medical conditions, and treatment information
5. **Admin Panel**: Lazy-loaded admin interface for user management and audit logs

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- Node.js with ES modules
- Development mode uses Vite middleware for HMR
- Production mode serves static built assets

**API Structure**
- RESTful API endpoints (though minimal server-side API code is visible)
- Custom request logging middleware
- Error handling middleware
- CORS and security headers via Vite configuration

**Database Layer**
- Drizzle ORM configured for PostgreSQL
- Schema located in `shared/schema.ts`
- Migration files in `./migrations` directory
- Neon Database serverless PostgreSQL driver (@neondatabase/serverless)

**Authentication**
- Firebase Authentication for user management
- Firebase Firestore for user profiles and application data
- Session-based authentication pattern
- Role-based access control (user/admin roles)

### Data Storage Solutions

**Primary Database: PostgreSQL**
- Managed via Drizzle ORM
- Connection URL from environment variable (DATABASE_URL)
- Schema-first approach with TypeScript type generation

**Firestore (Firebase)**
- User profiles stored in `users` collection
- Scan records stored in `scanRecords` collection
- Audit logs stored in `auditLogs` collection
- Real-time subscriptions for live data updates
- Structured document schema with validation

**Data Models**
- Nutrition data: calories, carbs, protein, fat, sodium, fiber, sugars, etc.
- Health profiles: demographics, conditions, medications, blood metrics
- Scan records: nutrition data + AI prediction + timestamp + user reference
- Audit logs: user actions, timestamps, categories, severity levels

### External Dependencies

**AI/ML Services**
- Local LLaMA model integration (via Ollama or similar)
- Cohere AI SDK included in dependencies (alternative LLM provider)
- Custom prompt engineering for health risk assessment
- Structured JSON response parsing for predictions

**Firebase Services**
- Firebase Authentication (email/password provider)
- Firebase Firestore (NoSQL document database)
- Real-time listeners for data synchronization
- Configuration via environment variables

**Third-Party Libraries**
- Radix UI: Accessible component primitives
- TanStack Query: Server state management
- React Hook Form: Form state and validation
- Zod: Runtime type validation and schema parsing
- date-fns: Date formatting and manipulation
- Recharts: Data visualization (charts for dashboard)
- Tailwind CSS: Utility-first styling

**Development Tools**
- Vitest: Unit testing framework with jsdom
- TypeScript: Static type checking
- ESBuild: Production bundling
- PostCSS with Autoprefixer: CSS processing

**Database Tools**
- Drizzle Kit: Schema migrations and management
- Neon Database: Serverless PostgreSQL hosting
- connect-pg-simple: PostgreSQL session store (included but may not be actively used)

**Environment Configuration**
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `VITE_FIREBASE_*`: Firebase project credentials (API key, auth domain, project ID, etc.)
- `VITE_LOCAL_LLM_URL`: Local LLM endpoint (defaults to localhost:11434)
- `VITE_LLM_MODEL`: LLM model name (defaults to llama3.2)
- `NODE_ENV`: development/production flag

**Deployment Architecture**
- Vite production build outputs to `dist/public`
- Server bundle outputs to `dist/index.js`
- Static asset serving in production mode
- Hot module replacement in development mode
- TypeScript compilation check via `npm run check`
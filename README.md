# DukaanOS - Local Business Operating System

A comprehensive, offline-first business management solution designed specifically for Indian micro and small businesses. Built with React, TypeScript, and modern web technologies.

## Overview

DukaanOS helps local businesses manage their daily operations including sales, inventory, customer ledgers, job cards, and online store presence. The application works seamlessly offline and syncs data when connectivity is available.

## Key Features

### Core Modules (MVP)
- **Quick-Sell POS**: 3-tap billing with voice search, favorites, and multiple payment methods
- **Customer Ledger (Udhaar)**: Track outstanding balances, collect payments, send WhatsApp reminders
- **Inventory Management**: Multi-image products, barcode scanning, low stock alerts, supplier linking
- **Job Card System**: Complete repair workflow from intake to delivery with photo documentation
- **PDF Invoices**: GST-compliant invoices with embedded payment QR codes
- **Offline-First**: Full functionality without internet, automatic sync when online

### Phase 2 Features
- **Online Mini-Store**: Public store URL with product catalog and WhatsApp ordering
- **Razorpay Integration**: Online payments with automatic reconciliation
- **Automation & Reminders**: AMC renewals, payment follow-ups, service reminders
- **Multi-Store & Roles**: Team management with role-based access control
- **Reports & Analytics**: Sales, inventory, and customer insights

## Technology Stack

- **Frontend**: React 18, TypeScript
- **UI Framework**: shadcn-ui, Tailwind CSS, Radix UI
- **Build Tool**: Vite
- **Database**: IndexedDB (Dexie) for offline, Supabase (PostgreSQL) for cloud
- **State Management**: React Query, Context API
- **Routing**: React Router v6
- **PDF Generation**: jsPDF
- **QR Codes**: qrcode library
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+ and npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Git

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd friendly-greetings-bot-main

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

```sh
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Build for development (with source maps)
npm run build:dev

# Preview production build
npm run preview

# Run linter
npm run lint

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
friendly-greetings-bot-main/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   ├── billing/      # Billing and invoice components
│   │   ├── customers/    # Customer management components
│   │   ├── inventory/    # Inventory management components
│   │   ├── job-cards/    # Job card components
│   │   ├── layout/       # Layout components
│   │   ├── payment/      # Payment components
│   │   ├── pos/          # Point of sale components
│   │   ├── reports/      # Reporting components
│   │   └── ui/           # Base UI components (shadcn-ui)
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Third-party integrations
│   ├── lib/              # Utility functions and helpers
│   ├── pages/            # Page components
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── docs/                 # Documentation
│   ├── product-architecture.md
│   └── product-architecture.json
├── public/               # Static assets
├── requirements.md       # Detailed requirements document
├── design.md            # System design document
└── package.json         # Project dependencies and scripts
```

## Documentation

- **[Requirements Document](requirements.md)**: Detailed functional and non-functional requirements
- **[Design Document](design.md)**: System architecture, data models, and technical design
- **[Product Architecture](docs/product-architecture.md)**: Complete product specification and engineering handoff

## Development Guidelines

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Functional components with hooks
- Component composition over inheritance

### State Management
- React Query for server state
- Context API for global UI state
- Local state for component-specific data

### Offline-First Approach
- All CRUD operations work offline
- IndexedDB as primary data store
- Background sync queue for cloud sync
- Optimistic UI updates

### Testing
- Unit tests for utilities and hooks
- Integration tests for critical flows
- E2E tests for user journeys

## Deployment

### Build for Production

```sh
npm run build
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service.

### Recommended Hosting
- Vercel
- Netlify
- Cloudflare Pages

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For support and questions, please contact the development team.

## Roadmap

### Phase 1 (MVP) - Completed
- ✅ Quick-Sell POS
- ✅ Customer Ledger
- ✅ Inventory Management
- ✅ Job Card System
- ✅ PDF Invoices
- ✅ Offline-First Architecture

### Phase 2 - In Progress
- 🚧 Online Mini-Store
- 🚧 Razorpay Integration
- 🚧 Automation & Reminders
- 🚧 Multi-Store & Roles
- 🚧 Reports & Analytics

### Phase 3 - Planned
- 📋 Custom Domain Support
- 📋 Multi-Language Support
- 📋 Advanced Analytics
- 📋 Mobile Native Apps
- 📋 Integration Marketplace

## Acknowledgments

Built with modern web technologies and best practices for Indian small businesses.

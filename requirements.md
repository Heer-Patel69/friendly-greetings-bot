# DukaanOS - Requirements Document

## Project Overview

DukaanOS is a Local Business Operating System designed for Indian micro and small businesses. It provides an offline-first, comprehensive solution for managing sales, inventory, customers, job cards, and online store presence.

## Target Users

- Small electronics repair shops
- Service centers (AC, RO, Geyser, Washing Machine)
- Local retailers and shopkeepers
- Garage and workshop owners

## Core Requirements

### 1. Quick-Sell POS (MVP - High Priority)

**Functional Requirements:**
- Enable 3-tap billing: pick product → confirm cart → collect payment
- Support for voice-powered search in Hindi/Gujarati
- Favorites row for frequently sold items
- Multiple payment methods: Cash, UPI, Card, Partial payment
- Real-time cart management with quantity adjustments
- Walk-in customer support
- Barcode scanner integration

**Non-Functional Requirements:**
- Complete sale transaction in under 10 seconds
- Offline-first architecture with IndexedDB storage
- Responsive design for mobile and desktop
- Haptic feedback on mobile devices

### 2. Customer Ledger (Udhaar) (MVP - Medium Priority)

**Functional Requirements:**
- Track customer outstanding balances
- Record partial payments
- Send WhatsApp payment reminders
- Transaction history timeline
- Aging buckets (0-30d, 30-60d, 60-90d, 90d+)
- Customer search with voice input
- Filter by balance status

**Non-Functional Requirements:**
- Real-time balance updates
- Secure payment tracking
- Data consistency across offline/online modes

### 3. Inventory Management (MVP - High Priority)

**Functional Requirements:**
- Multi-image product uploads (up to 5 images)
- Barcode scanning and manual entry
- Cost tracking and GST rate management
- Low stock alerts and reorder levels
- Supplier linking
- CSV import/export
- Product visibility control (online/offline/both)
- Category-based organization

**Non-Functional Requirements:**
- Image compression (max 1MB per image)
- Efficient search and filtering
- Offline image storage with cloud sync

### 4. Online Mini-Store (Phase 2)

**Functional Requirements:**
- Public store URL with custom slug
- Product catalog display
- WhatsApp ordering integration
- Online payment support
- Store open/closed toggle
- QR code generation for store URL
- Customer checkout flow

**Non-Functional Requirements:**
- Server-side rendering for public store
- Service worker caching for performance
- Mobile-responsive design

### 5. PDF Invoices with Payment QR (MVP - Medium Priority)

**Functional Requirements:**
- GST-compliant invoice generation
- Embedded payment QR code for outstanding balances
- WhatsApp sharing capability
- Business branding (logo, GSTIN, address)
- Itemized billing with tax breakdown

**Non-Functional Requirements:**
- Client-side PDF generation using jsPDF
- Offline PDF creation capability
- Cloud storage sync for invoices

### 6. Razorpay Integration (Phase 2)

**Functional Requirements:**
- Payment link generation
- UPI, card, and net banking support
- Webhook-based payment reconciliation
- Real-time payment notifications
- Automatic sale status updates

**Non-Functional Requirements:**
- Secure webhook signature verification
- Idempotent payment processing
- PCI compliance for payment handling

### 7. Job Card / Garage Module (MVP - High Priority)

**Functional Requirements:**
- Job intake with device details
- Photo documentation
- Diagnosis and complaint tracking
- Parts estimation from inventory
- Customer approval workflow via WhatsApp
- Status tracking (Received → Diagnosed → Approved → In Progress → Ready → Delivered)
- Advance payment collection
- Follow-up reminder automation

**Non-Functional Requirements:**
- Image storage and compression
- Workflow state management
- Integration with inventory system

### 8. Reports & Analytics (Phase 2)

**Functional Requirements:**
- Sales reports (daily, weekly, monthly)
- Inventory reports (stock levels, low stock)
- Customer reports (top customers, outstanding balances)
- Payment reports (cash flow, payment methods)
- CSV export capability
- Visual charts and graphs

**Non-Functional Requirements:**
- Fast data aggregation
- Responsive chart rendering
- Print-friendly layouts

### 9. Offline-First Sync (MVP - Critical)

**Functional Requirements:**
- IndexedDB for local data storage
- Background sync queue
- Conflict resolution (last-writer-wins, append-only for images)
- Sync status indicators
- Manual sync trigger

**Non-Functional Requirements:**
- Data consistency guarantees
- Efficient sync algorithms
- Network resilience
- Data integrity validation

### 10. Supplier Quick-Order (Phase 2)

**Functional Requirements:**
- Supplier contact management
- Quick reorder from supplier catalog
- Order history tracking
- WhatsApp order placement

**Non-Functional Requirements:**
- Fast order creation
- Supplier data sync

### 11. Automation & Reminders (Phase 2)

**Functional Requirements:**
- AMC renewal reminders
- Filter change reminders
- Payment follow-up reminders
- Seasonal service reminders
- WhatsApp message templates
- Reminder scheduling (once, monthly, quarterly, biannual, annual)
- Overdue reminder tracking

**Non-Functional Requirements:**
- Background reminder checks (every 5 minutes)
- Reliable notification delivery
- Template customization

### 12. Authentication & Multi-Store (Phase 2)

**Functional Requirements:**
- Email and Google OAuth login
- Store registration and onboarding wizard
- Role-based access control (Owner, Cashier, Technician)
- Staff invitation and management
- Multi-store support with store switching
- Profile management

**Non-Functional Requirements:**
- Secure authentication with Supabase
- Row-level security (RLS) policies
- Session management
- Data isolation per store

### 13. Settings & Export/Import (MVP)

**Functional Requirements:**
- Store profile management
- Business details (GSTIN, address, logo)
- Payment method configuration
- Tax rate settings
- Data export (CSV, JSON)
- Data import with validation
- Backup and restore

**Non-Functional Requirements:**
- Data validation on import
- Secure data handling
- Efficient bulk operations

## Technical Requirements

### Platform
- Web application (Progressive Web App)
- Mobile-first responsive design
- Desktop support

### Technology Stack
- Frontend: React 18, TypeScript
- UI Framework: shadcn-ui, Tailwind CSS
- Build Tool: Vite
- Database: IndexedDB (Dexie), Supabase (PostgreSQL)
- State Management: React Query
- Routing: React Router
- PDF Generation: jsPDF
- QR Code: qrcode library
- Authentication: Supabase Auth

### Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Requirements
- Initial load time: < 3 seconds
- Time to interactive: < 5 seconds
- Offline functionality: Full CRUD operations
- Sync time: < 10 seconds for typical dataset

### Security Requirements
- HTTPS only
- Secure authentication tokens
- Row-level security in database
- Input validation and sanitization
- XSS and CSRF protection
- Webhook signature verification

### Accessibility Requirements
- WCAG 2.1 Level AA compliance target
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast
- Focus indicators

## Data Requirements

### Data Models
- Sales
- Customers
- Products
- Payments
- Job Cards
- Invoices
- Reminders
- Store Profiles
- Users
- Suppliers

### Data Retention
- Transaction data: Indefinite
- Images: Indefinite with compression
- Logs: 90 days
- Sync queue: Until successful sync

### Backup & Recovery
- Automatic cloud backup on sync
- Manual export capability
- Data migration support

## Integration Requirements

### Third-Party Services
- Razorpay (payment gateway)
- Supabase (backend, auth, storage)
- WhatsApp (deep linking for messages)

### APIs
- RESTful API for backend communication
- Webhook endpoints for payment events
- File upload API for images

## Compliance Requirements

### Indian Regulations
- GST compliance for invoices
- Data localization considerations
- Business registration requirements

### Privacy
- User data protection
- Consent management
- Data deletion capability

## Success Metrics

### User Metrics
- Time to complete a sale: < 10 seconds
- User retention rate: > 70% after 30 days
- Daily active users per store: > 3

### Business Metrics
- Transaction volume per store: > 50/month
- Customer satisfaction: > 4.5/5
- Feature adoption rate: > 60%

### Technical Metrics
- App crash rate: < 1%
- Sync success rate: > 99%
- API response time: < 500ms (p95)
- Offline capability: 100% for core features

## Future Enhancements (Phase 3+)

- Custom domain support for online stores
- Multi-language support (Hindi, Gujarati, Tamil, etc.)
- Advanced analytics and forecasting
- Integration with accounting software
- Mobile app (React Native)
- Loyalty program management
- SMS notifications
- Email marketing integration
- Inventory forecasting with AI
- Voice-based order entry

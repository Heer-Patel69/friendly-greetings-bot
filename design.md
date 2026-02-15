# DukaanOS - Design Document

## System Architecture

### Overview
DukaanOS follows an offline-first, progressive web application architecture with cloud sync capabilities. The system is designed to work seamlessly offline and sync data when connectivity is available.

### Architecture Layers

```
┌─────────────────────────────────────────────────┐
│           Presentation Layer (React)            │
│  Components, Pages, Hooks, Context Providers    │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         Business Logic Layer                    │
│  Custom Hooks, State Management, Validation     │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│          Data Access Layer                      │
│  IndexedDB (Dexie), React Query, Supabase       │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         Storage & Backend                       │
│  IndexedDB, Supabase (PostgreSQL, Storage)      │
└─────────────────────────────────────────────────┘
```

## Design Principles

### 1. Offline-First
- All core operations work without internet
- Data stored locally in IndexedDB
- Background sync when online
- Optimistic UI updates

### 2. Mobile-First
- Touch-optimized interfaces
- Responsive layouts
- Bottom navigation for mobile
- Gesture support (swipe, long-press)

### 3. Speed & Efficiency
- 3-tap billing workflow
- Keyboard shortcuts for desktop
- Voice input support
- Favorites and quick actions

### 4. Indian Market Focus
- GST compliance
- Hindi/Gujarati language support
- WhatsApp integration
- UPI payment support

## UI/UX Design

### Design System

**Color Palette:**
- Primary: Blue (#2563EB)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)
- Neutral: Gray scale

**Typography:**
- Font Family: System fonts (Inter, SF Pro, Roboto)
- Headings: Bold, 24-32px
- Body: Regular, 14-16px
- Small: 12-14px

**Spacing:**
- Base unit: 4px
- Common spacing: 8px, 12px, 16px, 24px, 32px

**Components:**
- shadcn-ui component library
- Radix UI primitives
- Custom components for domain-specific needs

### Navigation Structure

**Mobile Navigation (Bottom Nav):**
- Dashboard
- Sales (Quick Sell)
- Customers
- Inventory
- More (Settings, Reports, Job Cards)

**Desktop Navigation (Sidebar):**
- Dashboard
- Quick Sell
- Sales History
- Customers
- Inventory
- Job Cards
- Reports
- Automations
- Settings

### Key User Flows

#### 1. Quick Sell Flow
```
Dashboard → Quick Sell → Select Products → Review Cart → 
Select Payment Method → Generate Invoice → Share/Print
```

**Design Decisions:**
- Product grid with large touch targets (min 44x44px)
- Favorites row always visible
- Cart preview at bottom (mobile) or side panel (desktop)
- One-tap payment method selection
- Instant success feedback

#### 2. Customer Ledger Flow
```
Customers → Select Customer → View Ledger → 
Collect Payment / Send Reminder
```

**Design Decisions:**
- Balance prominently displayed
- Color-coded status (red for outstanding)
- Transaction timeline with icons
- Quick actions (Call, WhatsApp, Collect)

#### 3. Inventory Management Flow
```
Inventory → Add/Edit Product → Upload Images → 
Enter Details → Save
```

**Design Decisions:**
- Camera-first image upload
- Drag-to-reorder images
- Inline editing for quick updates
- Visual low-stock indicators

#### 4. Job Card Flow
```
Job Cards → New Job → Enter Device Info → 
Add Photos → Diagnosis → Estimate → 
Send to Customer → Track Status → Deliver
```

**Design Decisions:**
- Wizard-style intake form
- Status badges with color coding
- Photo gallery with thumbnails
- WhatsApp integration for approvals

## Data Design

### Database Schema (IndexedDB)

**Schema Version: 6**

#### Tables

**1. sales**
```typescript
{
  id: string (primary key)
  store_id: string
  customer_id: string
  customer_name: string
  customer_phone: string
  cart_items: CartItem[]
  subtotal: number
  gst_total: number
  discount: number
  grand_total: number
  paid_amount: number
  balance: number
  status: 'Paid' | 'Partial' | 'Unpaid'
  payment_method: string
  payment_ref: string | null
  invoice_number: string
  pdf_url: string | null
  created_at: string
  updated_at: string
  synced: boolean
}
```

**2. customers**
```typescript
{
  id: string (primary key)
  store_id: string
  name: string
  phone: string
  email: string | null
  address: string | null
  balance: number
  total_purchases: number
  total_paid: number
  credit_limit: number
  tags: string[]
  last_visit: string
  created_at: string
  synced: boolean
}
```

**3. products**
```typescript
{
  id: string (primary key)
  store_id: string
  name: string
  sku: string
  barcode: string | null
  category: string
  description: string | null
  price: number
  cost: number
  gst_pct: number
  stock: number
  reorder_level: number
  supplier_id: string | null
  image_urls: string[]
  cover_image_url: string | null
  visibility: 'online' | 'offline' | 'both'
  is_active: boolean
  created_at: string
  updated_at: string
  synced: boolean
}
```

**4. payments**
```typescript
{
  id: string (primary key)
  store_id: string
  sale_id: string
  customer_id: string
  customer_name: string
  amount: number
  method: string
  notes: string | null
  timestamp: string
  synced: boolean
}
```

**5. job_cards**
```typescript
{
  id: string (primary key)
  store_id: string
  customer_id: string
  customer_name: string
  customer_phone: string
  device_type: string
  brand: string
  model: string
  serial_number: string | null
  complaints: string[]
  diagnosis: string | null
  photos: string[]
  parts: JobCardPart[]
  labor_charge: number
  total_estimate: number
  advance_paid: number
  status: 'Received' | 'Diagnosed' | 'Approved' | 'In Progress' | 'Ready' | 'Delivered'
  received_at: string
  delivered_at: string | null
  created_at: string
  updated_at: string
  synced: boolean
}
```

**6. reminders**
```typescript
{
  id: string (primary key)
  store_id: string
  type: 'AMC' | 'FilterChange' | 'Service' | 'PaymentFollowup' | 'Custom'
  customer_id: string
  customer_name: string
  customer_phone: string
  title: string
  message: string
  frequency: 'once' | 'monthly' | 'quarterly' | 'biannual' | 'annual'
  next_due_at: number
  last_triggered_at: number | null
  last_service_date: number | null
  job_card_id: string | null
  device_info: string | null
  status: 'Active' | 'Paused' | 'Completed' | 'Cancelled'
  created_at: number
  notes: string | null
}
```

**7. store_profiles**
```typescript
{
  id: string (primary key)
  owner_id: string
  name: string
  slug: string
  logo_url: string | null
  description: string | null
  address: string
  city: string
  state: string
  phone: string
  whatsapp: string
  gstin: string | null
  categories: string[]
  is_open: boolean
  theme_color: string
  rating: number
  created_at: string
}
```

### Supabase Schema (Cloud)

**Tables:**
- profiles (user profiles)
- stores (store records)
- store_members (team members)
- user_roles (role assignments)
- All IndexedDB tables mirrored for sync

**Row-Level Security (RLS):**
- Users can only access their own data
- Store owners can manage their stores
- Role-based access for team members

## Sync Strategy

### Sync Queue Design

**Queue Structure:**
```typescript
{
  id: string
  operation: 'create' | 'update' | 'delete'
  table: string
  record_id: string
  data: any
  timestamp: number
  retry_count: number
  status: 'pending' | 'syncing' | 'failed' | 'completed'
}
```

### Conflict Resolution

**Strategy by Entity:**

1. **Sales, Payments, Job Cards:** Append-only, no conflicts
2. **Products, Customers:** Last-writer-wins on field level
3. **Images:** Append-only, merge all images
4. **Stock:** Server calculates: `server_stock - sum(offline_decrements)`

### Sync Triggers
- On app startup
- On network reconnection
- Manual sync button
- Every 5 minutes (background)
- After critical operations

## Component Architecture

### Component Hierarchy

```
App
├── AuthProvider
├── Router
│   ├── PublicRoutes
│   │   ├── Auth (Login/Register)
│   │   ├── Onboarding
│   │   └── PublicStore
│   └── ProtectedRoutes
│       ├── AppLayout
│       │   ├── Sidebar/BottomNav
│       │   ├── Dashboard
│       │   ├── QuickSell
│       │   ├── Customers
│       │   ├── Inventory
│       │   ├── JobCards
│       │   ├── Reports
│       │   ├── Automations
│       │   └── Settings
│       └── Modals/Sheets
```

### Key Components

**1. ProductGrid**
- Displays products in responsive grid
- Search and filter functionality
- Favorites row
- Add to cart action

**2. CartPanel**
- Shows cart items
- Quantity adjustment
- Customer selection
- Total calculation
- Payment trigger

**3. PaymentSheet**
- Payment method selection
- Partial payment input
- Confirmation action

**4. InvoiceViewer**
- PDF preview
- Share options
- Print functionality

**5. CustomerLedger**
- Balance display
- Transaction timeline
- Payment collection
- Reminder sending

**6. JobCardWizard**
- Multi-step form
- Photo upload
- Parts selection
- Status tracking

## State Management

### Context Providers

**1. AuthContext**
- User authentication state
- Store information
- User role
- Sign in/out methods

**2. OfflineStoreContext**
- IndexedDB access
- CRUD operations
- Sync queue management

**3. SyncContext**
- Sync status
- Sync triggers
- Conflict resolution

### React Query Usage

- Server state caching
- Optimistic updates
- Background refetching
- Mutation handling

## API Design

### REST Endpoints

**Sales:**
- `POST /api/sales` - Create sale
- `GET /api/sales?store_id=X` - List sales
- `GET /api/sales/:id` - Get sale details
- `PATCH /api/sales/:id` - Update sale

**Customers:**
- `POST /api/customers` - Create customer
- `GET /api/customers?store_id=X` - List customers
- `GET /api/customers/:id` - Get customer details
- `PATCH /api/customers/:id` - Update customer

**Products:**
- `POST /api/products` - Create product
- `GET /api/products?store_id=X` - List products
- `GET /api/products/:id` - Get product details
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

**Payments:**
- `POST /api/payments` - Record payment
- `GET /api/payments?customer_id=X` - List payments

**Job Cards:**
- `POST /api/job-cards` - Create job card
- `GET /api/job-cards?store_id=X` - List job cards
- `PATCH /api/job-cards/:id` - Update job card

**Webhooks:**
- `POST /api/webhooks/razorpay` - Razorpay payment webhook

### Authentication

**Supabase Auth:**
- Email/password authentication
- Google OAuth
- JWT tokens
- Session management

## Security Design

### Authentication & Authorization

**Authentication:**
- Supabase Auth with JWT tokens
- Secure token storage
- Automatic token refresh

**Authorization:**
- Role-based access control (RBAC)
- Row-level security (RLS) in Supabase
- Client-side route guards

### Data Security

**Encryption:**
- HTTPS for all communications
- Encrypted storage for sensitive data
- Secure webhook signatures

**Input Validation:**
- Client-side validation with Zod
- Server-side validation
- SQL injection prevention
- XSS protection

### Privacy

**Data Handling:**
- Minimal data collection
- User consent for data processing
- Data deletion capability
- GDPR considerations

## Performance Optimization

### Frontend Optimization

**Code Splitting:**
- Route-based code splitting
- Lazy loading of components
- Dynamic imports for heavy libraries

**Asset Optimization:**
- Image compression
- Lazy loading images
- WebP format support
- CDN for static assets

**Rendering Optimization:**
- React.memo for expensive components
- useMemo and useCallback hooks
- Virtual scrolling for long lists
- Debouncing and throttling

### Data Optimization

**IndexedDB:**
- Indexed queries
- Batch operations
- Efficient data structures

**Network:**
- Request deduplication
- Response caching
- Compression (gzip/brotli)

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Hook testing
- Utility function testing
- 80% code coverage target

### Integration Tests
- User flow testing
- API integration testing
- Database operation testing

### E2E Tests
- Critical user journeys
- Cross-browser testing
- Mobile device testing

### Performance Tests
- Load time testing
- Sync performance testing
- Offline functionality testing

## Deployment Architecture

### Build Process
1. TypeScript compilation
2. Vite bundling
3. Asset optimization
4. Service worker generation

### Hosting
- Static hosting (Vercel/Netlify)
- CDN distribution
- Edge functions for webhooks

### CI/CD Pipeline
1. Code push to repository
2. Automated tests
3. Build generation
4. Deployment to staging
5. Manual approval
6. Production deployment

## Monitoring & Analytics

### Error Tracking
- Client-side error logging
- Sync failure tracking
- API error monitoring

### Performance Monitoring
- Core Web Vitals
- Load time metrics
- Sync performance
- API response times

### User Analytics
- Feature usage tracking
- User journey analysis
- Conversion funnels
- Retention metrics

## Accessibility

### WCAG 2.1 Compliance

**Perceivable:**
- Alt text for images
- Color contrast ratios (4.5:1 minimum)
- Resizable text
- Visual focus indicators

**Operable:**
- Keyboard navigation
- Touch target size (44x44px minimum)
- No keyboard traps
- Skip navigation links

**Understandable:**
- Clear labels and instructions
- Error messages and suggestions
- Consistent navigation
- Predictable behavior

**Robust:**
- Semantic HTML
- ARIA labels where needed
- Screen reader testing
- Cross-browser compatibility

## Internationalization (i18n)

### Language Support
- English (default)
- Hindi (Phase 2)
- Gujarati (Phase 2)

### Implementation
- i18n library (react-i18next)
- Language switcher
- RTL support consideration
- Date/number formatting

## Future Considerations

### Scalability
- Horizontal scaling for backend
- Database sharding strategies
- CDN optimization
- Caching strategies

### Feature Expansion
- Mobile native apps
- Advanced analytics
- AI-powered insights
- Integration marketplace

### Technical Debt Management
- Regular refactoring
- Dependency updates
- Performance audits
- Security audits

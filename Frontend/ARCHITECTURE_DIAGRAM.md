# Campus Commute Frontend Architecture & Feature Map

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAMPUS COMMUTE - FRONTEND                    │
│                   (React + TypeScript + Tailwind)               │
└─────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │  React App   │
                              └──────┬───────┘
                                     │
                  ┌──────────────────┼──────────────────┐
                  │                  │                  │
          ┌───────▼────────┐  ┌──────▼───────┐  ┌──────▼──────┐
          │   AuthContext  │  │ ThemeContext │  │  Navigation │
          │                │  │              │  │              │
          │  User Data     │  │  Dark Mode   │  │  Routes      │
          │  Auth State    │  │  Persistence │  │  Navigation  │
          └────────────────┘  └──────────────┘  └──────────────┘
                  │                  │                  │
          ┌───────▼──────────────────▼──────────────────▼─────────┐
          │              PAGES & COMPONENTS                       │
          └────────────────────────────────────────────────────────┘
                  │                  │                  │
    ┌─────────────▼──────┐  ┌────────▼────────┐  ┌─────▼────────┐
    │   Home Page        │  │ RouteSelection  │  │ DriverInfo   │
    │ ├─ ETA Display     │  │ ├─ Route List   │  │ ├─ Driver    │
    │ ├─ Route Info      │  │ ├─ Details      │  │ ├─ Conductor │
    │ ├─ Bottom Sheet    │  │ ├─ Conductor    │  │ ├─ Bus       │
    │ ├─ Status Chip     │  │ └─ ETA Display  │  │ └─ Call Btns │
    │ └─ Route Details   │  └────────────────┘  └──────────────┘
    │    Modal           │
    └───────────────────┘
          │
    ┌─────▼──────────────────────────────────────────────────┐
    │         COMPONENTS (Reusable)                         │
    │                                                         │
    │  ┌──────────────────┐      ┌──────────────────────┐   │
    │  │   RouteMap       │      │ RouteDetailsModal    │   │
    │  │                  │      │                      │   │
    │  │ Leaflet.js       │      │ Route Information    │   │
    │  │ Stop Markers     │      │ Conductor Details    │   │
    │  │ Route Lines      │      │ ETA Display          │   │
    │  │ Interactive      │      │ Bus & Driver Info    │   │
    │  └──────────────────┘      └──────────────────────┘   │
    │                                                         │
    │  Plus: AppSidebar, BackButton, GradientButton, etc.   │
    └─────────────────────────────────────────────────────────┘
          │
    ┌─────▼──────────────────────────────────────────────────┐
    │         DATA LAYER (localStorage)                      │
    │                                                         │
    │  ├─ adminRoutes (Route data with conductor & ETA)     │
    │  ├─ campus-commute-accounts (User accounts)           │
    │  └─ campus-commute-theme (Theme preference)           │
    └─────────────────────────────────────────────────────────┘
```

---

## 📊 Feature Flow Diagram

### 1. CONDUCTOR CALL FEATURE FLOW

```
┌─────────────────────────────────────────────┐
│  User Views Driver Info Page                │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────▼─────────┐
         │ Fetch user route  │
         └─────────┬─────────┘
                   │
         ┌─────────▼──────────────────┐
         │ Search adminRoutes by      │
         │ route number               │
         └─────────┬──────────────────┘
                   │
      ┌────────────▼────────────┐
      │                         │
   ┌──▼─────┐            ┌──────▼──────┐
   │ Found  │            │  Not Found  │
   └──┬─────┘            └──────┬──────┘
      │                         │
  ┌───▼──────────┐        ┌─────▼──────────┐
  │ Extract      │        │ Show "Conductor│
  │ conductor    │        │ not assigned"  │
  │ details      │        └────────────────┘
  └───┬──────────┘
      │
  ┌───▼──────────────────┐
  │ Display Conductor    │
  │ Info in Page         │
  │ └─ Name              │
  │ └─ "Call" Button     │
  └───┬──────────────────┘
      │
  ┌───▼──────────────────┐
  │ User clicks          │
  │ "Call Conductor"     │
  └───┬──────────────────┘
      │
  ┌───▼──────────────────┐
  │ Validate Phone       │
  │ Format: +91XXXXXXXXX │
  └───┬──────────────────┘
      │
  ┌───▼──────────────────┐
  │ window.location.href │
  │ = tel:+91XXXXXXXXX   │
  └───┬──────────────────┘
      │
  ┌───▼──────────────────┐
  │ Phone Dialer Opens   │
  └──────────────────────┘
```

### 2. ETA DISPLAY FLOW

```
┌──────────────────────────┐
│ Student Opens Home Page  │
└───────────┬──────────────┘
            │
    ┌───────▼──────────┐
    │ Fetch user       │
    │ route number     │
    └───────┬──────────┘
            │
    ┌───────▼──────────────────────┐
    │ Search adminRoutes for route │
    │ matching student's routeNo   │
    └───────┬──────────────────────┘
            │
         ┌──▼───┐
         │Found?│
         └──┬───┘
    ┌───────┴───────┐
    │               │
   Yes             No
    │               │
 ┌──▼──┐      ┌────▼──────┐
 │Get  │      │Use default│
 │ETA  │      │ETA (10 min)│
 └──┬──┘      └────┬──────┘
    │              │
    └──────┬───────┘
           │
    ┌──────▼──────────────┐
    │ Display in UI:       │
    │ ├─ Status chip       │
    │ ├─ Bottom sheet      │
    │ └─ Route Details Mdl │
    └──────┬───────────────┘
           │
    ┌──────▼──────────────┐
    │ "Reaching your stop │
    │  in {eta} minutes"  │
    └─────────────────────┘
```

### 3. ROUTE DETAILS MODAL FLOW

```
┌──────────────────────────────┐
│ User on Home/RouteSelection  │
│ Clicks "View Route Details"  │
└───────────┬──────────────────┘
            │
    ┌───────▼──────────────────┐
    │ Open RouteDetailsModal   │
    │ with route data          │
    └───────┬──────────────────┘
            │
    ┌───────▼──────────────────┐
    │ Modal Displays:          │
    │ ├─ Route number          │
    │ ├─ All stops (numbered)  │
    │ ├─ Timing                │
    │ ├─ ETA                   │
    │ ├─ Bus number            │
    │ ├─ Driver name           │
    │ └─ Conductor info        │
    │    ├─ Name               │
    │    └─ Phone (clickable)  │
    └───────┬──────────────────┘
            │
    ┌───────▼──────────────────┐
    │ User can:               │
    │ ├─ Click conductor phone│
    │ ├─ Close modal          │
    │ └─ View full details    │
    └─────────────────────────┘
```

### 4. MAP VISUALIZATION FLOW

```
┌──────────────────────────────┐
│ RouteMap Component Mounted   │
│ with stops data              │
└───────────┬──────────────────┘
            │
    ┌───────▼──────────────────┐
    │ Initialize Leaflet Map   │
    │ Set center & zoom        │
    │ Load OSM tiles           │
    └───────┬──────────────────┘
            │
    ┌───────▼──────────────────┐
    │ Create Stop Markers      │
    │ For each stop:           │
    │ ├─ Get lat/lng           │
    │ ├─ Determine status      │
    │ ├─ Create icon           │
    │ ├─ Add popup             │
    │ └─ Add to map            │
    └───────┬──────────────────┘
            │
    ┌───────▼──────────────────┐
    │ Draw Route Polylines     │
    │ ├─ Completed (solid)     │
    │ └─ Remaining (dotted)    │
    └───────┬──────────────────┘
            │
    ┌───────▼──────────────────┐
    │ Auto-fit Bounds          │
    │ Show all stops on map    │
    └───────┬──────────────────┘
            │
    ┌───────▼──────────────────┐
    │ Map Ready for Interaction│
    │ User can:                │
    │ ├─ Zoom in/out           │
    │ ├─ Pan around            │
    │ └─ Click stops for info  │
    └──────────────────────────┘
```

---

## 🔄 Data Flow Architecture

```
ADMIN PANEL                    DATA STORAGE              STUDENT/USER PAGES
┌─────────────┐               ┌──────────────┐          ┌────────────────┐
│ Create/Edit │───────────────│ adminRoutes  │─────────>│ Home Page      │
│ Route with: │               │ (localStorage)│          │ ├─ ETA        │
│ ├─ Conductor│               │              │          │ ├─ Route Info │
│ ├─ Phone    │               └──────────────┘          │ └─ Details    │
│ └─ ETA      │                      ▲                   └────────────────┘
└─────────────┘                      │                   ┌────────────────┐
                                     │                   │ RouteSelection │
                                     └───────────────────│ Shows all      │
                                                         │ route details  │
                                                         └────────────────┘
                                                         ┌────────────────┐
                                                         │ Driver Info    │
                                                         │ Shows conductor│
                                                         │ Can call       │
                                                         └────────────────┘
```

---

## 📱 Component Hierarchy

```
App.tsx
├── MobileLayout
│   ├── AuthContext
│   └── ThemeContext
│
├── Pages (Router)
│   ├── Home
│   │   ├── RouteMap (optional future use)
│   │   ├── RouteDetailsModal (NEW)
│   │   ├── AppSidebar
│   │   └── NotificationSheet
│   │
│   ├── RouteSelection
│   │   └── RouteDetailsModal (NEW)
│   │
│   ├── DriverInfo
│   │   └── (Updated with conductor logic)
│   │
│   ├── AdminPanel
│   │   └── (Updated with conductor & ETA forms)
│   │
│   └── Other pages...
│
└── Components
    ├── RouteMap (NEW)
    ├── RouteDetailsModal (NEW)
    ├── AppSidebar
    ├── BackButton
    ├── GradientButton
    ├── MobileLayout
    └── ui/* (shadcn components)
```

---

## 🎯 State Management Flow

```
┌─────────────────────────────────────┐
│      ROOT CONTEXT PROVIDERS         │
└──────────────────┬──────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    ┌───▼──────────┐    ┌────▼────────────┐
    │ AuthContext  │    │ ThemeContext    │
    │              │    │                 │
    │ State:       │    │ State:          │
    │ - user       │    │ - theme         │
    │ - isAuth     │    │ - setTheme      │
    │ - login()    │    │ - localStorage  │
    │ - logout()   │    │   persistence   │
    │ - updateUser │    │                 │
    └───┬──────────┘    └────┬────────────┘
        │                    │
        │         ┌──────────┴────────┐
        │         │                   │
    Pages use   Pages use       Component State
    Auth        Theme           (useState)
    Context     Context         ├─ Home:
                                │  - eta
                                │  - routeInfo
                                │  - showRouteDetails
                                │
                                ├─ RouteSelection:
                                │  - selectedId
                                │  - routes
                                │
                                └─ AdminPanel:
                                   - conductorName
                                   - conductorPhone
                                   - eta
```

---

## 🌐 API Integration Points (Future)

```
Current: localStorage
                ↓
        ┌───────┴────────┐
        │                │
   Data Layer       Service Layer
   ┌─────────┐     ┌──────────┐
   │local    │ vs  │ REST API │
   │Storage  │     │          │
   └─────────┘     └──────────┘
        │                │
        └────────┬───────┘
                 │
           React Component
           (same interface)

When backend is ready:
1. Replace localStorage.getItem() with fetch()
2. Use async/await for API calls
3. Add loading states
4. Add error handling
5. WebSocket for real-time ETA
```

---

## 📊 Data Model Relationships

```
User (AuthContext)
├── role: "student" | "driver"
├── email: string
├── phoneNumber: string
├── routeNo: string  ──────┐
└── fullName: string       │
                           │
                           ├──> Route (adminRoutes[])
                           │    ├── number: "Route 1"
                           │    ├── stops: string[]
                           │    ├── timing: string
                           │    ├── eta: number
                           │    ├── conductorName: string
                           │    ├── conductorPhone: string
                           │    ├── assignedDriver: string
                           │    └── assignedBus: string
                           │
                           └──> Driver (registeredAccounts[])
                                ├── name: string
                                ├── phone: string
                                ├── busNumber: string
                                └── routeNo: string
```

---

## 🔐 Data Security Model

```
┌─────────────────────────────────────┐
│     localStorage (Client-side)      │
├─────────────────────────────────────┤
│                                     │
│  adminRoutes                        │
│  ├─ Route data (public)             │
│  ├─ Conductor name (semi-public)    │
│  ├─ Conductor phone (protected)     │
│  └─ ETA (public)                    │
│                                     │
│  campus-commute-accounts            │
│  ├─ Email (semi-sensitive)          │
│  ├─ Password (NOT ENCRYPTED)        │
│  ├─ Phone (sensitive)               │
│  └─ Profile data (semi-public)      │
│                                     │
│  campus-commute-theme               │
│  └─ Theme preference (non-sensitive)│
│                                     │
└─────────────────────────────────────┘
        │
        │ Future: Migrate to Backend
        ▼
┌─────────────────────────────────────┐
│      Secure Backend API (HTTPS)     │
├─────────────────────────────────────┤
│  ├─ Encrypted password storage      │
│  ├─ JWT authentication              │
│  ├─ Role-based access control       │
│  ├─ Data validation                 │
│  └─ Audit logging                   │
└─────────────────────────────────────┘
```

---

## 🎨 UI Component Tree

```
RouteDetailsModal
├── Dialog (Radix)
│   ├── Header
│   │   └── Title
│   ├── Content
│   │   ├── Route Info
│   │   │   ├── Route Number
│   │   │   └── Description
│   │   │
│   │   ├── Stops Section
│   │   │   ├── MapPin Icon
│   │   │   └── Stop List
│   │   │
│   │   ├── Info Grid (2 columns)
│   │   │   ├── Timing
│   │   │   └─ ETA (optional)
│   │   │   ├─ Bus (optional)
│   │   │   └─ Driver (optional)
│   │   │
│   │   ├─ Conductor Section (optional)
│   │   │   ├─ Conductor Name
│   │   │   └─ Phone (clickable)
│   │   │
│   │   └─ Close Button
│   │       └─ Primary button
│   │
│   └── Footer (implicit)
│       └─ Close on backdrop click

RouteMap
├── Leaflet Map Container
│   ├── TileLayer (OSM)
│   ├── Markers (SVG-based)
│   │   ├─ Marker Group (Passed)
│   │   ├─ Marker Group (Current - animated)
│   │   └─ Marker Group (Upcoming)
│   ├── Polylines
│   │   ├─ Completed Route (solid)
│   │   └─ Remaining Route (dotted)
│   ├── Popups (on click)
│   │   └─ Stop Info
│   └─ Legend (implicit)
```

---

## 🚀 Performance Optimization

```
Code Splitting
├── Route-based (automatic with React Router)
├── Component lazy loading (optional future)
└── Bundle analysis (webpack-bundle-analyzer)

Caching Strategy
├── LocalStorage for routes data
├── Browser cache for static assets
└── Service Worker for PWA (if enabled)

Rendering Optimization
├── React.memo for RouteDetailsModal
├── useCallback for event handlers
├── useEffect cleanup for map
└── Conditional rendering for optional components

Asset Optimization
├── Minified CSS (65.41 KB → 11.35 KB gzipped)
├── Minified JS (533.23 KB → 154.87 KB gzipped)
├── Tree-shaking for unused code
└── Image optimization (future: lazy loading)
```

---

## 📈 Scalability Plan

```
Current (v1.0 - Complete)
├─ localStorage-based
├─ Single-user focus
└─ Static route data

Next (v1.1 - Planned)
├─ Backend API integration
├─ Real-time location tracking
└─ WebSocket for live ETA

Future (v2.0 - Suggested)
├─ Multi-language support
├─ Advanced analytics
├─ AI-based route optimization
└─ Mobile app (React Native)
```

---

**Document**: Campus Commute Frontend Architecture  
**Version**: 1.0  
**Status**: Complete  
**Last Updated**: December 25, 2025


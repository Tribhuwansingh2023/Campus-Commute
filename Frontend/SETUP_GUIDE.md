# Campus Commute Connect - Mobile-First Application

A comprehensive, fully-functional mobile-first bus tracking and management application for campus transportation with student, driver, and admin roles.

## 🚀 Features Implemented

### ✅ Authentication System
- Email/Password login with validation
- Account existence checking
- Google & Apple login buttons (with official logos)
- Password strength requirements
- OTP email verification
- Email change during signup
- Account data persistence

### ✅ Student Features
- **Profile Management**:
  - Profile picture upload with circular crop tool
  - Editable phone number, branch, course, semester
  - Batch year selection (2026-2030)
  - Non-editable name and email

- **Home/Tracking**:
  - Enhanced SVG-based route map
  - Completed route (solid dark line)
  - Current location (pulsing marker)
  - Upcoming stops (dotted line)
  - Real-time bus position

- **Navigation**:
  - Route selection with 10+ dynamic routes
  - Driver info access
  - Stoppage details
  - Contact driver/conductor

### ✅ Driver Features
- **Profile Management**:
  - Profile picture upload with crop
  - Bus number, license ID, phone number
  - Route assignment, timing selection
  - Driver-specific menu items

- **Navigation**:
  - Driver home dashboard
  - Settings and preferences
  - Logout functionality

### ✅ Admin Features
- **Route Management**:
  - Add new routes with stops and timing
  - Edit existing routes
  - Delete routes
  - Assign buses and drivers
  - Real-time data updates

### ✅ Global Features
- **Dark Mode**:
  - Complete theme switching
  - Persistent preference storage
  - Smooth transitions

- **Responsive Design**:
  - Mobile-first approach
  - Touch-friendly UI
  - Proper spacing and padding

- **Settings**:
  - Dark mode toggle
  - Location sharing
  - Notification preferences
  - Password management
  - Help & support access

## 📁 Project Structure

```
campus-commute-connect-85/
├── src/
│   ├── components/
│   │   ├── AppSidebar.tsx (Role-based menu)
│   │   ├── ImageUploadWithCrop.tsx (Profile picture crop)
│   │   ├── Logo.tsx (Enhanced with xl size)
│   │   ├── MobileLayout.tsx
│   │   ├── FormInput.tsx
│   │   ├── GradientButton.tsx
│   │   └── ui/ (shadcn/ui components)
│   ├── contexts/
│   │   ├── AuthContext.tsx (User & authentication state)
│   │   └── ThemeContext.tsx (Dark mode support)
│   ├── pages/
│   │   ├── Login.tsx (Enhanced with Google/Apple)
│   │   ├── StudentSignup.tsx
│   │   ├── DriverSignup.tsx
│   │   ├── SetPassword.tsx (Account persistence)
│   │   ├── OTPVerification.tsx (Email change support)
│   │   ├── StudentRole.tsx
│   │   ├── DriverRole.tsx
│   │   ├── Home.tsx (Student tracking with map)
│   │   ├── DriverHome.tsx
│   │   ├── Profile.tsx (Student profile edit)
│   │   ├── DriverProfile.tsx (Driver profile management)
│   │   ├── AdminPanel.tsx (Route management)
│   │   ├── RouteSelection.tsx
│   │   ├── DriverInfo.tsx (With Call Conductor)
│   │   ├── Settings.tsx (With dark mode)
│   │   └── ... (other pages)
│   ├── hooks/
│   ├── lib/
│   ├── assets/
│   ├── App.tsx (Main routing)
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── ENHANCEMENT_SUMMARY.md
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 16+ and npm/yarn installed
- Modern web browser

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd campus-commute-connect-85

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8082` (or next available port)

## 📱 Usage Guide

### First Time User

1. **Choose Role**: Select Student or Driver
2. **Sign Up**: Create account with required details
3. **Set Password**: Create secure password
4. **Verify Email**: Complete OTP verification
5. **Start Using**: Access your dashboard

### Student Workflow

1. Login → Route Selection → Home (Tracking) → Profile/Settings
2. View route map with real-time bus position
3. Access driver information
4. Edit profile with personal details
5. Toggle dark mode in settings

### Driver Workflow

1. Login → Driver Home → Profile
2. Edit profile (bus number, route, license)
3. Upload profile picture
4. Access settings and preferences

### Admin Workflow

1. Access Admin Panel from menu
2. Add/Edit/Delete routes
3. Assign buses and drivers
4. Routes appear in student's route selection

## 🔐 Local Authentication

**Test Accounts** (Auto-created via localStorage):

### Create Test Account:
1. Go to Sign Up page
2. Fill details and create password
3. Complete OTP verification
4. Account saved locally

### Login:
- Use same email and password
- Account verification checks localStorage

## 📊 Data Persistence

All data is stored in browser's localStorage:
- `campus-commute-accounts`: User accounts
- `adminRoutes`: Route management data
- `campus-commute-theme`: Dark mode preference

To reset: Clear browser's Application > Local Storage

## 🎨 Design System

- **Primary Color**: Teal gradient
- **Logo**: #A6A6A6 / Teal variant
- **Spacing**: Tailwind (px-8, py-6, etc.)
- **Corners**: Rounded 2xl
- **Animations**: Smooth transitions
- **Mobile**: 375px+ width optimized

## 🔧 Build & Deploy

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📝 Environment Variables

Create `.env` file if using backend:
```
VITE_API_URL=your_api_url
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
```

## 🚀 Features To Implement Next

- [ ] Real backend API integration (Firebase/Supabase)
- [ ] Real GPS tracking
- [ ] Push notifications
- [ ] Email verification
- [ ] Payment gateway
- [ ] Chat support
- [ ] Trip history
- [ ] Rating & review system

## 📞 Support

For issues or feature requests, please create an issue in the repository.

## 📄 License

This project is private and confidential.

## 👥 Team

Built with ❤️ for Campus Commute

---

**Version**: 1.0.0 - Fully Enhanced & Finalized
**Last Updated**: December 2025

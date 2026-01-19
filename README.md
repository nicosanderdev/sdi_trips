# Holiday Trips - Vacation Rental Platform

A modern React-based vacation rental platform built with TypeScript, Vite, and Supabase.

## Features

- 🏠 Property listings and search
- 📅 Interactive booking system with calendar integration
- 💬 Property messaging system
- 🌍 Multi-language support (English, Spanish, Portuguese)
- 📧 Email notifications for confirmed bookings
- 🔒 Secure authentication with Supabase

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL JS
- **Email**: Resend API
- **i18n**: react-i18next

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd sdi_trips
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mapbox (Optional - for interactive maps)
VITE_MAPBOX_TOKEN=your_mapbox_token

# Email Feature Flag (Optional - default: false in dev)
VITE_SEND_EMAILS_ENABLED=false
```

### 3. Supabase Edge Functions Setup

For email notifications, set up the following secrets in your Supabase Dashboard:

**Edge Functions → Secrets:**
```bash
RESEND_API_KEY=re_xxxxx
SEND_EMAILS_ENABLED=true
```

### 4. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy send-booking-confirmation
```

### 5. Run the Development Server

```bash
npm run dev
```

## Booking System

The platform includes a sophisticated booking system that:

1. **Checks Calendar Integration**: Queries the `CalendarIntegrations` table to determine if a property has external calendar sync
2. **Status Assignment**:
   - Properties with active calendar integrations → Booking status: `pending_confirmation`
   - Properties without calendar integrations → Booking status: `confirmed`
3. **Email Notifications**: Automatically sends confirmation emails for immediately confirmed bookings
4. **External Sync**: Pending bookings are handled by external calendar synchronization systems

## Database Schema

### Key Tables

- `EstateProperties` - Property listings
- `Bookings` - Reservation records (Status: 0=pending, 1=confirmed, 2=cancelled, 3=completed)
- `CalendarIntegrations` - External calendar sync configurations
- `Members` - User accounts
- `PropertyMessages` - Q&A between guests and hosts

### Booking Status Flow

```
User clicks "Reserve Now"
    ↓
Check CalendarIntegrations table
    ↓
Has active integration?
├── Yes → Status: pending_confirmation (4-10 hours sync)
└── No  → Status: confirmed + Send email
```

## Development Notes

- **Email Feature Flag**: Set `VITE_SEND_EMAILS_ENABLED=false` in development to disable email sending
- **Calendar Sync**: External calendar synchronization (Airbnb, VRBO, etc.) is handled by separate systems
- **Testing**: Use mock data for development and testing without affecting production data

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

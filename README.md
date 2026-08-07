# MyHealthStatus

Secure STD test results sharing platform connecting patients, clinics, and partners with trust and transparency.

## Features

- Verified test results from partnered healthcare providers
- Secure sharing via QR codes and encrypted links
- HIPAA compliant and encrypted
- Member ID system for seamless results delivery
- Real-time statistics and insights

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Firebase (Database, Authentication & Cloud Functions)
- Lucide React Icons

## Getting Started

Install dependencies:
```bash
npm install
```

Configure environment variables in `.env`:
```env
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key
VITE_APP_URL=https://your-production-domain.com
```

**Important:** Set `VITE_APP_URL` to your production domain (e.g., `https://app.myhealthstatus.com`) to ensure share links work correctly on mobile devices with proper HTTPS protocol.

Start development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

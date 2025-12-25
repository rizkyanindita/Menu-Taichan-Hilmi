# QR Menu App

A modern QR code menu application built with Next.js 16, Tailwind CSS, and Firebase.

## Features
- **Public Menu**: Dynamic menu pages for cafes (e.g., `/menu/cafe-name`).
- **Staff Dashboard**: Real-time order management (mocked).
- **Owner Dashboard**: Menu management and insights (mocked).
- **PWA Ready**: Installable on mobile devices.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env.local` file with your Firebase config:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure
- `app/`: Next.js App Router pages and API routes.
- `components/`: Shared UI components.
- `lib/`: Utilities and Firebase config.
- `public/`: Static assets and PWA icons.

## Note on Next.js 16
This project uses Next.js 16. Ensure you `await params` in dynamic routes.

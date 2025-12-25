# Setting up Firebase for QR Menu App

Follow these steps to connect your app to a real database.

## 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** and follow the setup wizard.
3. Once created, click the **Web icon (`</>`)** to add a web app.
4. Give it a nickname (e.g., "QR Menu") and register it.

## 2. Get Configuration
You will see a `firebaseConfig` object. You need these values for your environment variables.

Create a file named `.env.local` in the root of your project and add these keys:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 3. Set up Firestore Database
1. In Firebase Console, go to **Build > Firestore Database**.
2. Click **Create Database**.
3. Select **Start in test mode** (for development purposes).
4. Choose a location close to you.

## 4. Add Data
Structure your database like this:
- **Collection**: `menus`
  - **Document ID**: `demo-cafe` (this serves as the `cafeId`)
    - **Field**: `items` (Array of objects)
      - `id`: number/string
      - `name`: string
      - `price`: number
      - `description`: string
      - `category`: string
      - `image`: string (URL)

**Example Data Structure:**
Collection: `menus` -> Doc: `demo-cafe`
Fields:
```json
{
  "name": "Demo Cafe",
  "items": [
    {
      "id": 1,
      "name": "Kopi Susu",
      "price": 15000,
      "category": "Coffee",
      "description": "Sweet iced coffee",
      "image": "..."
    }
  ]
}
```

## 5. Enable Authentication (Optional for now)
1. Go to **Build > Authentication**.
2. Click **Get Started**.
3. Enable **Email/Password** provider.

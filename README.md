# MyBills React

A mobile-first React app for tracking monthly income, expenses, and bill categories.

## What this project includes

- A month-by-month dashboard summary
- Income and expense totals with a running balance
- A form to add new transactions
- Category cards for bills like `House`, `Subscription`, and `Installments`
- Firebase Authentication with email/password sign-in
- Firestore cloud sync across devices
- A Vite setup that is easy to deploy to Vercel

## Run locally

```bash
npm install
npm run dev
```

Before running locally, copy `.env.example` to `.env` and fill in your Firebase web app credentials.

## Build for production

```bash
npm run build
```

## Deploy to Vercel

1. Push this project to your GitHub repository.
2. Import the repository into Vercel.
3. Keep the default Vite build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add the same Firebase `VITE_FIREBASE_*` variables in your Vercel project settings.
5. Deploy.

## Firebase setup

1. Create a Firebase project.
2. Add a Web App inside Firebase.
3. Copy the Firebase config values into `.env`.
4. In Firebase Authentication, enable the `Email/Password` provider.
5. Create a Firestore database.

Suggested Firestore rules for this app:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/private/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Learning notes

The main React logic lives in [src/App.jsx](./src/App.jsx). That file includes inline comments explaining:

- how `useState` stores app data
- how `useEffect` connects auth and Firestore sync
- how derived values are calculated from the transactions list
- how the form updates state and adds new items

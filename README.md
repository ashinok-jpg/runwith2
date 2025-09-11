# runwith2

## Firebase Setup

1. Copy `.env.example` to `.env` and fill in your Firebase configuration values.
   ```bash
   cp .env.example .env
   ```
2. Obtain the credentials from your Firebase project settings and update the variables.

The app uses Firebase Authentication, Firestore, and Storage. Initialization lives in `src/lib/firebase.ts`.

## Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```


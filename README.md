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

## Deploy (Firebase Hosting)

1. Create `.env` from `.env.example` with your Firebase web app config (the build fails if required values are missing).
2. Log in and pick your Firebase project (first time only):
   ```bash
   npx firebase login
   npx firebase use --add
   ```
3. Build and deploy:
   ```bash
   npm run deploy
   ```

`firebase.json` serves `dist/` as a single-page app. Make sure Firestore security rules and the Authentication sign-in providers are configured in the Firebase console, and add your Hosting domain to Authentication > Settings > Authorized domains if you use a custom domain.

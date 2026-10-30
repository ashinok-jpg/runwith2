# runwith2

Runwith is a running matching app: find group runs near you at your pace, or start one by tapping a meeting point on the map.

## Features

- **Map** (Leaflet + OpenStreetMap, no API key): sessions near you, shown with their pace and group size. Markers are colored by how well the pace fits yours.
- **Create a session on the map**: tap "New session", tap the meeting point (drag the pin to adjust), then set the time, distance, pace and group size.
- **Matching**: your profile's pace bands are compared with each session's pace. The feed ranks nearby sessions by pace match, then by start time, and has filters for your pace, today and this week.
- **Join / leave** with a group-size limit, the list of runners going, and a group chat for the runners in each session.
- **Edit a session** (host): change the time, distance, pace, group size or notes; everyone going is notified.
- **Runner profiles**: tap the host or anyone going to see their pace bands, records, bio and how their pace fits yours.
- **Share a session**: send a link (share menu or copied link) that opens the session directly.
- **Notifications** when someone joins or leaves your session, or when a session you joined is changed or cancelled.
- **Profile** with your pace bands, personal records, home area and bio.
- **Google sign-in** via Firebase Authentication.

## Install on a phone

Runwith is an installable web app (PWA); there is no App Store build.

- **iPhone / iPad:** open the site in Safari, tap the Share button, then "Add to Home Screen". The app shows this hint on the feed until it is dismissed.
- **Android:** open the site in Chrome and choose "Install app" (or "Add to Home screen") from the menu.

Links opened inside Instagram, Facebook or LINE use those apps' own browser, where Google blocks sign-in. The sign-in screen asks people to open the page in Safari or Chrome instead.

The manifest and icons live in `public/` (`manifest.webmanifest`, `apple-touch-icon.png`, `icon-*.png`).

## Firebase Setup

1. Copy `.env.example` to `.env` and fill in your Firebase web app config (Firebase console > Project settings > Your apps).
   ```bash
   cp .env.example .env
   ```
2. In the Firebase console:
   - **Authentication > Sign-in method**: enable **Google**.
   - **Firestore Database**: create a database (production mode is fine; the rules in `firestore.rules` are deployed with the app).

Data lives in Firestore:

| Path | Contents |
| --- | --- |
| `profiles/{uid}` | Display name, pace bands, personal records |
| `events/{id}` | Sessions (meeting point, geohash `areaHash`, time, pace, distance, capacity) |
| `events/{id}/attendees/{uid}` | Runners going |
| `events/{id}/messages/{id}` | Group chat (readable by attendees only) |
| `notifications/{id}` | Join / leave / cancel / update notifications (`uid` is the recipient) |

Initialization lives in `src/lib/firebase.ts`; data access is in `src/lib/sessions.ts` and `src/lib/notifications.ts`.

## Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

`npm run build` type-checks and builds the production bundle. `npm run lint` runs ESLint over the project.

## Deploy (Firebase Hosting + Firestore rules)

1. Create `.env` from `.env.example` (the build fails if required values are missing).
2. Log in and pick your Firebase project (first time only):
   ```bash
   npx firebase login
   npx firebase use --add
   ```
3. Build and deploy the site, Firestore rules and indexes:
   ```bash
   npm run deploy
   ```
   New indexes can take a few minutes to build; nearby sessions and notifications load once they're ready.

`firebase.json` serves `dist/` as a single-page app. If you use a custom domain, add it to Authentication > Settings > Authorized domains.

Map tiles come from the public OpenStreetMap servers, which are meant for light use. For heavy traffic, switch the `TileLayer` URL in `src/components/screens/Map.tsx` to a tile provider (for example MapTiler or Stadia Maps).

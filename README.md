# runwith2

Runwith is a running matching app: find group runs near you at your pace, or start one by tapping a meeting point on the map.

## Features

- **Map** (Leaflet + OpenStreetMap, no API key): sessions near you, shown with their pace and group size. Markers are colored by how well the pace fits yours.
- **Create a session on the map**: tap "New session", tap the meeting point (drag the pin to adjust), then set the time, distance, pace and group size.
- **Matching**: your profile's pace bands are compared with each session's pace. The feed ranks nearby sessions by pace match, then by start time, and has filters for your pace, today and this week.
- **Join / leave** with a group-size limit, the list of runners going, and a group chat for the runners in each session.
- **Notifications** when someone joins or leaves your session, or when a session you joined is cancelled.
- **Profile** with your pace bands, personal records, home area and bio.
- **Google sign-in** via Firebase Authentication.

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
| `notifications/{id}` | Join / leave / cancel notifications (`uid` is the recipient) |

Initialization lives in `src/lib/firebase.ts`; data access is in `src/lib/sessions.ts` and `src/lib/notifications.ts`.

## Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

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

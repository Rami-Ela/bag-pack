# Bag Pack API

All endpoints require an authenticated session (httpOnly `session` cookie set on login/signup), except `/api/cron/*` which authenticates with `CRON_SECRET`. Requests without a valid session get `401`; resources owned by another user return `404`.

## Endpoints

### Trips

#### Create a new trip
```
POST /api/trips
```

**Request body:**
```json
{
  "name": "string (required)",
  "destination": "string (optional)",
  "templateId": "string (optional, items of this trip template are copied; omitted = empty trip)",
  "startDate": "ISO 8601 date (optional)",
  "endDate": "ISO 8601 date (optional)"
}
```

**Response:** Created trip object

---

### Trip Templates

User-defined packing lists used to prefill a new trip. Items with `perDay: true` get
`quantity x trip duration in days` when copied into a trip (7 days when dates are omitted).

#### List templates
```
GET /api/templates
```

#### Create a template
```
POST /api/templates
```

#### Replace a template (name, emoji and the whole item list)
```
PUT /api/templates/[templateId]
```

**Request body (POST and PUT):**
```json
{
  "name": "string (required)",
  "emoji": "string (required, one of lib/templates/emojis.ts)",
  "items": [
    {
      "name": "string (required)",
      "categoryId": "string | null",
      "quantity": "integer >= 1 (required)",
      "perDay": "boolean (default: false)"
    }
  ]
}
```

#### Delete a template
```
DELETE /api/templates/[templateId]
```

Existing trips are not affected: their items were copied at creation.

---

### Item Templates

#### Create a new item template
```
POST /api/items
```

**Request body:**
```json
{
  "categoryId": "string (required)",
  "name": "string (required)",
  "quantity": "number (optional, default: 1)",
  "notes": "string (optional)"
}
```

**Response:** Created item template object

---

### Packing List Items

#### Add an item to a trip
```
POST /api/trips/[tripId]/items
```

**Request body:**
```json
{
  "categoryId": "string (required)",
  "name": "string (required)",
  "templateId": "string (optional)",
  "quantity": "number (optional, default: 1)",
  "notes": "string (optional)"
}
```

**Response:** Created packing list item object

#### Mark an item as packed
```
PATCH /api/trips/[tripId]/items/[itemId]/packed
```

**Request body:**
```json
{
  "packed": "boolean (required)"
}
```

**Response:** Updated item object

#### Mark an item as brought back
```
PATCH /api/trips/[tripId]/items/[itemId]/brought-back
```

**Request body:**
```json
{
  "broughtBack": "boolean (required)"
}
```

**Response:** Updated item object

---

### Notifications

#### Register this device for push notifications
```
POST /api/push-subscriptions
```

**Request body:** the browser's `PushSubscription.toJSON()`
```json
{
  "endpoint": "https URL (required)",
  "keys": { "p256dh": "string (required)", "auth": "string (required)" }
}
```

Upserts on `endpoint`: a device re-registered under another account moves to that account.

**Response:** `204`

#### Unregister this device
```
DELETE /api/push-subscriptions
```

**Request body:**
```json
{ "endpoint": "string (required)" }
```

**Response:** `204`

#### Send eve-of-departure reminders (cron)
```
GET /api/cron/trip-reminders
Authorization: Bearer $CRON_SECRET
```

Called daily by Vercel Cron (`vercel.json`, 17:00 UTC: 18:00 Paris in winter, 19:00 in summer). Notifies every device of the owner of each trip starting tomorrow (Europe/Paris calendar day). A trip records the start date it was reminded for (`reminderSentFor`), so re-running is harmless and moving the trip re-arms the reminder. Subscriptions the push service reports as gone (404/410) are deleted.

**Response:**
```json
{ "trips": 1, "sent": 2, "expired": 0, "failed": 0 }
```

---

## Setup

1. Set up your database connection in `.env.local`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/bagpack_dev"
   ```

   Trip reminders also need Web Push keys and a cron secret (set the same variables on Vercel):
   ```
   NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."  # npx web-push generate-vapid-keys
   VAPID_PRIVATE_KEY="..."
   VAPID_SUBJECT="mailto:you@example.com"  # contact sent to push services
   CRON_SECRET="..."                       # openssl rand -hex 32
   ```

2. Run migrations:
   ```bash
   npm run prisma:migrate
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. (Optional) Open Prisma Studio to view/edit data:
   ```bash
   npm run prisma:studio
   ```

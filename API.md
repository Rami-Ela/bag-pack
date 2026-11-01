# Bag Pack API

All endpoints require an authenticated session (httpOnly `session` cookie set on login/signup). Requests without a valid session get `401`; resources owned by another user return `404`.

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

## Setup

1. Set up your database connection in `.env.local`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/bagpack_dev"
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

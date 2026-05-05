# Bag Pack API

## Endpoints

### Trips

#### Create a new trip
```
POST /api/trips
```

**Request body:**
```json
{
  "userId": "string (required)",
  "name": "string (required)",
  "destination": "string (optional)",
  "startDate": "ISO 8601 date (optional)",
  "endDate": "ISO 8601 date (optional)"
}
```

**Response:** Created trip object

---

### Item Templates

#### Create a new item template
```
POST /api/items
```

**Request body:**
```json
{
  "userId": "string (required)",
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

# Invoicer API Documentation

This document describes all the HTTP API endpoints available for n8n integration.

## Authentication

All endpoints require authentication using an API key. Include the API key in the `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

You can generate an API key from the application UI.

## Base URL

```
https://your-convex-deployment.convex.cloud
```

---

## Invoice Endpoints

### 1. Create Invoice

**POST** `/api/invoices`

Create a new invoice.

**Request Body:**
```json
{
  "invoiceNumber": "INV-2025-001",
  "clientId": "client_id_here",
  "currency": "EUR",
  "total": 1250.50,
  "status": "draft",
  "timestamps": {
    "finalizedAt": 1234567890,
    "paidAt": 1234567890,
    "cancelledAt": 1234567890
  }
}
```

**Required Fields:**
- `invoiceNumber` (string): Unique invoice number
- `clientId` (string): ID of the client company
- `currency` (string): Currency code (e.g., "EUR", "USD")
- `total` (number): Total amount

**Optional Fields:**
- `status` (string): One of "draft", "finalized", "paid", "cancelled" (defaults to "draft")
- `timestamps` (object): Optional timestamps for status changes

**Response:**
```json
{
  "invoiceId": "invoice_id_here"
}
```

---

### 2. List Invoices

**GET** `/api/invoices`

Retrieve a list of invoices with optional filtering.

**Query Parameters:**
- `limit` (number, optional): Maximum number of invoices to return (default: 50)
- `clientId` (string, optional): Filter invoices by client ID

**Examples:**
```
GET /api/invoices
GET /api/invoices?limit=10
GET /api/invoices?clientId=client_123
GET /api/invoices?clientId=client_123&limit=5
```

**Response:**
```json
{
  "invoices": [
    {
      "_id": "invoice_id",
      "userId": "user_id",
      "invoiceNumber": "INV-2025-001",
      "clientId": "client_id",
      "status": "draft",
      "currency": "EUR",
      "total": 1250.50,
      "finalizedAt": null,
      "paidAt": null,
      "cancelledAt": null
    }
  ]
}
```

---

### 3. Duplicate Last Invoice

**POST** `/api/invoices/duplicate`

Creates a duplicate of the last invoice sent to a specific client. The new invoice will be created with status "draft" and can be sent for verification.

**Request Body:**
```json
{
  "clientId": "client_id_here",
  "invoiceNumber": "INV-2025-002"
}
```

**Required Fields:**
- `clientId` (string): ID of the client whose last invoice you want to duplicate

**Optional Fields:**
- `invoiceNumber` (string): Custom invoice number (auto-generated if not provided)

**Response:**
```json
{
  "invoiceId": "new_invoice_id",
  "invoiceNumber": "INV-2025-002"
}
```

**Error Response:**
```json
HTTP 400: "No previous invoice found for this client"
```

---

### 4. Change Invoice Status

**PATCH** `/api/invoices/status`

Update the status of an invoice. This endpoint automatically sets the appropriate timestamp based on the new status.

**Query Parameters:**
- `id` (string, required): The invoice ID

**Request Body:**
```json
{
  "status": "finalized"
}
```

**Required Fields:**
- `status` (string): One of "draft", "finalized", "paid", "cancelled"

**Response:**
```json
{
  "success": true
}
```

**Status Changes & Timestamps:**
- `finalized` → sets `finalizedAt` to current timestamp
- `paid` → sets `paidAt` to current timestamp
- `cancelled` → sets `cancelledAt` to current timestamp
- `draft` → no timestamp set

---

### 5. Generate Invoice PDF

**GET** `/api/invoices/pdf`

Generate and download a PDF file for a specific invoice.

**Query Parameters:**
- `id` (string, required): The invoice ID

**Response:**
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="invoice-{invoiceNumber}.pdf"`

The endpoint returns a PDF file as a binary stream. The PDF includes:
- Invoice details (number, date, status, currency)
- Sender information ("my company" marked in the system)
- Client/recipient information
- Invoice total

**Example Usage:**

```bash
curl -X GET \
  "https://your-convex-deployment.convex.cloud/api/invoices/pdf?id=invoice_123" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  --output invoice.pdf
```

**n8n Integration:**

In n8n, use the HTTP Request node with:
- **Method:** GET
- **URL:** `https://your-convex-deployment.convex.cloud/api/invoices/pdf?id={{$json["invoiceId"]}}`
- **Authentication:** Generic Credential Type → Header Auth
  - **Header Name:** Authorization
  - **Header Value:** Bearer YOUR_API_KEY
- **Response Format:** File

This allows you to:
- Download invoices programmatically
- Email invoices as attachments
- Store invoices in cloud storage (Dropbox, Google Drive, etc.)
- Archive invoices automatically

**Error Responses:**
- `400 Bad Request`: Missing invoice ID
- `401 Unauthorized`: Missing or invalid API key
- `403 Forbidden`: Invoice doesn't belong to authenticated user
- `404 Not Found`: Invoice or client not found
- `500 Internal Server Error`: PDF generation failed

---

## Client/Company Endpoints

### 6. Create Client

**POST** `/api/clients`

Create a new client company.

**Request Body:**
```json
{
  "name": "Client Company Name",
  "siret": "12345678901234",
  "email": "contact@client.com",
  "address": "123 Main St",
  "city": "Paris",
  "zip": "75001",
  "website": "https://client.com",
  "isMyCompany": false
}
```

**Required Fields:**
- `name` (string): Company name
- `siret` (string): SIRET number
- `email` (string): Contact email
- `address` (string): Street address
- `city` (string): City
- `zip` (string): Postal code
- `website` (string): Website URL

**Optional Fields:**
- `isMyCompany` (boolean): Mark as your company (invoice issuer). Only one company can be marked as "my company"

**Response:**
```json
{
  "companyId": "company_id_here"
}
```

---

### 7. List Clients

**GET** `/api/clients`

Retrieve all client companies.

**Response:**
```json
{
  "companies": [
    {
      "_id": "company_id",
      "userId": "user_id",
      "name": "Client Company Name",
      "siret": "12345678901234",
      "email": "contact@client.com",
      "address": "123 Main St",
      "city": "Paris",
      "zip": "75001",
      "website": "https://client.com",
      "isMyCompany": false
    }
  ]
}
```

---

## n8n Integration Workflow Examples

### Example 1: Automated Monthly Invoice with PDF

1. **Trigger**: Schedule (e.g., 1st of every month)
2. **Get Client**: `GET /api/clients` to list all clients
3. **For Each Client**:
   - **Duplicate Invoice**: `POST /api/invoices/duplicate` with the client ID
   - **Finalize**: `PATCH /api/invoices/status?id={invoiceId}` with `status: "finalized"`
   - **Generate PDF**: `GET /api/invoices/pdf?id={invoiceId}` to download the PDF
   - **Send to Client**: Email the PDF as an attachment to the client

### Example 2: Process Payment Confirmation

1. **Trigger**: Email received with payment confirmation
2. **Extract Invoice Number**: Parse email for invoice number
3. **Get Invoice**: `GET /api/invoices` (filter could be added client-side)
4. **Update Status**: `PATCH /api/invoices/status?id={invoiceId}` with `status: "paid"`

### Example 3: Create Invoice from CRM

1. **Trigger**: New deal closed in CRM
2. **Get or Create Client**: Check if client exists, create if needed
3. **Create Invoice**: `POST /api/invoices` with deal details
4. **Send for Review**: Email yourself for verification
5. **Finalize**: After approval, update status to "finalized"

---

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200 OK`: Successful request
- `400 Bad Request`: Invalid request (missing fields, invalid data)
- `401 Unauthorized`: Missing or invalid API key
- `404 Not Found`: Resource not found

Error responses include a message:
```
HTTP 400: "Missing required fields"
HTTP 401: "Unauthorized"
```

---

## Notes

- All monetary values should be provided as numbers (not strings)
- Invoice numbers must be unique per user
- Timestamps are in Unix milliseconds format
- The `clientId` parameter must be a valid company ID from your database


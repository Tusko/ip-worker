# IP Information API

A Cloudflare Worker that provides IP address and geolocation information using Cloudflare's network intelligence. Built with [Hono](https://hono.dev) framework.

## Features

- 🚀 Fast and serverless - runs on Cloudflare's global network
- 🌍 Geolocation data from Cloudflare's network intelligence
- 📍 Supports both IPv4 and IPv6 addresses
- 🎯 Flexible field filtering - request only the data you need
- 📚 Built-in API documentation endpoint
- 🔒 Security headers included by default
- 🌐 CORS enabled for cross-origin requests

## API Endpoints

### `GET /`

Returns IP address and geolocation information for the requesting client.

**Query Parameters:**
- `fields` (optional): Comma-separated list of fields to return. If omitted, returns default fields.

**Default Response Fields:**
- `ip` - Client IP address
- `ipv4` - IPv4 address (null if IPv6 connection)
- `ipv6` - IPv6 address (null if IPv4 connection)
- `ipVersion` - IP version (4 or 6)
- `country` - ISO 3166-1 alpha-2 country code
- `region` - Region or state

**Example:**
```bash
curl https://ip.frontend.im/
```

**Response:**
```json
{
  "ip": "203.0.113.1",
  "ipv4": "203.0.113.1",
  "ipv6": null,
  "ipVersion": 4,
  "country": "US",
  "region": "California",
  "docs_url": "https://ip.frontend.im/docs"
}
```

### `GET /?fields=ip,city,timezone`

Request specific fields only.

**Example:**
```bash
curl "https://ip.frontend.im/?fields=ip,city,timezone"
```

**Response:**
```json
{
  "ip": "203.0.113.1",
  "city": "San Francisco",
  "timezone": "America/Los_Angeles",
  "docs_url": "https://ip.frontend.im/docs"
}
```

### `GET /docs`

Returns comprehensive API documentation including all available fields, examples, and usage notes.

**Example:**
```bash
curl https://ip.frontend.im/docs
```

## Available Fields

All fields are sourced from Cloudflare's network intelligence. Field availability may vary based on the request and IP address type.

| Field | Type | Description |
|-------|------|-------------|
| `ip` | string | Client IP address from `cf-connecting-ip` header |
| `ipv4` | string \| null | IPv4 address if client connected via IPv4, null otherwise |
| `ipv6` | string \| null | IPv6 address if client connected via IPv6, null otherwise |
| `ipVersion` | number | IP protocol version (4 or 6) |
| `asn` | number | Autonomous System Number |
| `asOrganization` | string | Organization name for the ASN |
| `city` | string | City name |
| `continent` | string | Continent code (e.g., NA, EU, AS) |
| `country` | string | ISO 3166-1 alpha-2 country code (e.g., US, GB, DE) |
| `region` | string | Region, state, or province |
| `regionCode` | string | Region code |
| `timezone` | string | IANA timezone (e.g., America/New_York) |
| `postalCode` | string | Postal code or ZIP code |
| `latitude` | string | Latitude coordinate |
| `longitude` | string | Longitude coordinate |
| `metroCode` | string | Metro code (US only) |
| `colo` | string | IATA airport code of Cloudflare data center |
| `isEU` | boolean | Whether the request originated from EU |

## Examples

### Get default fields (IPv4 connection)
```bash
curl https://ip.frontend.im/
```

### Get default fields (IPv6 connection)
```bash
curl https://ip.frontend.im/
```

### Get specific fields
```bash
curl "https://ip.frontend.im/?fields=ip,city,timezone"
```

### Get all location data
```bash
curl "https://ip.frontend.im/?fields=ip,country,region,city,postalCode,latitude,longitude,timezone"
```

## Development

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Cloudflare account

### Installation

```bash
npm install
```

### Local Development

Run the development server:

```bash
npm run dev
```

This will start a local Wrangler development server where you can test the API locally.

### Generate Types

Generate/synchronize types based on your Worker configuration:

```bash
npm run cf-typegen
```

This creates the `CloudflareBindings` type interface based on your `wrangler.jsonc` configuration.

**Important:** Pass the `CloudflareBindings` as generics when instantiating `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

## Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

This will deploy with minification enabled.

### Configuration

The Worker is configured via `wrangler.jsonc`. Key settings:

- **Name:** `ip`
- **Domain:** Set via `DOMAIN` environment variable (default: `ip.frontend.im`)
- **Compatibility Date:** `2025-11-01`
- **Observability:** Enabled
- **Placement:** Smart placement mode

## Notes

- All fields are sourced from Cloudflare's network intelligence
- Geolocation accuracy may vary based on IP address type and location
- Field availability depends on what Cloudflare provides for each request
- Requested fields that are unavailable will be omitted from the response
- The API includes security headers by default (X-XSS-Protection, X-Content-Type-Options, X-Frame-Options, etc.)
- CORS is enabled for cross-origin requests

## License

This project is open source and available for use.

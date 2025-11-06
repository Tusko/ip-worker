import { Hono } from "hono";

const app = new Hono<{ Bindings: CloudflareBindings }>();

function isIPv4(ip: string): boolean {
  // IPv4 pattern: xxx.xxx.xxx.xxx
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/
  return ipv4Pattern.test(ip)
}

function processIPAddress(ip: string) {
  // Determine if IPv4 or IPv6 and return appropriate fields
  if (isIPv4(ip)) {
    return {
      ip: ip,
      ipv4: ip,
      ipv6: null,
      ipVersion: 4
    }
  } else {
    return {
      ip: ip,
      ipv4: null,
      ipv6: ip,
      ipVersion: 6
    }
  }
}

function getRequestedFields(fieldsParam: string | undefined, availableData: Record<string, any>) {
  if (!fieldsParam) {
    // Return default fields if no parameter specified
    return {
      ip: availableData.ip,
      ipv4: availableData.ipv4,
      ipv6: availableData.ipv6,
      ipVersion: availableData.ipVersion,
      country: availableData.country,
      region: availableData.region,
      asn: availableData.asn,
      asOrganization: availableData.asOrganization,
      userAgent: availableData.userAgent,
    }
  }

  // Parse requested fields (handle spaces after commas)
  const requestedFields = fieldsParam
    .split(',')
    .map((field: string) => field.trim())
    .filter((field: string) => field.length > 0)

  // Build response with only requested fields
  const result: Record<string, any> = {}
  for (const field of requestedFields) {
    if (availableData.hasOwnProperty(field)) {
      result[field] = availableData[field]
    }
  }

  return result
}

function getDocumentation() {
  return {
    title: "IP Information API Documentation",
    version: "1.0.0",
    description: "Get IP address and geolocation information from Cloudflare's network",

    endpoints: {
      "/": {
        method: "GET",
        description: "Get IP and geolocation information",
        parameters: {
          fields: {
            type: "string",
            required: false,
            description: "Comma-separated list of fields to return",
            example: "?fields=ip,country,city,timezone"
          }
        },
        defaultResponse: {
          ip: "Client IP address",
          ipv4: "IPv4 address (null if IPv6 connection)",
          ipv6: "IPv6 address (null if IPv4 connection)",
          ipVersion: "IP version (4 or 6)",
          country: "ISO 3166-1 alpha-2 country code",
          region: "Region or state",
          asn: "Autonomous System Number",
          asOrganization: "Organization name for the ASN",
          userAgent: "User agent string from request headers"
        }
      },
      "/docs": {
        method: "GET",
        description: "Get this API documentation"
      }
    },

    availableFields: {
      ip: {
        type: "string",
        description: "Client IP address from cf-connecting-ip header"
      },
      ipv4: {
        type: "string | null",
        description: "IPv4 address if client connected via IPv4, null otherwise"
      },
      ipv6: {
        type: "string | null",
        description: "IPv6 address if client connected via IPv6, null otherwise"
      },
      ipVersion: {
        type: "number",
        description: "IP protocol version (4 or 6)"
      },
      asn: {
        type: "number",
        description: "Autonomous System Number"
      },
      asOrganization: {
        type: "string",
        description: "Organization name for the ASN"
      },
      city: {
        type: "string",
        description: "City name"
      },
      continent: {
        type: "string",
        description: "Continent code (e.g., NA, EU, AS)"
      },
      country: {
        type: "string",
        description: "ISO 3166-1 alpha-2 country code (e.g., US, GB, DE)"
      },
      region: {
        type: "string",
        description: "Region, state, or province"
      },
      regionCode: {
        type: "string",
        description: "Region code"
      },
      timezone: {
        type: "string",
        description: "IANA timezone (e.g., America/New_York)"
      },
      postalCode: {
        type: "string",
        description: "Postal code or ZIP code"
      },
      latitude: {
        type: "string",
        description: "Latitude coordinate"
      },
      longitude: {
        type: "string",
        description: "Longitude coordinate"
      },
      metroCode: {
        type: "string",
        description: "Metro code (US only)"
      },
      colo: {
        type: "string",
        description: "IATA airport code of Cloudflare data center"
      },
      isEU: {
        type: "boolean",
        description: "Whether the request originated from EU"
      },
      userAgent: {
        type: "string",
        description: "User agent string from the request headers"
      }
    },

    examples: [
      {
        description: "Get default fields (IPv4 connection)",
        request: "GET /",
        response: {
          ip: "203.0.113.1",
          ipv4: "203.0.113.1",
          ipv6: null,
          ipVersion: 4,
          country: "US",
          region: "California",
          asn: 15169,
          asOrganization: "Google LLC",
          userAgent: "Mozilla/5.0..."
        }
      },
      {
        description: "Get default fields (IPv6 connection)",
        request: "GET /",
        response: {
          ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
          ipv4: null,
          ipv6: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
          ipVersion: 6,
          country: "US",
          region: "California",
          asn: 15169,
          asOrganization: "Google LLC",
          userAgent: "Mozilla/5.0..."
        }
      },
      {
        description: "Get specific fields",
        request: "GET /?fields=ip,city,timezone",
        response: {
          ip: "203.0.113.1",
          city: "San Francisco",
          timezone: "America/Los_Angeles"
        }
      },
      {
        description: "Get all location data",
        request: "GET /?fields=ip,country,region,city,postalCode,latitude,longitude,timezone",
        response: {
          ip: "203.0.113.1",
          country: "US",
          region: "California",
          city: "San Francisco",
          postalCode: "94102",
          latitude: "37.7749",
          longitude: "-122.4194",
          timezone: "America/Los_Angeles"
        }
      }
    ],

    notes: [
      "All fields are sourced from Cloudflare's network intelligence",
      "Geolocation accuracy may vary based on IP address type and location",
      "Field availability depends on what Cloudflare provides for each request",
      "Requested fields that are unavailable will be omitted from the response"
    ]
  }
}

// Handle /docs route
app.get('/docs', (c) => {
  const documentation = getDocumentation()
  c.header('X-Content-Type-Options', 'nosniff')
  return c.json(documentation)
})

// Handle root route (IP information)
app.get('/', (c) => {
  const { DOMAIN } = c.env
  const ip = c.req.header('cf-connecting-ip') || 'no IP'

  // Process IP address to determine version and separate IPv4/IPv6
  const ipData = processIPAddress(ip)

  // Get all available data from Cloudflare's request object
  const cfData = c.req.raw.cf || {}

  // Extract user agent from request headers
  const userAgent = c.req.header('user-agent') || null

  // Build complete available data object
  const availableData = {
    ...ipData,
    ...cfData,
    userAgent: userAgent,
  }

  // Get only the requested fields based on query parameter
  const fieldsParam = c.req.query('fields')
  const responseData = getRequestedFields(fieldsParam, availableData)

  // Set headers
  c.header('X-XSS-Protection', '1; mode=block')
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('Referrer-Policy', 'unsafe-url')
  c.header('Feature-Policy', 'none')
  c.header('Access-Control-Allow-Credentials', 'true')
  c.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'office')

  return c.json({
    ...responseData,
    docs_url: `https://${DOMAIN}/docs`
  })
})

// Handle OPTIONS for CORS
app.options('*', (c) => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'office'
    }
  })
})

// Handle 404 for unknown routes
app.notFound((c) => {
  return c.text('Not Found', 404)
})

// Handle errors
app.onError((err, c) => {
  console.error(err)
  return c.text('Failed to retrieve ip', 500)
})

export default app


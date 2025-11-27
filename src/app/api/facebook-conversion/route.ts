import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Facebook Conversion API Configuration
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || "626633394773155";
const FB_ACCESS_TOKEN = process.env.FB_CONVERSION_API_ACCESS_TOKEN || "";
const FB_API_VERSION = "v18.0";

// Hash function for user data (required by Facebook CAPI)
function hashData(data: string): string {
  return crypto.createHash("sha256").update(data.toLowerCase().trim()).digest("hex");
}

// Normalize and hash phone number
function normalizeAndHashPhone(phone: string): string {
  // Remove all non-numeric characters except leading +
  const normalized = phone.replace(/[^\d+]/g, "");
  // Remove leading + if present for Mexico numbers
  const cleaned = normalized.startsWith("+52") 
    ? normalized.slice(3) 
    : normalized.startsWith("52") 
      ? normalized.slice(2)
      : normalized;
  return hashData(cleaned);
}

// Normalize and hash email
function normalizeAndHashEmail(email: string): string {
  return hashData(email.toLowerCase().trim());
}

interface ConversionEventData {
  event_name: string;
  event_id: string;
  event_time?: number;
  event_source_url?: string;
  action_source: "website";
  user_data: {
    em?: string[];  // Hashed email
    ph?: string[];  // Hashed phone
    fn?: string[];  // Hashed first name
    ln?: string[];  // Hashed last name
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;   // Facebook click ID cookie
    fbp?: string;   // Facebook browser ID cookie
  };
  custom_data?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    content_type?: string;
    num_items?: number;
    order_id?: string;
  };
}

interface RequestBody {
  eventName: string;
  eventId: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  value?: number;
  currency?: string;
  contentName?: string;
  contentCategory?: string;
  contentIds?: string[];
  eventSourceUrl?: string;
  fbc?: string;
  fbp?: string;
}

export async function POST(request: NextRequest) {
  // Check if access token is configured
  if (!FB_ACCESS_TOKEN) {
    console.warn("Facebook Conversion API: Access token not configured");
    return NextResponse.json(
      { success: false, message: "Facebook Conversion API not configured" },
      { status: 200 }
    );
  }

  try {
    const body: RequestBody = await request.json();
    
    const {
      eventName,
      eventId,
      email,
      phone,
      firstName,
      lastName,
      value,
      currency = "MXN",
      contentName,
      contentCategory,
      contentIds,
      eventSourceUrl,
      fbc,
      fbp,
    } = body;

    // Get client IP and user agent
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || 
                     request.headers.get("x-real-ip") || 
                     "";
    const userAgent = request.headers.get("user-agent") || "";

    // Build user data with hashed values
    const userData: ConversionEventData["user_data"] = {
      client_ip_address: clientIp,
      client_user_agent: userAgent,
    };

    if (email) {
      userData.em = [normalizeAndHashEmail(email)];
    }
    if (phone) {
      userData.ph = [normalizeAndHashPhone(phone)];
    }
    if (firstName) {
      userData.fn = [hashData(firstName)];
    }
    if (lastName) {
      userData.ln = [hashData(lastName)];
    }
    if (fbc) {
      userData.fbc = fbc;
    }
    if (fbp) {
      userData.fbp = fbp;
    }

    // Build custom data
    const customData: ConversionEventData["custom_data"] = {};
    if (value !== undefined) {
      customData.value = value;
      customData.currency = currency;
    }
    if (contentName) {
      customData.content_name = contentName;
    }
    if (contentCategory) {
      customData.content_category = contentCategory;
    }
    if (contentIds && contentIds.length > 0) {
      customData.content_ids = contentIds;
      customData.content_type = "product";
      customData.num_items = contentIds.length;
    }

    // Build the event
    const eventData: ConversionEventData = {
      event_name: eventName,
      event_id: eventId,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: eventSourceUrl,
      action_source: "website",
      user_data: userData,
    };

    if (Object.keys(customData).length > 0) {
      eventData.custom_data = customData;
    }

    // Send to Facebook Conversion API
    const fbUrl = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PIXEL_ID}/events`;
    
    const response = await fetch(fbUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [eventData],
        access_token: FB_ACCESS_TOKEN,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Facebook Conversion API Error:", result);
      return NextResponse.json(
        { success: false, error: result },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      events_received: result.events_received,
      fbtrace_id: result.fbtrace_id,
    });
  } catch (error) {
    console.error("Facebook Conversion API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    configured: !!FB_ACCESS_TOKEN,
    pixelId: FB_PIXEL_ID,
  });
}


// Geolocation service using ipinfo.io
// Cache for IP lookups to avoid repeated API calls
const locationCache = new Map<string, LocationData>();

export interface LocationData {
  ip: string;
  city: string;
  region: string;
  country: string;
  postal: string;
  timezone: string;
  org: string;
}

// Get location from IP using ipinfo.io
export async function getLocationFromIP(ip: string): Promise<LocationData | null> {
  // Check cache first
  if (locationCache.has(ip)) {
    return locationCache.get(ip)!;
  }

  // Skip private/local IPs
  if (isPrivateIP(ip)) {
    return null;
  }

  try {
    // Using ipinfo.io free tier (50k requests/month)
    const response = await fetch(`https://ipinfo.io/${ip}/json`);
    
    if (!response.ok) {
      console.error('Failed to fetch location:', response.status);
      return null;
    }

    const data = await response.json();
    
    const locationData: LocationData = {
      ip: data.ip || ip,
      city: data.city || 'Desconocido',
      region: data.region || '',
      country: data.country || '',
      postal: data.postal || '',
      timezone: data.timezone || '',
      org: data.org || '',
    };

    // Cache the result
    locationCache.set(ip, locationData);

    return locationData;
  } catch (error) {
    console.error('Error fetching location:', error);
    return null;
  }
}

// Batch get locations for multiple IPs
export async function getLocationsForIPs(ips: string[]): Promise<Map<string, LocationData>> {
  const results = new Map<string, LocationData>();
  
  // Filter out already cached and private IPs
  const ipsToFetch = ips.filter(ip => !locationCache.has(ip) && !isPrivateIP(ip));
  
  // Add cached results first
  ips.forEach(ip => {
    if (locationCache.has(ip)) {
      results.set(ip, locationCache.get(ip)!);
    }
  });

  // Fetch remaining IPs (with rate limiting)
  for (const ip of ipsToFetch) {
    const location = await getLocationFromIP(ip);
    if (location) {
      results.set(ip, location);
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  return results;
}

// Format location for display
export function formatLocation(location: LocationData | null): string {
  if (!location) return 'Desconocido';
  
  const parts: string[] = [];
  if (location.city && location.city !== 'Desconocido') {
    parts.push(location.city);
  }
  if (location.region) {
    parts.push(location.region);
  }
  
  return parts.length > 0 ? parts.join(', ') : 'Desconocido';
}

// Format location with postal code
export function formatLocationFull(location: LocationData | null): string {
  if (!location) return 'Desconocido';
  
  const parts: string[] = [];
  if (location.city && location.city !== 'Desconocido') {
    parts.push(location.city);
  }
  if (location.region) {
    parts.push(location.region);
  }
  if (location.postal) {
    parts.push(`CP ${location.postal}`);
  }
  if (location.country) {
    parts.push(location.country);
  }
  
  return parts.length > 0 ? parts.join(', ') : 'Desconocido';
}

// Check if IP is private/local
function isPrivateIP(ip: string): boolean {
  if (!ip) return true;
  
  // Common private IP ranges
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^localhost$/i,
    /^::1$/,
    /^fe80:/i,
  ];

  return privateRanges.some(range => range.test(ip));
}

// Get country flag emoji from country code
export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  
  const offset = 127397;
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => char.charCodeAt(0) + offset);
  
  return String.fromCodePoint(...codePoints);
}




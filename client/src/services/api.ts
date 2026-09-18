import { Property, Review, Inquiry, Visit, User, UserPreferences, FilterState } from '../types';

const getApiBase = (): string => {
  const raw = import.meta.env.VITE_API_URL || '/api';
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed || trimmed === '/api') {
    return '/api';
  }
  if (trimmed.endsWith('/api')) {
    return trimmed;
  }
  return `${trimmed}/api`;
};

const API_BASE = getApiBase();

const getHeaders = () => {
  const token = localStorage.getItem('staywise_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse<T>(response: Response): Promise<T> {
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || 'An unexpected error occurred.');
  }
  return json.data;
}

export const api = {
  // Auth
  register: async (payload: any) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  login: async (payload: any) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse<{ user: User }>(res);
  },

  updatePreferences: async (preferences: UserPreferences) => {
    const res = await fetch(`${API_BASE}/auth/preferences`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(preferences),
    });
    return handleResponse<{ preferences: UserPreferences }>(res);
  },

  updateProfile: async (payload: { name?: string; phone?: string }) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ user: User }>(res);
  },

  // Properties
  getProperties: async (filters?: Partial<FilterState> & { owner?: string }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== '' && val !== 'all' && val !== false) {
          params.append(key, String(val));
        }
      });
    }

    const res = await fetch(`${API_BASE}/properties?${params.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ properties: Property[]; pagination: any }>(res);
  },

  getPropertyById: async (idOrSlug: string) => {
    const res = await fetch(`${API_BASE}/properties/${idOrSlug}`);
    return handleResponse<{ property: Property }>(res);
  },

  createProperty: async (data: any) => {
    const res = await fetch(`${API_BASE}/properties`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ property: Property }>(res);
  },

  updateProperty: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ property: Property }>(res);
  },

  deleteProperty: async (id: string) => {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<Record<string, never>>(res);
  },

  // Rooms
  createRoom: async (propertyId: string, roomData: any) => {
    const res = await fetch(`${API_BASE}/properties/${propertyId}/rooms`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(roomData),
    });
    return handleResponse<{ room: any }>(res);
  },

  updateRoom: async (roomId: string, roomData: any) => {
    const res = await fetch(`${API_BASE}/rooms/${roomId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(roomData),
    });
    return handleResponse<{ room: any }>(res);
  },

  deleteRoom: async (roomId: string) => {
    const res = await fetch(`${API_BASE}/rooms/${roomId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<Record<string, never>>(res);
  },

  // Favorites
  getFavorites: async () => {
    const res = await fetch(`${API_BASE}/favorites`, {
      headers: getHeaders(),
    });
    return handleResponse<{ favorites: Property[] }>(res);
  },

  toggleFavorite: async (propertyId: string) => {
    const res = await fetch(`${API_BASE}/favorites/${propertyId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<{ isSaved: boolean; propertyId: string }>(res);
  },

  // Reviews
  getReviews: async (propertyId: string) => {
    const res = await fetch(`${API_BASE}/properties/${propertyId}/reviews`);
    return handleResponse<{ reviews: Review[] }>(res);
  },

  addReview: async (propertyId: string, reviewData: any) => {
    const res = await fetch(`${API_BASE}/properties/${propertyId}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reviewData),
    });
    return handleResponse<{ review: Review }>(res);
  },

  // Inquiries
  createInquiry: async (payload: { propertyId: string; message: string; phone?: string; email?: string }) => {
    const res = await fetch(`${API_BASE}/inquiries`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ inquiry: Inquiry }>(res);
  },

  getInquiries: async () => {
    const res = await fetch(`${API_BASE}/inquiries`, {
      headers: getHeaders(),
    });
    return handleResponse<{ inquiries: Inquiry[] }>(res);
  },

  updateInquiryStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_BASE}/inquiries/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<{ inquiry: Inquiry }>(res);
  },

  // Visits
  scheduleVisit: async (payload: { propertyId: string; date: string; time: string; notes?: string }) => {
    const res = await fetch(`${API_BASE}/visits`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ visit: Visit }>(res);
  },

  getVisits: async () => {
    const res = await fetch(`${API_BASE}/visits`, {
      headers: getHeaders(),
    });
    return handleResponse<{ visits: Visit[] }>(res);
  },

  updateVisitStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_BASE}/visits/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<{ visit: Visit }>(res);
  },

  // Owner Stats
  getOwnerStats: async () => {
    const res = await fetch(`${API_BASE}/owner/stats`, {
      headers: getHeaders(),
    });
    return handleResponse<{
      totalProperties: number;
      totalRooms: number;
      occupiedRooms: number;
      availableRooms: number;
      occupancyRate: number;
      newInquiries: number;
      pendingVisits: number;
      propertiesList: Property[];
    }>(res);
  },

  // Admin monitoring
  getMonitoringStatus: async () => {
    const res = await fetch(`${API_BASE}/monitoring/status`, {
      headers: getHeaders(),
    });
    return handleResponse<{
      configured: boolean;
      database: 'connected' | 'unavailable';
      status: 'UP' | 'DOWN' | 'DEGRADED';
      responseTime: number | null;
      httpStatus: number | null;
      lastCheckedAt: string | null;
      uptimePercentage: number | null;
      averageResponseTime: number | null;
      recentChecks: Array<{
        _id: string;
        timestamp: string;
        status: 'UP' | 'DOWN' | 'DEGRADED';
        responseTime: number | null;
        httpStatus: number | null;
      }>;
      recentIncidents: Array<{
        _id: string;
        incidentStartedAt: string;
        recoveredAt?: string;
        duration?: number;
        reason?: string;
      }>;
    }>(res);
  },

  getMonitoringHistory: async (limit = 50) => {
    const res = await fetch(`${API_BASE}/monitoring/history?limit=${limit}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ checks: Array<Record<string, unknown>> }>(res);
  },
};

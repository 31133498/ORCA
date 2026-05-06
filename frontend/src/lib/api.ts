import type {
  Health,
  Heatmap,
  LiveStats,
  MentionDetail,
  MentionList,
  PriorityRow,
  QueueList,
} from './types';

const BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} — ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => req<Health>('/api/health'),
  liveStats: () => req<LiveStats>('/api/stats/live'),

  mentions: (params: {
    category?: string;
    pathway?: string;
    risk_level?: string;
    search?: string;
    hours?: number;
    limit?: number;
    offset?: number;
  } = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
    });
    const qs = q.toString();
    return req<MentionList>(`/api/mentions${qs ? '?' + qs : ''}`);
  },

  mention: (id: number) => req<MentionDetail>(`/api/mentions/${id}`),

  draftReply: (id: number) =>
    req<{ ai_reply: string }>(`/api/mentions/${id}/reply/draft`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  postReply: (id: number, body: string) =>
    req<{ ok: boolean; posted_at: string; simulated: boolean }>(
      `/api/mentions/${id}/reply/post`,
      { method: 'POST', body: JSON.stringify({ body }) }
    ),

  scrape: (handle?: string, max_items = 25) =>
    req<{ scraped: number; inserted: number; classified: number; live: boolean }>(
      `/api/mentions/scrape`,
      { method: 'POST', body: JSON.stringify({ handle, max_items }) }
    ),

  queue: () => req<QueueList>('/api/queue'),

  queueAction: (
    escalationId: number,
    body: { action: 'accept' | 'resolve' | 'dismiss'; agent?: string; notes?: string; final_reply?: string }
  ) =>
    req<{ ok: boolean; status: string }>(`/api/queue/${escalationId}/action`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  priorityMatrix: (days = 7) =>
    req<{ rows: PriorityRow[]; window_days: number }>(`/api/intelligence/priority-matrix?days=${days}`),

  heatmap: () => req<Heatmap>('/api/intelligence/heatmap'),
};

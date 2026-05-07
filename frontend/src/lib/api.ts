import type {
  ChatApiResponse,
  Health,
  Heatmap,
  LiveStats,
  MentionDetail,
  MentionList,
  PriorityRow,
  QueueList,
} from './types';
import {
  MOCK_HEALTH,
  MOCK_HEATMAP,
  MOCK_LIVE_STATS,
  MOCK_MENTION_DETAIL,
  MOCK_MENTION_LIST,
  MOCK_PRIORITY_ROWS,
  MOCK_QUEUE_LIST,
} from './mock';

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

async function tryReq<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  try {
    return await req<T>(path, init);
  } catch {
    return fallback;
  }
}

export const api = {
  health: () => tryReq<Health>('/api/health', MOCK_HEALTH),
  liveStats: () => tryReq<LiveStats>('/api/stats/live', MOCK_LIVE_STATS),

  mentions: (params: {
    category?: string;
    pathway?: string;
    risk_level?: string;
    platform?: string;
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
    return tryReq<MentionList>(`/api/mentions${qs ? '?' + qs : ''}`, MOCK_MENTION_LIST);
  },

  mention: (id: number) =>
    tryReq<MentionDetail>(`/api/mentions/${id}`, MOCK_MENTION_DETAIL),

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

  generatePosts: (platform: string, count = 3) =>
    req<{ inserted: number; classified: number; platform: string }>(
      `/api/mentions/generate?platform=${platform}&count=${count}`,
      { method: 'POST' }
    ),

  queue: () => tryReq<QueueList>('/api/queue', MOCK_QUEUE_LIST),

  queueAction: (
    escalationId: number,
    body: { action: 'accept' | 'resolve' | 'dismiss'; agent?: string; notes?: string; final_reply?: string }
  ) =>
    req<{ ok: boolean; status: string }>(`/api/queue/${escalationId}/action`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  priorityMatrix: (days = 7) =>
    tryReq<{ rows: PriorityRow[]; window_days: number }>(
      `/api/intelligence/priority-matrix?days=${days}`,
      { rows: MOCK_PRIORITY_ROWS, window_days: days }
    ),

  heatmap: () => tryReq<Heatmap>('/api/intelligence/heatmap', MOCK_HEATMAP),

  chat: async (
    message?: string,
    audioBlob?: Blob,
    history: Array<{ role: string; content: string }> = []
  ): Promise<ChatApiResponse> => {
    const form = new FormData();
    if (message) form.append('message', message);
    form.append('history', JSON.stringify(history));
    if (audioBlob) form.append('audio', audioBlob, 'recording.webm');

    const res = await fetch(`${BASE}/chat/`, {
      method: 'POST',
      body: form,
      cache: 'no-store',
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`${res.status} ${res.statusText} — ${text}`);
    }
    return res.json() as Promise<ChatApiResponse>;
  },

  tts: async (text: string, language = 'en'): Promise<Blob | null> => {
    try {
      const res = await fetch(`${BASE}/chat/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const blob = await res.blob();
      return blob.size > 0 ? blob : null;
    } catch {
      return null;
    }
  },
};

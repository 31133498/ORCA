export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Pathway = 'AUTO_REPLY' | 'AGENT_PING' | 'ESCALATE_FLAG';
export type Sentiment = 'negative' | 'neutral' | 'positive';
export type EscalationStatus = 'QUEUED' | 'ACCEPTED' | 'RESOLVED' | 'DISMISSED';

export interface Customer {
  id: number;
  handle: string;
  display_name: string;
  msisdn: string;
  region: string;
  tenure_months: number;
  arpu_naira: number;
  verified: boolean;
  followers: number;
}

export interface Classification {
  category: string;
  urgency: number;
  pathway: Pathway;
  sentiment: Sentiment;
  language: string;
  confidence: number;
  churn_risk: number;
  risk_level: RiskLevel;
  risk_factors: string[];
  ai_summary: string;
  ai_reply: string;
  suggested_offer: string;
}

export interface EscalationMeta {
  id: number;
  status: EscalationStatus;
  assigned_to: string;
  queued_at: string;
  accepted_at: string | null;
  resolved_at: string | null;
  notes: string;
  final_reply: string;
}

export type Platform = 'x' | 'facebook' | 'instagram' | 'reddit';

export interface Mention {
  id: number;
  tweet_id: string;
  text: string;
  posted_at: string;
  likes: number;
  retweets: number;
  replies: number;
  url: string;
  platform?: Platform;
  customer: Customer | null;
  classification: Classification | null;
  escalation: EscalationMeta | null;
}

export interface MentionDetail extends Mention {
  customer_history: Array<{
    id: number;
    text: string;
    posted_at: string;
    category: string | null;
    risk_level: RiskLevel | null;
  }>;
}

export interface MentionList {
  items: Mention[];
  total: number;
}

export interface QueueItem {
  escalation_id: number;
  queued_at: string;
  status: EscalationStatus;
  assigned_to: string;
  mention: Mention;
}

export interface QueueList {
  items: QueueItem[];
  total: number;
}

export interface PriorityRow {
  category: string;
  volume: number;
  avg_urgency: number;
  sentiment_trend: number;
  resolution_rate: number;
  score: number;
  recommended_action: string;
  owner_team: string;
}

export interface HeatmapCell {
  region: string;
  arpu_band: string;
  customers: number;
  avg_risk: number;
  critical_count: number;
}

export interface Heatmap {
  cells: HeatmapCell[];
  regions: string[];
  bands: string[];
}

export interface LiveStats {
  total_mentions_24h: number;
  auto_resolved_24h: number;
  escalated_24h: number;
  avg_response_seconds: number;
  auto_resolve_rate: number;
  by_category: Array<{ category: string; count: number }>;
  by_pathway: Array<{ pathway: Pathway; count: number }>;
  by_platform: Array<{ platform: Platform; count: number }>;
  timeseries: Array<{ hour: string; count: number }>;
  top_risk: Array<{
    handle: string;
    display_name: string;
    region: string;
    arpu_naira: number;
    risk: number;
  }>;
}

export interface Health {
  ok: boolean;
  operator: string;
  operator_handle: string;
  apify_configured: boolean;
  anthropic_configured: boolean;
}

export interface ChatMeta {
  classification: string;
  churn_score: number;
  summary: string;
  detected_language: string;
  action_taken?: string | null;
}

export interface ChatApiResponse {
  reply: string;
  classification: string;
  churn_score: number;
  summary: string;
  detected_language: string;
  action_taken?: string | null;
}

export interface VoiceMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  audioBlob?: Blob;
  ttsBlob?: Blob;
  meta?: ChatMeta;
  timestamp: Date;
}

import {
  ChatResponse,
  CollectionStats,
  HealthStatus,
  ModelStatus,
  PaginatedProperties,
  SourcesResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = {
  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  },

  async getStats(): Promise<CollectionStats> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error(`Stats fetch failed: ${res.statusText}`);
    return res.json();
  },

  async getProperties(params: {
    source?: string;
    location?: string;
    property_type?: string;
    q?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedProperties> {
    const searchParams = new URLSearchParams();
    if (params.source && params.source !== 'all') searchParams.set('source', params.source);
    if (params.location && params.location !== 'all') searchParams.set('location', params.location);
    if (params.property_type && params.property_type !== 'all') searchParams.set('property_type', params.property_type);
    if (params.q) searchParams.set('q', params.q);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.page_size) searchParams.set('page_size', params.page_size.toString());

    const res = await fetch(`${API_BASE}/properties?${searchParams.toString()}`);
    if (!res.ok) throw new Error(`Properties fetch failed: ${res.statusText}`);
    return res.json();
  },

  async getSources(): Promise<SourcesResponse> {
    const res = await fetch(`${API_BASE}/sources`);
    if (!res.ok) throw new Error(`Sources fetch failed: ${res.statusText}`);
    return res.json();
  },

  async getModelStatus(): Promise<ModelStatus> {
    const res = await fetch(`${API_BASE}/model-status`);
    if (!res.ok) throw new Error(`Model status failed: ${res.statusText}`);
    return res.json();
  },

  async sendChatMessage(
    question: string,
    sourceFilter: string = 'all',
    history?: { role: string; content: string }[]
  ): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        source_filter: sourceFilter,
        conversation_history: history,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Chat request failed: ${res.statusText}`);
    }
    return res.json();
  },
};

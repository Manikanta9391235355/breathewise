export interface PropertyItem {
  id: string;
  name: string;
  project_code?: string;
  source: 'DarGlobal' | 'Wasalt';
  property_type: string;
  country: string;
  city: string;
  location: string;
  developer: string;
  description: string;
  amenities: string[];
  specifications: Record<string, any>;
  price: string;
  currency: string;
  source_url: string;
  scraped_at: string;
}

export interface PaginatedProperties {
  items: PropertyItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Citation {
  source: string;
  title: string;
  location: string;
  price: string;
  url: string;
  snippet: string;
  similarity_score: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: string;
  chunksUsed?: number;
  model?: string;
  isStreaming?: boolean;
  error?: string;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  model: string;
  chunks_used: number;
  status: string;
  source_filter: string;
  error?: string | null;
}

export interface CollectionStats {
  total_properties: number;
  darglobal_count: number;
  wasalt_count: number;
  total_chunks: number;
  last_updated: string;
  faiss_ready: boolean;
  available_countries: string[];
  available_property_types: string[];
}

export interface SourceDetail {
  name: string;
  domain: string;
  status: string;
  indexed_items: number;
  attempted_urls: number;
  failed_urls: number;
  last_collection: string;
  description: string;
  features: string[];
}

export interface SourcesResponse {
  sources: SourceDetail[];
  collection_report: Record<string, any>;
}

export interface ModelStatus {
  model_name: string;
  base_url: string;
  is_configured: boolean;
  status: string;
  free_tier_verified: boolean;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  index_ready: boolean;
  total_chunks: number;
  model_configured: boolean;
  app_version: string;
}

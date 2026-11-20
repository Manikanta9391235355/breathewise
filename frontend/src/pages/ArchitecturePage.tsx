import React from 'react';
import {
  Layers,
  Cpu,
  Database,
  Globe,
  Terminal,
  ShieldCheck,
  Zap,
  Box,
  FileCode,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  return (
    <div className="space-y-14 py-6">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/30 text-xs font-semibold text-[#DFCAAB] uppercase tracking-wider mb-3">
          <Layers className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>System Architecture & Engineering Design</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
          EstateIQ AI Architecture & Technical Design
        </h1>
        <p className="text-sm text-[#8A99AD] max-w-3xl leading-relaxed">
          Technical assignment documentation for the <strong>Junior AI Engineer – Applied AI</strong> role
          at <strong>DarGlobal</strong>. This document outlines the end-to-end architecture, data ingestion,
          vector indexing, free LLM integration, Docker containerization, and evaluation methodology.
        </p>
      </div>

      {/* Visual System Architecture Flowchart */}
      <section className="rounded-3xl bg-[#0F1A30] border border-[#223354] p-6 sm:p-8 shadow-2xl space-y-6">
        <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#C5A880]" />
          <span>End-to-End System Pipeline Flow</span>
        </h2>

        {/* Pipeline Steps Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-[#080E1E] border border-[#223354] flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#C5A880] uppercase tracking-wider">Step 1</span>
              <h4 className="text-xs font-bold text-white">Ethical Scraping</h4>
              <p className="text-[11px] text-[#8A99AD] leading-relaxed">
                robots.txt validation & Next.js structured state extraction from darglobal.co.uk & wasalt.sa.
              </p>
            </div>
            <div className="mt-3 text-[10px] text-[#DFCAAB] font-mono bg-[#152238] p-1.5 rounded">
              175 Properties
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-[#080E1E] border border-[#223354] flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#C5A880] uppercase tracking-wider">Step 2</span>
              <h4 className="text-xs font-bold text-white">Normalization</h4>
              <p className="text-[11px] text-[#8A99AD] leading-relaxed">
                Text cleaning, PII scrubbing (privacy compliance), and 500-800 token chunking with overlap.
              </p>
            </div>
            <div className="mt-3 text-[10px] text-[#DFCAAB] font-mono bg-[#152238] p-1.5 rounded">
              JSON Schemas
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-[#080E1E] border border-[#223354] flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#C5A880] uppercase tracking-wider">Step 3</span>
              <h4 className="text-xs font-bold text-white">Dense Embeddings</h4>
              <p className="text-[11px] text-[#8A99AD] leading-relaxed">
                SentenceTransformers (all-MiniLM-L6-v2) generates 384-dimensional normalized vectors.
              </p>
            </div>
            <div className="mt-3 text-[10px] text-[#DFCAAB] font-mono bg-[#152238] p-1.5 rounded">
              384-d Vectors
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-[#080E1E] border border-[#223354] flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#C5A880] uppercase tracking-wider">Step 4</span>
              <h4 className="text-xs font-bold text-white">FAISS Indexing</h4>
              <p className="text-[11px] text-[#8A99AD] leading-relaxed">
                Persistent FAISS IndexFlatIP index with metadata preservation and source filtering.
              </p>
            </div>
            <div className="mt-3 text-[10px] text-[#DFCAAB] font-mono bg-[#152238] p-1.5 rounded">
              Cosine Similarity
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-2xl bg-[#080E1E] border border-[#223354] flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#C5A880] uppercase tracking-wider">Step 5</span>
              <h4 className="text-xs font-bold text-white">OpenRouter Inference</h4>
              <p className="text-[11px] text-[#8A99AD] leading-relaxed">
                Strictly grounded answer generation using Ernie 5.5 Flash Free with clickable citations.
              </p>
            </div>
            <div className="mt-3 text-[10px] text-emerald-400 font-mono bg-[#152238] p-1.5 rounded">
              Zero-Cost LLM
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Specifications */}
      <section className="space-y-6">
        <h2 className="text-2xl font-serif font-bold text-white">
          Technology Stack Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Frontend */}
          <div className="rounded-2xl bg-[#0F1A30] border border-[#223354] p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#DFCAAB]">
              <Globe className="w-5 h-5 text-[#C5A880]" />
              <h3 className="font-semibold text-sm text-white">Frontend Architecture</h3>
            </div>
            <ul className="space-y-2 text-xs text-[#8A99AD]">
              <li>• <strong>React 18 & TypeScript</strong>: Strictly typed UI components and API contracts</li>
              <li>• <strong>Vite 6</strong>: Fast development runtime and optimized production bundling</li>
              <li>• <strong>Tailwind CSS 3</strong>: Bespoke luxury dark SaaS design system (Obsidian & Gold)</li>
              <li>• <strong>Lucide React</strong>: Modern icon language</li>
              <li>• <strong>Framer Motion</strong>: Restrained animations</li>
            </ul>
          </div>

          {/* Backend */}
          <div className="rounded-2xl bg-[#0F1A30] border border-[#223354] p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#DFCAAB]">
              <Terminal className="w-5 h-5 text-[#C5A880]" />
              <h3 className="font-semibold text-sm text-white">Backend Framework</h3>
            </div>
            <ul className="space-y-2 text-xs text-[#8A99AD]">
              <li>• <strong>Python 3.11 & FastAPI</strong>: High-throughput asynchronous REST server</li>
              <li>• <strong>Uvicorn</strong>: Asynchronous ASGI web server</li>
              <li>• <strong>Pydantic v2</strong>: Strict schema validation and serialization</li>
              <li>• <strong>HTTPX</strong>: Asynchronous HTTP client with connection pooling</li>
              <li>• <strong>Pytest</strong>: Automated test suite (12 tests, 100% passing)</li>
            </ul>
          </div>

          {/* AI & RAG */}
          <div className="rounded-2xl bg-[#0F1A30] border border-[#223354] p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#DFCAAB]">
              <Cpu className="w-5 h-5 text-[#C5A880]" />
              <h3 className="font-semibold text-sm text-white">AI & Vector Retrieval</h3>
            </div>
            <ul className="space-y-2 text-xs text-[#8A99AD]">
              <li>• <strong>FAISS (faiss-cpu)</strong>: Flat Inner Product index for exact cosine similarity</li>
              <li>• <strong>Sentence Transformers</strong>: all-MiniLM-L6-v2 (384-d normalized embeddings)</li>
              <li>• <strong>OpenRouter API</strong>: baidu/ernie-5.5-flash-preview:free with zero token pricing</li>
              <li>• <strong>Grounding Rules</strong>: Anti-hallucination prompt preventing invented prices or amenities</li>
              <li>• <strong>Citations</strong>: Direct URL attribution back to original webpages</li>
            </ul>
          </div>

          {/* Web Scraping */}
          <div className="rounded-2xl bg-[#0F1A30] border border-[#223354] p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#DFCAAB]">
              <Database className="w-5 h-5 text-[#C5A880]" />
              <h3 className="font-semibold text-sm text-white">Web Scraping Engineering</h3>
            </div>
            <ul className="space-y-2 text-xs text-[#8A99AD]">
              <li>• <strong>robots.txt Compliance</strong>: Checked before crawling; respects AI crawler policies</li>
              <li>• <strong>Next.js State Extraction</strong>: Lawful parsing of server-rendered JSON (__NEXT_DATA__)</li>
              <li>• <strong>Rate Limiting</strong>: Polite 0.3s - 0.5s pause between requests to prevent server strain</li>
              <li>• <strong>Privacy First</strong>: Scrubbed all broker phone numbers, owner names, and lead forms</li>
              <li>• <strong>Dual Sources</strong>: 49 DarGlobal projects & 126 Wasalt Saudi listings</li>
            </ul>
          </div>

          {/* DevOps & Docker */}
          <div className="rounded-2xl bg-[#0F1A30] border border-[#223354] p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#DFCAAB]">
              <Box className="w-5 h-5 text-[#C5A880]" />
              <h3 className="font-semibold text-sm text-white">Docker & DevOps</h3>
            </div>
            <ul className="space-y-2 text-xs text-[#8A99AD]">
              <li>• <strong>Multi-Stage Dockerfile</strong>: Node stage compiles React; Python 3.11 serves API</li>
              <li>• <strong>Self-Contained</strong>: Static SPA assets served directly by FastAPI on port 8000</li>
              <li>• <strong>Pre-Packaged Knowledge</strong>: Mounts persistent FAISS index; starts instantly</li>
              <li>• <strong>Configurable Port</strong>: Supports custom PORT env variable, binds 0.0.0.0</li>
              <li>• <strong>Docker Compose</strong>: Ready for one-command local orchestration</li>
            </ul>
          </div>

          {/* Security */}
          <div className="rounded-2xl bg-[#0F1A30] border border-[#223354] p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#DFCAAB]">
              <ShieldCheck className="w-5 h-5 text-[#C5A880]" />
              <h3 className="font-semibold text-sm text-white">Security & Integrity</h3>
            </div>
            <ul className="space-y-2 text-xs text-[#8A99AD]">
              <li>• <strong>No Hardcoded Secrets</strong>: API keys loaded via .env, excluded from Git</li>
              <li>• <strong>Backend Secret Isolation</strong>: OpenRouter API key never exposed to frontend</li>
              <li>• <strong>Untrusted Scraped Content</strong>: Injected prompts inside crawled HTML are neutralized</li>
              <li>• <strong>CORS Protection</strong>: Strict CORS middleware with configurable allowed origins</li>
              <li>• <strong>Input Validation</strong>: Pydantic models validate all request lengths and types</li>
            </ul>
          </div>
        </div>
      </section>

      {/* RAG Mechanics Deep Dive */}
      <section className="rounded-3xl bg-[#0F1A30] border border-[#223354] p-8 space-y-6">
        <h2 className="text-xl font-serif font-bold text-white">
          RAG Mechanics: From User Query to Grounded Answer
        </h2>

        <div className="space-y-4 text-xs text-[#8A99AD] leading-relaxed">
          <p>
            Traditional search models or naive LLMs hallucinate prices, fake property availability,
            or invent non-existent amenities. EstateIQ AI eliminates this via a four-tier grounding pipeline:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#080E1E] border border-[#223354] space-y-1.5">
              <span className="text-xs font-bold text-[#C5A880]">1. Dense Vector Encoding</span>
              <p>
                When a user submits a query (e.g. <em>"What luxury developments does DarGlobal have in Oman?"</em>),
                the query is normalized and encoded into a 384-dimensional unit vector using <code>all-MiniLM-L6-v2</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#080E1E] border border-[#223354] space-y-1.5">
              <span className="text-xs font-bold text-[#C5A880]">2. FAISS Similarity Retrieval</span>
              <p>
                The query vector is evaluated against the 175 indexed chunks in the FAISS index using Inner Product
                (exact Cosine Similarity). If the user selected a source filter (e.g. DarGlobal), matching vectors
                are prioritized.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#080E1E] border border-[#223354] space-y-1.5">
              <span className="text-xs font-bold text-[#C5A880]">3. Relevance Threshold Filtering</span>
              <p>
                Chunks with similarity score below 0.25 are discarded. If no chunks meet the threshold, the system
                returns an honest insufficient-evidence response without wasting LLM tokens.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#080E1E] border border-[#223354] space-y-1.5">
              <span className="text-xs font-bold text-[#C5A880]">4. Evidence-Bounded Prompting</span>
              <p>
                Only the top 4-5 relevant excerpts are passed to OpenRouter inside <code>&lt;context_excerpts&gt;</code>.
                The system prompt strictly forbids extrapolation. Citations with direct canonical URLs are constructed
                deterministically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Assignment Objectives Checklist */}
      <section className="rounded-3xl bg-gradient-to-br from-[#0F1A30] to-[#152238] border border-[#C5A880]/30 p-8 space-y-6">
        <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#C5A880]" />
          <span>DarGlobal Assignment Requirements Fulfillment</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {[
            'Scrapes publicly accessible data from darglobal.co.uk',
            'Scrapes publicly accessible data from wasalt.sa/en',
            'Cleans, processes, and stores actual collected records',
            'Retrieval-Augmented Generation (RAG) with FAISS',
            'Sentence Transformers (all-MiniLM-L6-v2) embedding model',
            'OpenRouter integration with free tier LLM',
            'Source citations with direct clickable links',
            'Property Explorer using genuine collected data',
            'React, Vite, TypeScript, Tailwind CSS, Lucide icons',
            'FastAPI backend with Pydantic validation & health check',
            '100% Passing automated test suite (Pytest)',
            'Multi-stage Dockerfile and Docker Compose readiness',
          ].map((req, i) => (
            <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#080E1E] border border-[#223354]">
              <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0" />
              <span className="text-white font-medium">{req}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

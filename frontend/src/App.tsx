import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OverviewPage } from './pages/OverviewPage';
import { ChatPage } from './pages/ChatPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { SourcesPage } from './pages/SourcesPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import {
  CollectionStats,
  HealthStatus,
  ModelStatus,
  PropertyItem,
  SourcesResponse,
} from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [sourcesData, setSourcesData] = useState<SourcesResponse | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [featuredProperties, setFeaturedProperties] = useState<PropertyItem[]>([]);
  const [initialPrompt, setInitialPrompt] = useState<string>('');

  useEffect(() => {
    const loadAppData = async () => {
      try {
        const [healthRes, statsRes, sourcesRes, modelRes, propRes] = await Promise.allSettled([
          api.getHealth(),
          api.getStats(),
          api.getSources(),
          api.getModelStatus(),
          api.getProperties({ page_size: 6 }),
        ]);

        if (healthRes.status === 'fulfilled') setHealth(healthRes.value);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value);
        if (sourcesRes.status === 'fulfilled') setSourcesData(sourcesRes.value);
        if (modelRes.status === 'fulfilled') setModelStatus(modelRes.value);
        if (propRes.status === 'fulfilled') setFeaturedProperties(propRes.value.items);
      } catch (err) {
        console.error('Failed to load initial application data:', err);
      }
    };

    loadAppData();
  }, []);

  const handleStartChatWithPrompt = (prompt?: string) => {
    if (prompt) {
      setInitialPrompt(prompt);
    }
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080E1E] text-[#F9F8F6]">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        modelStatus={modelStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <OverviewPage
            stats={stats}
            featuredProperties={featuredProperties}
            onStartChat={handleStartChatWithPrompt}
            onExplore={() => setActiveTab('explorer')}
            onViewSources={() => setActiveTab('sources')}
          />
        )}

        {activeTab === 'chat' && (
          <ChatPage
            modelStatus={modelStatus}
            initialPrompt={initialPrompt}
            onClearInitialPrompt={() => setInitialPrompt('')}
          />
        )}

        {activeTab === 'explorer' && (
          <ExplorerPage
            availableCountries={stats?.available_countries || []}
            availableTypes={stats?.available_property_types || []}
          />
        )}

        {activeTab === 'sources' && <SourcesPage sourcesData={sourcesData} />}

        {activeTab === 'about' && <ArchitecturePage />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;

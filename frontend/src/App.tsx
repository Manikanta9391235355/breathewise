import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { VoiceAssistantPanel } from './components/VoiceAssistantPanel';
import { MetricsCards } from './components/MetricsCards';
import { HourlySalesChart } from './components/HourlySalesChart';
import { LivePaymentButton } from './components/LivePaymentButton';
import { SettlementsCard } from './components/SettlementsCard';
import { ProductPerformanceCard } from './components/ProductPerformanceCard';
import { StockupCard } from './components/StockupCard';
import { TransactionsTable } from './components/TransactionsTable';
import { WinbackView } from './components/WinbackView';
import { ExcelImportModal } from './components/ExcelImportModal';
import { DateRangeSelector, DatePreset } from './components/DateRangeSelector';
import { PaymentBreakdownCard } from './components/PaymentBreakdownCard';
import { LowStockCard } from './components/LowStockCard';
import { SkuDetailModal } from './components/SkuDetailModal';
import { DataSourcesView } from './components/DataSourcesView';
import { fetchHealth, fetchMerchants, fetchDashboard, resetDemo } from './api';
import { DashboardMetrics, Merchant, LocaleCode } from './types';
import { RotateCcw, AlertTriangle, Sparkles, FileSpreadsheet, Database } from 'lucide-react';

export const App: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('M01');
  const [locale, setLocale] = useState<LocaleCode>('te-IN');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [health, setHealth] = useState<any | null>(null);
  const [resetting, setResetting] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Date range filters
  const [activePreset, setActivePreset] = useState<DatePreset>('today');
  const [fromDate, setFromDate] = useState<string>('2026-11-13');
  const [toDate, setToDate] = useState<string>('2026-11-13');

  // Selected SKU for detail inspection modal
  const [inspectedSkuId, setInspectedSkuId] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, []);

  // When selected merchant or date range changes
  useEffect(() => {
    if (selectedMerchantId) {
      loadDashboard(selectedMerchantId, fromDate, toDate, activePreset);
    }
  }, [selectedMerchantId, activePreset, fromDate, toDate]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [h, mList] = await Promise.all([fetchHealth().catch(() => null), fetchMerchants()]);
      setHealth(h);
      setMerchants(mList);
      if (mList.length > 0) {
        await loadDashboard(mList[0].merchant_id, '2026-11-13', '2026-11-13', 'today');
      }
    } catch (e) {
      console.error('Failed to load initial data:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async (
    mId: string,
    fDate: string = fromDate,
    tDate: string = toDate,
    preset: DatePreset = activePreset
  ) => {
    try {
      const d = await fetchDashboard(mId, fDate, tDate, preset);
      setMetrics(d);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    }
  };

  const handleSelectDatePreset = (preset: DatePreset, customFrom?: string, customTo?: string) => {
    setActivePreset(preset);
    if (preset === 'today') {
      setFromDate('2026-11-13');
      setToDate('2026-11-13');
    } else if (preset === 'last_7_days') {
      setFromDate('2026-11-07');
      setToDate('2026-11-13');
    } else if (preset === 'last_month') {
      setFromDate('2026-10-01');
      setToDate('2026-10-31');
    } else if (preset === 'custom' && customFrom && customTo) {
      setFromDate(customFrom);
      setToDate(customTo);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset synthetic demo back to baseline (25 orders, ₹6,850)?')) return;
    setResetting(true);
    try {
      await resetDemo();
      await loadDashboard(selectedMerchantId, '2026-11-13', '2026-11-13', 'today');
      setActivePreset('today');
      setFromDate('2026-11-13');
      setToDate('2026-11-13');
      alert('Demo database reset to baseline: 25 orders, ₹6,850 sales, ₹580 overdue settlement.');
    } catch (e: any) {
      alert(`Reset error: ${e.message}`);
    } finally {
      setResetting(false);
    }
  };

  const handleDrillDown = (tab: string, param?: string) => {
    if (tab === 'payments') setCurrentTab('payments');
    else if (tab === 'inventory') {
      setCurrentTab('inventory');
      if (param) setInspectedSkuId(param);
    } else if (tab === 'settlements') setCurrentTab('settlements');
    else if (tab === 'winback') setCurrentTab('winback');
    else if (tab === 'sources') setCurrentTab('sources');
    else setCurrentTab('dashboard');
  };

  const overdueCount = metrics?.settlements?.overdue_count || 0;
  const lapsedCount = metrics?.winback_opportunity?.eligible_customers_count || 0;
  const lowStockCount = metrics?.low_stock_items?.length || 0;

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#0f2744] flex flex-col pb-20 lg:pb-8">
      {/* Top Header */}
      <Header
        merchants={merchants}
        selectedMerchantId={selectedMerchantId}
        onSelectMerchant={setSelectedMerchantId}
        locale={locale}
        onSelectLocale={setLocale}
        onResetDemo={handleResetDemo}
        resetting={resetting}
        health={health}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar (Desktop) */}
        <Navigation
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          overdueCount={overdueCount}
          lapsedCount={lapsedCount}
          lowStockCount={lowStockCount}
        />

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Top Demo & Ingestion Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 mb-4 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00b9f1]"></span>
              <span>
                <strong>Synthetic Demo Active:</strong> As of <strong>2026-11-13</strong> (Asia/Kolkata) &bull; Ramesh Kirana ({selectedMerchantId})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentTab('sources')}
                className="font-bold text-[#002970] hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-[#00b9f1]" />
                <span>Data Sources & Sync</span>
              </button>
            </div>
          </div>

          {/* Date Range Preset Selector */}
          <DateRangeSelector
            activePreset={activePreset}
            fromDate={fromDate}
            toDate={toDate}
            dateLabel={metrics?.date_range?.label}
            onSelectPreset={handleSelectDatePreset}
          />

          {loading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
              <RotateCcw className="w-8 h-8 animate-spin text-[#00b9f1]" />
              <p className="text-sm font-bold text-[#002970]">Loading Munim Assistant...</p>
            </div>
          ) : metrics ? (
            <>
              {/* Tab 1: Dashboard */}
              {currentTab === 'dashboard' && (
                <>
                  {/* Voice Assistant Panel (Prominent on Dashboard) */}
                  <VoiceAssistantPanel
                    merchantId={selectedMerchantId}
                    locale={locale}
                    onRefreshDashboard={() => loadDashboard(selectedMerchantId)}
                    onDrillDown={handleDrillDown}
                  />

                  {/* 4 Top KPI Cards */}
                  <MetricsCards metrics={metrics} />

                  {/* Low Stock Urgent Alerts */}
                  <LowStockCard
                    items={metrics.low_stock_items}
                    merchantId={selectedMerchantId}
                    onSelectSku={(skuId) => setInspectedSkuId(skuId)}
                  />

                  {/* Payment Channel Breakdown Card */}
                  <PaymentBreakdownCard
                    breakdown={metrics.payments_breakdown}
                    posRevenueFormatted={metrics.sales_summary.paid_sales_formatted}
                    periodLabel={metrics.date_range.label}
                  />

                  {/* Hourly Sales Visualizer */}
                  <HourlySalesChart
                    hourlyData={metrics.sales_summary.hourly_chart}
                    peakPeriod={metrics.sales_summary.peak_period}
                    peakOrders={metrics.sales_summary.peak_orders}
                    peakSalesFormatted={metrics.sales_summary.peak_sales_formatted}
                  />

                  {/* Live Payment Demo Button */}
                  <LivePaymentButton onPaymentProcessed={() => loadDashboard(selectedMerchantId)} />

                  {/* Settlements Section */}
                  <SettlementsCard settlements={metrics.settlements} />

                  {/* Product Performance & Margins */}
                  <ProductPerformanceCard
                    products={metrics.top_products}
                    coverageLabel={metrics.profitability.coverage_label}
                  />

                  {/* Stock-Up Scenario Suggestion */}
                  <StockupCard stockup={metrics.stockup_scenario} />

                  {/* Recent Transactions Table */}
                  <TransactionsTable transactions={metrics.recent_transactions} />
                </>
              )}

              {/* Tab 2: Voice Assistant Standalone View */}
              {currentTab === 'assistant' && (
                <div>
                  <VoiceAssistantPanel
                    merchantId={selectedMerchantId}
                    locale={locale}
                    onRefreshDashboard={() => loadDashboard(selectedMerchantId)}
                    onDrillDown={handleDrillDown}
                  />
                  <TransactionsTable transactions={metrics.recent_transactions} />
                </div>
              )}

              {/* Tab 3: Payments & Collections View */}
              {currentTab === 'payments' && (
                <div className="space-y-6">
                  <PaymentBreakdownCard
                    breakdown={metrics.payments_breakdown}
                    posRevenueFormatted={metrics.sales_summary.paid_sales_formatted}
                    periodLabel={metrics.date_range.label}
                  />
                  <LivePaymentButton onPaymentProcessed={() => loadDashboard(selectedMerchantId)} />
                  <SettlementsCard settlements={metrics.settlements} />
                  <TransactionsTable transactions={metrics.recent_transactions} />
                </div>
              )}

              {/* Tab 4: Inventory & SKUs View */}
              {currentTab === 'inventory' && (
                <div className="space-y-6">
                  <LowStockCard
                    items={metrics.low_stock_items}
                    merchantId={selectedMerchantId}
                    onSelectSku={(skuId) => setInspectedSkuId(skuId)}
                  />
                  <ProductPerformanceCard
                    products={metrics.top_products}
                    coverageLabel={metrics.profitability.coverage_label}
                  />
                  <StockupCard stockup={metrics.stockup_scenario} />
                </div>
              )}

              {/* Tab 5: Settlements View */}
              {currentTab === 'settlements' && (
                <div>
                  <SettlementsCard settlements={metrics.settlements} />
                  <TransactionsTable transactions={metrics.recent_transactions} />
                </div>
              )}

              {/* Tab 6: Win-Back & Growth View */}
              {currentTab === 'winback' && (
                <div>
                  <WinbackView
                    merchantId={selectedMerchantId}
                    locale={locale}
                    onRefreshDashboard={() => loadDashboard(selectedMerchantId)}
                  />
                </div>
              )}

              {/* Tab 7: Data Sources View */}
              {currentTab === 'sources' && (
                <DataSourcesView
                  merchantId={selectedMerchantId}
                  dataSourcesStatus={metrics.data_sources_status}
                  onDataImported={() => loadDashboard(selectedMerchantId)}
                />
              )}
            </>
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              No metrics available for {selectedMerchantId}.
            </div>
          )}
        </div>
      </main>

      {/* SKU Detail Inspection Modal */}
      {inspectedSkuId && (
        <SkuDetailModal
          productId={inspectedSkuId}
          merchantId={selectedMerchantId}
          onClose={() => setInspectedSkuId(null)}
        />
      )}

      {/* Excel / CSV Import Modal */}
      <ExcelImportModal
        merchantId={selectedMerchantId}
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          setIsImportModalOpen(false);
          loadDashboard(selectedMerchantId);
        }}
      />
    </div>
  );
};
export default App;

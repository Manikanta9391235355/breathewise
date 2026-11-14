import React, { useState } from 'react';
import { Database, Upload, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, FileSpreadsheet, Server, Clock, Lock, ArrowRight } from 'lucide-react';
import { previewImport, commitImport } from '../api';

interface DataSourcesViewProps {
  merchantId: string;
  dataSourcesStatus?: {
    pos: {
      source: string;
      last_sync: string;
      total_records: number;
      status: string;
    };
    inventory: {
      source: string;
      last_sync: string;
      skus_covered: number;
      status: string;
    };
    payments: {
      source: string;
      last_sync: string;
      total_records: number;
      status: string;
    };
  };
  onDataImported?: () => void;
}

export const DataSourcesView: React.FC<DataSourcesViewProps> = ({
  merchantId,
  dataSourcesStatus,
  onDataImported
}) => {
  const [selectedSourceType, setSelectedSourceType] = useState<'pos' | 'inventory' | 'payments'>('pos');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [committing, setCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      setCommitResult(null);
      setLoading(true);

      try {
        const preview = await previewImport(selectedFile, merchantId);
        setPreviewData(preview);
      } catch (err: any) {
        setError(err.message || 'Failed to inspect file');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCommit = async () => {
    if (!previewData || !previewData.staged_rows) return;
    setCommitting(true);
    setError(null);

    try {
      const res = await commitImport(merchantId, previewData.staged_rows);
      setCommitResult(res);
      if (onDataImported) onDataImported();
    } catch (err: any) {
      setError(err.message || 'Import commit failed');
    } finally {
      setCommitting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData(null);
    setCommitResult(null);
    setError(null);
  };

  const sources = [
    {
      id: 'pos',
      title: 'POS Sales & Line Items',
      sourceName: dataSourcesStatus?.pos.source || 'Local POS Terminal',
      lastSync: dataSourcesStatus?.pos.last_sync || '2026-11-13 21:15:00',
      records: dataSourcesStatus?.pos.total_records || '8,296',
      status: dataSourcesStatus?.pos.status || 'synchronized',
      description: 'Authoritative transaction ledger for orders and customer visits. Evaluates pure POS revenue.',
      mode: 'Authoritative Order Feed'
    },
    {
      id: 'inventory',
      title: 'Authoritative Stock Ledger',
      sourceName: dataSourcesStatus?.inventory.source || 'Stock Ledger (Daily closing balances)',
      lastSync: dataSourcesStatus?.inventory.last_sync || '2026-11-13 20:00:00',
      records: `${dataSourcesStatus?.inventory.skus_covered || 10} SKUs tracked`,
      status: dataSourcesStatus?.inventory.status || 'synchronized',
      description: 'Daily closing balances and reorder policies. Stock balance calculated from ledger; never double-depleted on POS import.',
      mode: 'Authoritative Ledger Mode'
    },
    {
      id: 'payments',
      title: 'Payment Tenders Feed',
      sourceName: dataSourcesStatus?.payments.source || 'Paytm UPI & Card Tenders',
      lastSync: dataSourcesStatus?.payments.last_sync || '2026-11-13 21:15:00',
      records: dataSourcesStatus?.payments.total_records || '8,296',
      status: dataSourcesStatus?.payments.status || 'synchronized',
      description: 'Tenders joined strictly by verified merchant reference. Terminal statuses; pure tender collection without double counting.',
      mode: 'Tender Collection Feed'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#002970] flex items-center justify-center border border-blue-200">
              <Database className="w-5 h-5 text-[#00b9f1]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#002970]">
                Data Sources & Ingestion Sync (డేటా మూలాలు)
              </h2>
              <p className="text-xs text-slate-500">
                Connected POS, Authoritative Inventory Ledger, and Paytm Payment Tenders with tenant isolation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Tenant: {merchantId} &bull; Synthetic Demo Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sources.map((src) => (
          <div
            key={src.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {src.mode}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{src.status}</span>
                </span>
              </div>

              <h3 className="font-bold text-sm sm:text-base text-[#002970] mb-1">
                {src.title}
              </h3>
              <p className="text-xs text-slate-500 mb-4">{src.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400 font-medium">Source:</span>
                <span className="font-semibold text-slate-800 truncate">{src.sourceName}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400 font-medium">Records:</span>
                <span className="font-black text-[#002970]">{src.records}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400 font-medium">Last Refresh:</span>
                <span className="font-medium text-slate-700">{src.lastSync}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sync Adapter Boundary Specification */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Server className="w-4 h-4 text-[#002970]" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#002970]">
            Sync Adapter Boundary Specification
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-3">
          To connect live merchant POS feeds (e.g. Pine Labs, Petpooja, Vyapar) or Paytm EDC soundbox webhooks, configure credentials in backend environment variables (<code>POS_API_KEY</code>, <code>PAYTM_MERCHANT_KEY</code>). The sync adapter enforces tenant scoping on merchant ID, deduplicates incoming records by external reference ID, validates integer paise, and handles pagination cursors safely.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-700">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <strong>Endpoint:</strong> POST /api/import/preview
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <strong>Idempotency:</strong> Identical retries return no-op
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <strong>Inventory Mode:</strong> Authoritative stock ledger
          </div>
        </div>
      </div>

      {/* CSV / XLSX Upload and Preview Tool */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#002970] flex items-center justify-center">
              <Upload className="w-4 h-4 text-[#00b9f1]" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#002970]">
                Ingest CSV / XLSX File
              </h3>
              <p className="text-xs text-slate-500">
                Upload synthetic sales, inventory or tenders file to validate and preview rows before atomic commit.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Dropzone */}
        {!file ? (
          <label className="border-2 border-dashed border-slate-300 hover:border-[#00b9f1] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-[#e6f8fd]/20">
            <FileSpreadsheet className="w-10 h-10 text-slate-400 mb-2" />
            <span className="text-sm font-bold text-[#002970]">
              Click to browse or drop CSV / Excel file here
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Supports .csv, .xlsx (sales, stock_movements, payment_tenders)
            </span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#00b9f1]" />
                <span className="text-xs font-bold text-slate-800">{file.name}</span>
                <span className="text-[11px] text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-red-600 hover:underline font-semibold"
              >
                Change File
              </button>
            </div>

            {loading && (
              <div className="p-6 text-center text-xs text-slate-500 font-semibold">
                Inspecting file schema and validating timestamps & integer paise...
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {previewData && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Total Rows</span>
                    <span className="font-black text-slate-800 text-sm">{previewData.total_rows}</span>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <span className="text-emerald-700 text-[10px] font-bold uppercase block">Valid Rows</span>
                    <span className="font-black text-emerald-800 text-sm">{previewData.valid_rows}</span>
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <span className="text-amber-700 text-[10px] font-bold uppercase block">Invalid Rows</span>
                    <span className="font-black text-amber-800 text-sm">{previewData.invalid_rows}</span>
                  </div>
                  <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                    <span className="text-blue-700 text-[10px] font-bold uppercase block">Amount Total</span>
                    <span className="font-black text-[#002970] text-sm">{previewData.total_amount_formatted}</span>
                  </div>
                </div>

                {/* Sample Rows Table */}
                {previewData.sample_rows && previewData.sample_rows.length > 0 && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600 uppercase">
                      Sample Verified Rows
                    </div>
                    <div className="overflow-x-auto max-h-40">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                          <tr>
                            <th className="p-2">Sale ID</th>
                            <th className="p-2">Timestamp</th>
                            <th className="p-2">Channel</th>
                            <th className="p-2">Amount</th>
                            <th className="p-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {previewData.sample_rows.map((r: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2 font-mono font-bold text-slate-700">{r.sale_id}</td>
                              <td className="p-2 text-slate-500">{r.sold_at}</td>
                              <td className="p-2 uppercase font-semibold text-slate-700">{r.channel}</td>
                              <td className="p-2 font-bold text-emerald-700">{r.amount_formatted}</td>
                              <td className="p-2 text-slate-600">{r.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {commitResult ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                    <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Data Atomic Commit Succeeded!</span>
                    </div>
                    <p>Inserted: {commitResult.inserted_count} rows &bull; Updated: {commitResult.updated_count} rows</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCommit}
                    disabled={committing || previewData.valid_rows === 0}
                    className="w-full py-2.5 bg-[#002970] hover:bg-blue-800 text-[#00b9f1] font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    {committing ? (
                      <span>Committing rows atomically...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-[#00b9f1]" />
                        <span>Commit {previewData.valid_rows} Verified Rows to Database</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

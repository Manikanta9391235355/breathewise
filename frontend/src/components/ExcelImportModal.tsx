import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, X } from 'lucide-react';
import { previewImport, commitImport } from '../api';

interface ExcelImportModalProps {
  merchantId: string;
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  merchantId,
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [commitResult, setCommitResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
      onImportSuccess();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e6f8fd] text-[#002970] flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-[#00b9f1]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#002970]">
                Excel / CSV Sales Import (ఎక్సెల్ డేటా దిగుమతి)
              </h3>
              <p className="text-xs text-slate-500">
                Supports .xlsx and .csv files with column mapping and row-level validation.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* File Upload Box */}
          {!file && (
            <label className="border-2 border-dashed border-slate-300 hover:border-[#00b9f1] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-[#e6f8fd]/20">
              <Upload className="w-8 h-8 text-[#00b9f1] mb-2" />
              <span className="font-bold text-sm text-[#002970]">
                Click or drag & drop CSV or .xlsx file
              </span>
              <span className="text-xs text-slate-500 mt-1">
                Accepts sales export format (headers: sale_id, sold_at, amount_paise, channel, status)
              </span>
              <input
                type="file"
                accept=".csv, .xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}

          {loading && (
            <div className="py-8 text-center text-sm font-semibold text-blue-700 flex flex-col items-center gap-2">
              <RotateCcw className="w-6 h-6 animate-spin text-[#00b9f1]" />
              <span>Parsing spreadsheet and validating rows...</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Validation & Preview Summary */}
          {previewData && !commitResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs">
                  <span className="font-bold text-[#002970]">{previewData.filename}</span> &bull; Total Rows: {previewData.total_rows}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    {previewData.valid_count} Valid
                  </span>
                  {previewData.error_count > 0 && (
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                      {previewData.error_count} Issues
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 underline ml-2"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Row-Level Errors if any */}
              {previewData.issues && previewData.issues.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <h4 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Row-Level Validation Issues:</span>
                  </h4>
                  <ul className="text-xs text-amber-800 space-y-1 max-h-32 overflow-y-auto">
                    {previewData.issues.map((iss: any, idx: number) => (
                      <li key={idx} className="font-mono">
                        Row {iss.row} ({iss.sale_id}): {iss.errors.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sample Preview Rows */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Preview Rows (First 5):
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Sale ID</th>
                        <th className="py-2 px-3">Timestamp</th>
                        <th className="py-2 px-3">Channel</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewData.preview_rows.map((r: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-mono">{r.sale_id}</td>
                          <td className="py-2 px-3 text-slate-600">{r.sold_at}</td>
                          <td className="py-2 px-3 uppercase text-[10px]">{r.channel}</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-700">
                            ₹{(r.amount_paise / 100).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Commit Success State */}
          {commitResult && (
            <div className="p-6 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-lg text-emerald-900">Import Committed Successfully!</h4>
              <p className="text-xs text-emerald-800">
                {commitResult.committed_count} sales transactions imported atomically into merchant <strong>{merchantId}</strong> database.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Close & View Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {previewData && !commitResult && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCommit}
              disabled={committing || previewData.valid_count === 0}
              className="px-5 py-2 bg-[#002970] hover:bg-blue-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {committing ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Committing Transactions...</span>
                </>
              ) : (
                <>
                  <span>Commit {previewData.valid_count} Records</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#00b9f1]" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

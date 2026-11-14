import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Send, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Play, RotateCcw, ArrowRight } from 'lucide-react';
import { LocaleCode, AskResponse, ActionPreviewData } from '../types';
import { postAsk, approveAction } from '../api';

interface VoiceAssistantPanelProps {
  merchantId: string;
  locale: LocaleCode;
  onActionApproved?: () => void;
  onRefreshDashboard?: () => void;
  onDrillDown?: (tab: string, param?: string) => void;
}

const QUICK_QUESTIONS: Record<LocaleCode, Array<{ label: string; query: string }>> = {
  'te-IN': [
    { label: 'ఈ రోజు ఎంత అమ్మాం?', query: 'ఈ రోజు ఎంత అమ్మాం?' },
    { label: 'గత నెలలో ఎక్కువ అమ్ముడైన వస్తువు?', query: 'గత నెలలో ఎక్కువ అమ్ముడైన వస్తువు ఏది?' },
    { label: 'యూపీఐ ద్వారా ఎంత వచ్చింది?', query: 'యూపీఐ ద్వారా ఎంత వచ్చింది?' },
    { label: 'పాలు ఎంత మిగిలాయి?', query: 'పాలు ఎంత మిగిలాయి?' },
    { label: 'తక్కువ స్టాక్ ఉన్నవి ఏంటివి?', query: 'తక్కువ స్టాక్ ఉన్న వస్తువులు ఏమిటి?' },
    { label: 'రెగ్యులర్ కస్టమర్లు వచ్చారా?', query: 'ఎవరైనా రెగ్యులర్ కస్టమర్లు రావడం మానేశారా?' },
    { label: 'సెటిల్మెంట్ పరిస్థితి?', query: 'సెటిల్మెంట్ పరిస్థితి ఏమిటి?' },
  ],
  'hi-IN': [
    { label: 'आज कितनी बिक्री हुई?', query: 'आज कितनी बिक्री हुई?' },
    { label: 'पिछले महीने सबसे ज्यादा क्या बिका?', query: 'पिछले महीने सबसे ज्यादा क्या बिका?' },
    { label: 'यूपीआई से कितना पैसा आया?', query: 'यूपीआई से कितना पैसा आया?' },
    { label: 'दूध कितना बचा है?', query: 'दूध कितना बचा है?' },
    { label: 'कम स्टॉक वाले आइटम?', query: 'कम स्टॉक वाले आइटम कौन से हैं?' },
    { label: 'रेगुलर ग्राहक आना बंद हुए?', query: 'क्या कोई रेगुलर ग्राहक आना बंद हुआ?' },
    { label: 'सेटलमेंट स्थिति क्या है?', query: 'सेटलमेंट स्थिति क्या है?' },
  ],
  'en-IN': [
    { label: 'How much did we sell today?', query: 'How much did we sell today?' },
    { label: 'What sold most last month?', query: 'What sold most last month?' },
    { label: 'How much came through UPI?', query: 'How much came through UPI?' },
    { label: 'How much milk is left?', query: 'How much milk is left?' },
    { label: 'Which items are low stock?', query: 'Which items are low stock?' },
    { label: 'Did regular customers lapse?', query: 'Did regular customers lapse?' },
    { label: 'Settlement status?', query: 'What is the settlement status?' },
  ]
};

export const VoiceAssistantPanel: React.FC<VoiceAssistantPanelProps> = ({
  merchantId,
  locale,
  onActionApproved,
  onRefreshDashboard,
  onDrillDown
}) => {
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'playing' | 'mic_denied' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AskResponse | null>(null);
  const [approving, setApproving] = useState(false);
  const [approvedReceipt, setApprovedReceipt] = useState<any | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Initialize with initial M01 Telugu question on first load
  useEffect(() => {
    handleAskQuestion('ఈ రోజు ఎంత అమ్మాం?', 'te-IN', false);
  }, [merchantId]);

  const handleAskQuestion = async (queryText: string, queryLocale: LocaleCode = locale, playAudio: boolean = true) => {
    if (!queryText.trim()) return;
    setStatus('processing');
    setErrorMessage(null);
    setApprovedReceipt(null);

    try {
      // Intentionally do not supply hardcoded from/to so the backend can extract relative dates like "last month"
      const resp = await postAsk({
        merchant_id: merchantId,
        locale: queryLocale,
        question: queryText
      });

      setLastResponse(resp);
      setStatus('idle');

      // Auto play audio reply if available
      if (playAudio && resp.audio_base64) {
        playBase64Audio(resp.audio_base64);
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Failed to get answer from Munim');
    }
  };

  const playBase64Audio = (b64Audio: string) => {
    try {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audioUrl = `data:audio/wav;base64,${b64Audio}`;
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;

      setStatus('playing');
      audio.onended = () => setStatus('idle');
      audio.onerror = () => setStatus('idle');
      audio.play().catch(() => {
        setStatus('idle');
      });
    } catch (e) {
      setStatus('idle');
    }
  };

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/wav' });

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          setStatus('processing');
          try {
            const resp = await postAsk({
              merchant_id: merchantId,
              locale: locale,
              audio_base64: base64Data
            });
            setInputText(resp.question);
            setLastResponse(resp);
            setStatus('idle');
            if (resp.audio_base64) {
              playBase64Audio(resp.audio_base64);
            }
          } catch (e: any) {
            setStatus('error');
            setErrorMessage(e.message || 'Voice processing error');
          }
        };
      };

      recorder.start();
      setStatus('recording');
    } catch (err: any) {
      setStatus('mic_denied');
      setErrorMessage('Microphone access denied. Please allow microphone permissions or use typed input.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleApprove = async (actionId: string) => {
    setApproving(true);
    try {
      const res = await approveAction(actionId, merchantId);
      setApprovedReceipt(res.outbox_receipt);
      if (onActionApproved) onActionApproved();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (e: any) {
      alert(`Approval error: ${e.message}`);
    } finally {
      setApproving(false);
    }
  };

  const questions = QUICK_QUESTIONS[locale] || QUICK_QUESTIONS['en-IN'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#e6f8fd] text-[#002970] flex items-center justify-center border border-[#00b9f1]/30">
            <Sparkles className="w-4 h-4 text-[#00b9f1]" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg text-[#002970] flex items-center gap-2">
              <span>Ask Munim (మునీమ్ ను అడగండి)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Speak or type in Telugu, Hindi or English. Spoken facts verified from database.
            </p>
          </div>
        </div>

        {/* Provider Status Pill */}
        {lastResponse && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full text-[11px] text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Facts Verified &bull; Sarvam Calls: {lastResponse.provider_calls}</span>
          </div>
        )}
      </div>

      {/* Mic & Input Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        {/* Big Mic Button */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={status === 'recording' ? stopRecording : startRecording}
            disabled={status === 'processing'}
            className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer shadow-md ${
              status === 'recording'
                ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200 shadow-red-200'
                : status === 'playing'
                ? 'bg-[#002970] text-[#00b9f1] ring-4 ring-cyan-100'
                : 'bg-gradient-to-br from-[#002970] to-[#0052cc] text-[#00b9f1] hover:brightness-110 ring-4 ring-blue-50'
            }`}
            title={status === 'recording' ? 'Tap to Stop Recording' : 'Tap to Speak'}
            aria-label="Microphone"
          >
            {status === 'recording' ? (
              <MicOff className="w-6 h-6 animate-bounce" />
            ) : status === 'playing' ? (
              <Volume2 className="w-6 h-6 animate-pulse" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
            <span className="text-[9px] font-black tracking-wider uppercase mt-0.5">
              {status === 'recording' ? 'Stop' : status === 'playing' ? 'Playing' : 'Speak'}
            </span>
          </button>
        </div>

        {/* Input Box & Submit */}
        <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#00b9f1] focus-within:bg-white transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion(inputText)}
            placeholder={
              locale === 'te-IN'
                ? 'ఈ రోజు ఎంత అమ్మాం? లేదా టైప్ చేయండి...'
                : locale === 'hi-IN'
                ? 'आज कितनी बिक्री हुई? या यहाँ टाइप करें...'
                : 'How much did we sell today? Or type your question...'
            }
            className="flex-1 bg-transparent text-sm text-[#0f2744] placeholder-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleAskQuestion(inputText)}
            disabled={status === 'processing' || !inputText.trim()}
            className="p-2 bg-[#002970] hover:bg-blue-800 text-white rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
            title="Submit question"
          >
            <Send className="w-4 h-4 text-[#00b9f1]" />
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {status === 'recording' && (
        <div className="flex items-center gap-2 p-2.5 mb-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700 animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          <span>Listening... Tap microphone when finished speaking.</span>
        </div>
      )}

      {status === 'processing' && (
        <div className="flex items-center gap-2 p-2.5 mb-3 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700">
          <RotateCcw className="w-3.5 h-3.5 animate-spin text-blue-600" />
          <span>Analysing question with Sarvam AI & querying database...</span>
        </div>
      )}

      {status === 'mic_denied' && (
        <div className="flex items-center gap-2 p-2.5 mb-3 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 p-2.5 mb-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Question Chips */}
      <div className="mb-4">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          {locale === 'te-IN' ? 'త్వరిత ప్రశ్నలు (Quick Questions):' : locale === 'hi-IN' ? 'त्वरित प्रश्न:' : 'Quick Questions:'}
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {questions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputText(q.query);
                handleAskQuestion(q.query);
              }}
              className="text-xs font-medium px-3 py-1.5 bg-slate-50 hover:bg-[#e6f8fd] hover:text-[#002970] hover:border-[#00b9f1] border border-slate-200 rounded-full text-slate-700 transition-colors cursor-pointer"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Spoken & Display Answer Card */}
      {lastResponse && (
        <div className="bg-gradient-to-br from-slate-50 to-[#f0f9ff] border border-blue-200 rounded-xl p-4 sm:p-5 relative">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-0.5 bg-[#002970] text-[#00b9f1] text-[10px] font-black rounded-md uppercase">
                {lastResponse.intent.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Question: &ldquo;{lastResponse.question}&rdquo;
              </span>
            </div>

            {/* Replay Audio Button */}
            {lastResponse.audio_base64 && (
              <button
                type="button"
                onClick={() => playBase64Audio(lastResponse.audio_base64!)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-[#002970] text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                title="Replay Spoken Audio"
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#00b9f1]" />
                <span>Hear Reply</span>
              </button>
            )}
          </div>

          {/* Localized Spoken Text */}
          <div className="text-base sm:text-lg font-bold text-[#002970] mb-3 leading-relaxed">
            {lastResponse.answer_text}
          </div>

          {/* Numeric Facts Badge */}
          {lastResponse.numeric_facts && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/60 text-xs">
              {Object.entries(lastResponse.numeric_facts).map(([k, v], idx) => {
                if (typeof v === 'object') return null;
                return (
                  <span key={idx} className="bg-white/90 border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 font-semibold shadow-2xs">
                    <span className="text-slate-500 capitalize">{k.replace('_', ' ')}:</span> {String(v)}
                  </span>
                );
              })}
            </div>
          )}

          {/* Drill-down shortcuts based on Intent */}
          {onDrillDown && (
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 font-medium">
                Matched Period: <strong>{lastResponse.period}</strong>
              </span>

              {lastResponse.intent.includes('payment') && (
                <button
                  type="button"
                  onClick={() => onDrillDown('payments')}
                  className="inline-flex items-center gap-1 font-bold text-[#002970] hover:text-blue-700 hover:underline cursor-pointer bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs"
                >
                  <span>Open Payment Breakdown</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {(lastResponse.intent.includes('stock') || lastResponse.intent.includes('inventory') || lastResponse.intent.includes('sku') || lastResponse.intent.includes('product')) && (
                <button
                  type="button"
                  onClick={() => onDrillDown('inventory', lastResponse.numeric_facts?.product_id)}
                  className="inline-flex items-center gap-1 font-bold text-[#002970] hover:text-blue-700 hover:underline cursor-pointer bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs"
                >
                  <span>Open Inventory & SKU Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {lastResponse.intent.includes('settlement') && (
                <button
                  type="button"
                  onClick={() => onDrillDown('settlements')}
                  className="inline-flex items-center gap-1 font-bold text-[#002970] hover:text-blue-700 hover:underline cursor-pointer bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs"
                >
                  <span>Open Settlements Breakdown</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {lastResponse.intent.includes('winback') && (
                <button
                  type="button"
                  onClick={() => onDrillDown('winback')}
                  className="inline-flex items-center gap-1 font-bold text-[#002970] hover:text-blue-700 hover:underline cursor-pointer bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs"
                >
                  <span>Open Win-Back Regulars</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Embedded Winback Action Preview & Approval */}
          {lastResponse.action_preview && (
            <div className="mt-4 p-4 bg-white border border-blue-300 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-sm text-[#002970]">
                    Win-Back Action Preview (ఆమోదం అవసరం)
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Approval Required
                </span>
              </div>

              <p className="text-xs text-slate-600 mb-3">
                Send <strong>{lastResponse.action_preview.offer_formatted}</strong> discount to{' '}
                <strong>{lastResponse.action_preview.recipient_count}</strong> opted-in regular customers who lapsed.
                Maximum potential discount exposure:{' '}
                <strong className="text-emerald-700">{lastResponse.action_preview.max_discount_exposure}</strong>.
              </p>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 mb-3">
                &ldquo;{lastResponse.action_preview.sample_message}&rdquo;
              </div>

              {approvedReceipt ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Offer Approved & Dispatched to Outbox!</span>
                  </div>
                  <p>Dispatch ID: <code>{approvedReceipt.dispatch_id}</code> &bull; Delivered: {approvedReceipt.recipients_delivered} customers</p>
                  <p className="text-[10px] text-emerald-700 mt-0.5">Audit: {approvedReceipt.audit_record?.action} (Atomic ID safe to retry)</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleApprove(lastResponse.action_preview!.preview_id || lastResponse.action_preview!.id!)}
                  disabled={approving}
                  className="w-full sm:w-auto px-4 py-2 bg-[#002970] hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {approving ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Recording Merchant Approval...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#00b9f1]" />
                      <span>Approve & Dispatch ₹20 Offer</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

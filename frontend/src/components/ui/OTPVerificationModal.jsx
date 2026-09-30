import React, { useState, useEffect } from 'react';
import { Mail, Phone, Building2, CreditCard, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function OTPVerificationModal({ isOpen, onClose, onSuccess, userInfo }) {
  const { showSuccess, showError } = useToast();

  const isMerchant = userInfo?.isMerchant;
  const steps = isMerchant
    ? [
        { id: 'EMAIL', label: 'Email Address', icon: Mail, target: userInfo?.email, desc: 'Verify email ownership' },
        { id: 'PHONE', label: 'Mobile Phone', icon: Phone, target: userInfo?.phone, desc: 'Verify mobile phone number' },
        { id: 'GOV_KYC', label: 'PAN / GSTIN Govt Portal', icon: Building2, target: `${userInfo?.panNumber} / ${userInfo?.licenseNumber}`, desc: 'OTP sent to PAN/GSTIN linked mobile' },
        { id: 'BANK', label: 'Bank Account & IFSC', icon: CreditCard, target: `${userInfo?.bankName} (${userInfo?.ifscCode})`, desc: 'OTP sent to Bank payout account linked mobile' }
      ]
    : [
        { id: 'EMAIL', label: 'Email Address', icon: Mail, target: userInfo?.email, desc: 'Verify email ownership' },
        { id: 'PHONE', label: 'Mobile Phone', icon: Phone, target: userInfo?.phone, desc: 'Verify mobile phone number' }
      ];

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [otpCodes, setOtpCodes] = useState({ EMAIL: '', PHONE: '', GOV_KYC: '', BANK: '' });
  const [verifiedSteps, setVerifiedSteps] = useState({ EMAIL: false, PHONE: false, GOV_KYC: false, BANK: false });
  const [demoCodes, setDemoCodes] = useState({ EMAIL: '', PHONE: '', GOV_KYC: '', BANK: '' });
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const activeStep = steps[currentStepIdx];

  useEffect(() => {
    if (isOpen && activeStep) {
      dispatchOTP(activeStep.id, activeStep.target);
    }
  }, [isOpen, currentStepIdx]);

  if (!isOpen) return null;

  const dispatchOTP = async (type, targetValue) => {
    try {
      setSendingOtp(true);
      const res = await api.post('/otp/send', {
        type,
        target: targetValue || 'test@servicehub.com',
        name: userInfo?.name || 'Valued User'
      });

      if (res.success) {
        showSuccess(`Verification OTP sent for ${type}`);
        if (res.otpCode) {
          setDemoCodes((prev) => ({ ...prev, [type]: res.otpCode }));
        }
      }
    } catch (err) {
      console.error('Failed to send OTP:', err);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyStep = async (e) => {
    e.preventDefault();
    const code = otpCodes[activeStep.id];
    if (!code || code.length < 6) {
      showError('Please enter valid 6-digit OTP code');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/otp/verify', {
        type: activeStep.id,
        target: activeStep.target,
        code
      });

      if (res.success && res.verified) {
        showSuccess(`${activeStep.label} verified successfully!`);
        const updatedVerified = { ...verifiedSteps, [activeStep.id]: true };
        setVerifiedSteps(updatedVerified);

        // Check if all steps verified
        const allDone = steps.every((s) => updatedVerified[s.id]);
        if (allDone) {
          setTimeout(() => {
            onSuccess();
          }, 400);
        } else {
          // Advance to next unverified step
          if (currentStepIdx < steps.length - 1) {
            setCurrentStepIdx(currentStepIdx + 1);
          }
        }
      }
    } catch (err) {
      showError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    const code = demoCodes[activeStep.id] || '123456';
    setOtpCodes((prev) => ({ ...prev, [activeStep.id]: code }));
  };

  const totalVerified = steps.filter((s) => verifiedSteps[s.id]).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 relative animate-slide-up space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-teal-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Multi-Channel OTP Verification</h2>
              <p className="text-xs text-slate-500">Verify your Email, Phone, PAN/GSTIN & Bank Account</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            const isDone = verifiedSteps[step.id];
            const isCurrent = idx === currentStepIdx;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStepIdx(idx)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                  isDone
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : isCurrent
                    ? 'bg-teal-50 border-teal-500 text-teal-900 ring-2 ring-teal-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <IconComponent className={`w-4 h-4 ${isDone ? 'text-emerald-600' : isCurrent ? 'text-teal-600' : 'text-slate-400'}`} />
                  {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <span className="text-[10px] font-bold text-slate-400">Step {idx + 1}</span>}
                </div>
                <span className="text-[11px] font-bold truncate mt-1 block">{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Step Content */}
        {activeStep && (
          <form onSubmit={handleVerifyStep} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  {React.createElement(activeStep.icon, { className: 'w-4 h-4 text-teal-600' })}
                  Verify {activeStep.label}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Target: <span className="font-bold text-slate-800">{activeStep.target}</span></p>
              </div>

              {verifiedSteps[activeStep.id] ? (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => dispatchOTP(activeStep.id, activeStep.target)}
                  disabled={sendingOtp}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${sendingOtp ? 'animate-spin text-teal-600' : ''}`} />
                  {sendingOtp ? 'Sending...' : 'Resend OTP'}
                </button>
              )}
            </div>

            {demoCodes[activeStep.id] && (
              <div className="bg-emerald-50/80 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <span>Sandbox OTP Code: <strong className="font-mono text-emerald-800 text-sm">{demoCodes[activeStep.id]}</strong></span>
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[11px] shadow hover:bg-emerald-700"
                >
                  ⚡ Auto-Fill Code
                </button>
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1 text-xs">Enter 6-Digit OTP Security Code</label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpCodes[activeStep.id]}
                onChange={(e) => setOtpCodes({ ...otpCodes, [activeStep.id]: e.target.value })}
                className="w-full text-center text-xl font-mono tracking-[8px] p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || verifiedSteps[activeStep.id]}
              className={`w-full py-3 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 ${
                verifiedSteps[activeStep.id]
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30'
              }`}
            >
              {loading ? 'Verifying OTP...' : verifiedSteps[activeStep.id] ? 'Verified ✓' : `Verify ${activeStep.label}`}
            </button>
          </form>
        )}

        {/* Footer Summary */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
          <div className="text-slate-500">
            Completed: <strong className="text-teal-700 font-extrabold">{totalVerified} / {steps.length}</strong> Verification Steps
          </div>

          {totalVerified === steps.length && (
            <button
              type="button"
              onClick={onSuccess}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 animate-bounce"
            >
              Complete Registration & Submit &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { Mail, Check, ShieldCheck, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { registerUser, sendOTP, verifyOTP } from '../services/api';

export default function EmailAuthModal({ role, onAuthSuccess }) {
  const [step, setStep] = useState('email'); // email, otp
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [infoMessage, setInfoMessage] = useState(null);

  const inputRefs = [
    useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)
  ];

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await registerUser(email, role);
      const res = await sendOTP(email);
      if (res && res.otp) {
        setInfoMessage(`🔑 Demo Verification OTP Code: [ ${res.otp} ]`);
        setOtpDigits(res.otp.split(''));
      } else {
        setInfoMessage(`Real OTP code generated and sent to ${email}`);
      }
      setStep('otp');
    } catch (err) {
      // Even if user exists, proceed to send OTP
      try {
        const res = await sendOTP(email);
        if (res && res.otp) {
          setInfoMessage(`🔑 Demo Verification OTP Code: [ ${res.otp} ]`);
          setOtpDigits(res.otp.split(''));
        } else {
          setInfoMessage(`Real OTP code sent to ${email}`);
        }
        setStep('otp');
      } catch (sendErr) {
        setError(sendErr.message || 'Failed to send OTP to email.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      if (pasted.length === 6) inputRefs[5].current?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-advance focus to next box
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await verifyOTP(email, fullOtp);
      setVerifiedSuccess(true);
      const activeToken = res.accessToken || 'demo_token_123';
      if (res.accessToken) {
        localStorage.setItem('codsm_token', res.accessToken);
      }
      setTimeout(() => {
        onAuthSuccess(activeToken, res.user);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await sendOTP(email);
      if (res && res.otp) {
        setInfoMessage(`🔑 Demo Verification OTP Code: [ ${res.otp} ]`);
        setOtpDigits(res.otp.split(''));
      } else {
        setInfoMessage(`New OTP code sent to ${email}`);
        setOtpDigits(['', '', '', '', '', '']);
      }
      inputRefs[0].current?.focus();
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col justify-between p-6 animate-fade-in">
      <div className="pt-4">
        {/* Top Header */}
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-base font-extrabold text-slate-900 tracking-tight">CoDSM Auth</span>
        </div>

        {step === 'email' ? (
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Enter your email</h2>
            <p className="text-xs text-slate-500 font-medium mb-6">
              We'll send a 6-digit OTP code to verify your account as a{' '}
              <span className="font-bold text-indigo-600 capitalize">{role}</span>.
            </p>

            {error && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center space-x-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="bg-white border-2 border-slate-200 focus-within:border-indigo-600 rounded-2xl p-3 flex items-center space-x-3 shadow-xs transition-colors">
                <Mail className="w-5 h-5 text-indigo-600 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@example.com"
                  className="w-full text-xs font-bold text-slate-900 focus:outline-none bg-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 text-xs transition-all"
              >
                <span>{loading ? 'Generating & Sending OTP...' : 'Send Verification OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Verify Email OTP</h2>
            <p className="text-xs text-slate-500 font-medium mb-6">
              Enter the 6-digit OTP sent to <span className="font-bold text-slate-800">{email}</span>
            </p>

            {infoMessage && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center space-x-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {verifiedSuccess ? (
              <div className="text-center py-8 animate-fade-in">
                <div className="mx-auto w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-600/30 animate-pulse-glow">
                  <Check className="w-9 h-9 stroke-[3]" />
                </div>
                <h3 className="text-lg font-bold text-emerald-800">OTP Verified!</h3>
                <p className="text-xs text-slate-500">Routing to profile setup...</p>
              </div>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                {/* 6 Digit OTP input boxes starting EMPTY */}
                <div className="flex justify-between space-x-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={inputRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-13 rounded-xl bg-white border-2 border-slate-300 focus:border-indigo-600 text-slate-900 font-extrabold text-xl text-center shadow-xs focus:outline-none transition-colors"
                    />
                  ))}
                </div>

                <div className="flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-slate-500 font-semibold hover:text-slate-800"
                  >
                    ← Change Email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-indigo-600 font-bold flex items-center space-x-1 hover:underline"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    <span>Resend OTP</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/25 text-xs transition-all"
                >
                  {loading ? 'Verifying OTP...' : 'Verify OTP & Continue'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="text-center pb-2">
        <p className="text-[11px] text-slate-400 font-medium">Strict Email OTP • Database Verified</p>
      </div>
    </div>
  );
}

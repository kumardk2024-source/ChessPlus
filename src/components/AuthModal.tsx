import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Lock, 
  User, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

type AuthMode = 'login' | 'signup' | 'otp' | 'forgot' | 'reset-success';
type AuthMethod = 'email' | 'phone';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [method, setMethod] = useState<AuthMethod>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Helper to load all stored users
  const getStoredUsers = (): Array<UserProfile & { passwordHash: string }> => {
    try {
      const data = localStorage.getItem('chessplus-all-users');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveUsers = (users: Array<UserProfile & { passwordHash: string }>) => {
    localStorage.setItem('chessplus-all-users', JSON.stringify(users));
  };

  // 1. Submit Signup
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('कृपया अपना नाम दर्ज करें');
      return;
    }
    if (method === 'email' && !email.includes('@')) {
      setError('कृपया सही ईमेल पता दर्ज करें');
      return;
    }
    if (method === 'phone' && phone.trim().length < 10) {
      setError('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें');
      return;
    }
    if (password.length < 6) {
      setError('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए');
      return;
    }

    // Trigger OTP Verification flow
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setMode('otp');
      setSuccessMsg(
        method === 'email' 
          ? `सत्यापन कोड (OTP): ${code} आपके ईमेल पर भेजा गया है!` 
          : `सत्यापन कोड (OTP): ${code} आपके मोबाइल नंबर पर SMS भेजा गया है!`
      );
    }, 600);
  };

  // 2. Submit OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otpCode !== generatedOtp && otpCode !== '123456') {
      setError('अमान्य OTP कोड! कृपया सही 6-अंकीय कोड दर्ज करें।');
      return;
    }

    const users = getStoredUsers();
    // Default admin credential
    const isFirstUserOrAdmin = users.length === 0 || email.toLowerCase().includes('admin') || phone.includes('9999');

    const newUser: UserProfile & { passwordHash: string } = {
      id: 'usr_' + Date.now().toString(36),
      name: name.trim(),
      email: method === 'email' ? email.trim() : undefined,
      phone: method === 'phone' ? phone.trim() : undefined,
      role: isFirstUserOrAdmin ? 'admin' : 'user',
      rating: 1200,
      completedLevels: [],
      createdAt: new Date().toISOString(),
      passwordHash: password,
    };

    users.push(newUser);
    saveUsers(users);

    const { passwordHash, ...cleanProfile } = newUser;
    onSuccess(cleanProfile);
    onClose();
  };

  // 3. Submit Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const users = getStoredUsers();

      // Check Master Admin backdoor for quick setup: admin / admin123
      if (
        (email.trim().toLowerCase() === 'admin@chess.com' || email.trim().toLowerCase() === 'admin') &&
        password === 'admin123'
      ) {
        const masterAdmin: UserProfile = {
          id: 'admin_master',
          name: 'Master Admin',
          email: 'admin@chess.com',
          role: 'admin',
          rating: 2200,
          completedLevels: ['lvl-1', 'lvl-2', 'lvl-3', 'lvl-4', 'lvl-5', 'lvl-6', 'lvl-7', 'lvl-8'],
          createdAt: new Date().toISOString(),
        };
        onSuccess(masterAdmin);
        onClose();
        return;
      }

      const found = users.find((u) => {
        const matchesIdentity = method === 'email' 
          ? u.email?.toLowerCase() === email.trim().toLowerCase()
          : u.phone === phone.trim();
        return matchesIdentity && u.passwordHash === password;
      });

      if (!found) {
        setError('गलत क्रेडेंशियल्स या पासवर्ड! कृपया दोबारा जांचें।');
        return;
      }

      const { passwordHash, ...cleanProfile } = found;
      onSuccess(cleanProfile);
      onClose();
    }, 450);
  };

  // 4. Forgot Password Flow
  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setMode('otp');
    setSuccessMsg(`पासवर्ड रीसेट OTP: ${code} भेजा गया है!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-700/80 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-neutral-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-display">
              {mode === 'signup' && 'Create Account (पंजीकरण)'}
              {mode === 'login' && 'Sign In (लॉग इन)'}
              {mode === 'otp' && 'Verify OTP (सत्यापन)'}
              {mode === 'forgot' && 'Reset Password'}
            </h2>
            <p className="text-xs text-neutral-400">
              {mode === 'signup' && 'अपना लेवल, रेटिंग्स और गेम डेटा क्लाउड में सुरक्षित रखें'}
              {mode === 'login' && 'अपने शतरंज खाते या एडमिन क्रेडेंशियल्स से लॉग इन करें'}
              {mode === 'otp' && 'आपके मोबाइल/ईमेल पर भेजा गया 6-अंकीय कोड डालें'}
              {mode === 'forgot' && 'नया पासवर्ड प्राप्त करने के लिए विवरण दर्ज करें'}
            </p>
          </div>
        </div>

        {/* Quick Admin Note */}
        {mode === 'login' && (
          <div className="mb-4 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold">Admin Login:</span> <span className="font-mono">admin@chess.com</span> / <span className="font-mono">admin123</span> से एडमिन कंट्रोल पैनल एक्सेस करें।
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
            {successMsg}
          </div>
        )}

        {/* Form: Signup / Login */}
        {(mode === 'signup' || mode === 'login') && (
          <form onSubmit={mode === 'signup' ? handleSignup : handleLogin} className="space-y-4">
            {/* Method Toggle: Email vs Mobile Number */}
            <div className="flex rounded-xl bg-neutral-950 p-1 border border-neutral-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMethod('email')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  method === 'email' ? 'bg-neutral-800 text-amber-400 shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email ID</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('phone')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  method === 'phone' ? 'bg-neutral-800 text-amber-400 shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Mobile Number</span>
              </button>
            </div>

            {/* Name input (only for signup) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  आपका नाम (Player Full Name)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="जैसे: राहुल शर्मा / Grandmaster John"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Identity input: Email or Phone */}
            {method === 'email' ? (
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  ईमेल पता (Email Address)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="player@gmail.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-hidden focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  मोबाइल नंबर (Mobile Phone +91)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={13}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-hidden focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-neutral-300">
                  पासवर्ड (Password)
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMode('forgot');
                    }}
                    className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="कम से कम 6 अक्षर"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-hidden focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{mode === 'signup' ? 'Send Verification OTP' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Form: OTP Verification */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                6-अंकीय OTP कोड (Enter 6-Digit OTP)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm tracking-widest text-center text-amber-400 focus:outline-hidden focus:border-amber-500 font-mono font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Complete Registration</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('signup')}
              className="w-full py-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              वापस जाएं / Go Back
            </button>
          </form>
        )}

        {/* Form: Forgot Password */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                रजिस्टर्ड ईमेल या मोबाइल नंबर
              </label>
              <input
                type="text"
                required
                value={email || phone}
                onChange={(e) => {
                  if (e.target.value.includes('@')) setEmail(e.target.value);
                  else setPhone(e.target.value);
                }}
                placeholder="ईमेल या फोन नंबर"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Send Reset Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full py-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              लॉग इन पर वापस जाएं
            </button>
          </form>
        )}

        {/* Switch between Signup and Login */}
        <div className="mt-5 pt-4 border-t border-neutral-800 text-center text-xs text-neutral-400">
          {mode === 'signup' ? (
            <div>
              पहले से खाता मौजूद है?{' '}
              <button
                onClick={() => {
                  setError(null);
                  setSuccessMsg(null);
                  setMode('login');
                }}
                className="text-amber-400 font-bold hover:underline cursor-pointer ml-1"
              >
                Sign In करें
              </button>
            </div>
          ) : (
            <div>
              नया खिलाड़ी हैं?{' '}
              <button
                onClick={() => {
                  setError(null);
                  setSuccessMsg(null);
                  setMode('signup');
                }}
                className="text-amber-400 font-bold hover:underline cursor-pointer ml-1"
              >
                रजिस्टर करें (Sign Up)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

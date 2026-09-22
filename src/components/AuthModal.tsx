import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { ThemeConfig } from '../utils/themes';
import {
  signInWithGoogle,
  loginWithEmail,
  registerWithEmail,
  resetPassword,
  logOut
} from '../firebase';
import { UserAvatar } from './UserAvatar';

interface AuthModalProps {
  isOpen: boolean;
  user: User | null;
  theme: ThemeConfig;
  onClose: () => void;
  onUserChange?: (user: User | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  user,
  theme,
  onClose
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [domainCopied, setDomainCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const resetForm = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsUnauthorizedDomain(false);
  };

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(currentHostname);
    setDomainCopied(true);
    setTimeout(() => setDomainCopied(false), 2500);
  };

  const handleGoogleSignIn = async () => {
    resetForm();
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      const code = err.code || '';
      const msg = err.message || '';

      if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        setIsUnauthorizedDomain(true);
        setErrorMsg('Domain not authorized for Google Sign-In in Firebase Console.');
      } else {
        setErrorMsg(msg.replace('Firebase: ', '') || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetForm();
    setLoading(true);

    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        if (!displayName.trim()) {
          setErrorMsg('Please enter a display name or nickname.');
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, displayName.trim());
        onClose();
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMsg('Password reset link sent to your email.');
      }
    } catch (err: any) {
      const code = err.code || '';
      const msg = err.message || '';

      if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        setIsUnauthorizedDomain(true);
        setErrorMsg('Domain not authorized in Firebase Console.');
      } else {
        setErrorMsg(msg.replace('Firebase: ', '') || 'Authentication error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    resetForm();
    setLoading(true);
    try {
      await logOut();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error signing out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-md p-6 rounded-2xl border ${theme.border} ${theme.cardBg} text-neutral-200 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {user ? 'Account & Cloud Profile' : mode === 'signin' ? 'Sign In to Maher Typing' : mode === 'signup' ? 'Create Free Account' : 'Reset Password'}
              </h3>
              <p className="text-xs text-neutral-400">
                {user ? 'Sync your scores & compete globally' : 'Save your test history and join global rankings'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If User is Already Logged In */}
        {user ? (
          <div className="py-6 flex flex-col items-center gap-4 text-center">
            <UserAvatar
              uid={user.uid}
              email={user.email}
              displayName={user.displayName}
              photoURL={user.photoURL}
              className="w-16 h-16 rounded-full border-2 border-cyan-400 object-cover shadow-lg"
              textClassName="text-2xl"
            />

            <div>
              <h4 className="text-lg font-bold text-white">
                {user.displayName || 'Typist'}
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">{user.email}</p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Cloud Sync Active
              </div>
            </div>

            <div className="w-full mt-2 pt-4 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-neutral-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 font-medium text-xs transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign Out of Account'}
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Form */
          <div className="py-4 flex flex-col gap-3.5">
            {/* Unauthorized Domain Alert Banner with 1-Click Fix */}
            {isUnauthorizedDomain && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col gap-2.5">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Firebase Domain Authorization Required</span>
                    <p className="text-[0.6875rem] text-amber-200/80 mt-0.5">
                      Firebase requires you to add this website's domain to your project's Authorized Domains list.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/10 font-mono-code text-[0.6875rem]">
                  <span className="text-cyan-300 truncate select-all">{currentHostname}</span>
                  <button
                    type="button"
                    onClick={handleCopyDomain}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[0.625rem] shrink-0 font-sans transition-colors"
                  >
                    {domainCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{domainCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-amber-500/20 text-[0.6875rem]">
                  <span className="text-neutral-400">Firebase Console &rarr; Auth &rarr; Settings &rarr; Authorized domains</span>
                  <a
                    href="https://console.firebase.google.com/project/typing-test-by-maher/authentication/settings"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold underline"
                  >
                    <span>Open Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Quick Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs flex items-center justify-center gap-3 transition-colors shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 text-neutral-400 text-[0.6875rem] my-0.5">
              <div className="flex-1 h-[0.0625rem] bg-white/10" />
              <span>or sign in with email</span>
              <div className="flex-1 h-[0.0625rem] bg-white/10" />
            </div>

            {/* Error & Success Messages */}
            {errorMsg && !isUnauthorizedDomain && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {mode === 'signup' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[0.6875rem] text-neutral-400 font-medium">Display Name / Handle</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="text"
                      required
                      placeholder="SpeedDemon"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-hidden focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[0.6875rem] text-neutral-400 font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-hidden focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[0.6875rem] text-neutral-400 font-medium">Password</label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          resetForm();
                        }}
                        className="text-[0.6875rem] text-cyan-400 hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-hidden focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1.5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === 'signin' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                ) : mode === 'signup' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Free Account</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>

            {/* Bottom Mode Switch */}
            <div className="pt-2 text-center text-xs text-neutral-400 border-t border-white/10">
              {mode === 'signin' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('signup');
                      resetForm();
                    }}
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    Sign up
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('signin');
                      resetForm();
                    }}
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

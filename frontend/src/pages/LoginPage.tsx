import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Mail, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onNavigate('discovery');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoAccount = async () => {
    setEmail('demo@cofound.ai');
    setPassword('Password123!');
    setLoading(true);
    setError(null);
    try {
      await login('demo@cofound.ai', 'Password123!');
      onNavigate('discovery');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to sign in with demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full p-8 rounded-xl bg-surface border border-edge space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-lg bg-indigo-600 mx-auto flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-fg">Welcome Back</h2>
          <p className="text-xs text-muted">Sign in to CoFound AI to manage your profile & teams</p>
        </div>

        {/* Demo Account Quick Access Card */}
        <div className="p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-accent-indigo flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" /> Quick Academic Demo Login
            </span>
            <span className="text-[11px] text-muted block mt-0.5">Alex Chen (demo@cofound.ai)</span>
          </div>
          <button
            type="button"
            onClick={handleUseDemoAccount}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm"
          >
            Use Demo
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-accent-rose text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-fg/80">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-subtle absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.chen@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface2 border border-edge2/80 text-fg text-xs focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-fg/80">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-subtle absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface2 border border-edge2/80 text-fg text-xs focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in...' : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-edge">
          <p className="text-xs text-muted">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-accent-indigo font-semibold hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

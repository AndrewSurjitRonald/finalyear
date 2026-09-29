import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Mail, User, Briefcase, GraduationCap, AlertCircle, ArrowRight } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [profession, setProfession] = useState('Full-Stack Engineer');
  const [education, setEducation] = useState('Computer Science');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(email, password, fullName, profession, education);
      onNavigate('assessments');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full p-8 rounded-xl bg-surface border border-edge space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-lg bg-indigo-600 mx-auto flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-fg">Create CoFound Account</h2>
          <p className="text-xs text-muted">Join the explainable collaborative team platform</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-accent-rose text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-fg/80">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-subtle absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sarah Connor"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface2 border border-edge2/80 text-fg text-xs focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-fg/80">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-subtle absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface2 border border-edge2/80 text-fg text-xs focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-fg/80">Primary Profession / Role</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-subtle absolute left-3.5 top-3.5" />
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface2 border border-edge2/80 text-fg text-xs focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="Full-Stack Engineer">Full-Stack Engineer</option>
                <option value="ML Research Engineer">ML Research Engineer</option>
                <option value="Frontend Specialist">Frontend Specialist</option>
                <option value="Backend Architect">Backend Architect</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Product Manager">Product Manager</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
              </select>
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
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Creating Account...' : <>Complete Registration <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-edge">
          <p className="text-xs text-muted">
            Already registered?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-accent-indigo font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { saveUser } from '@/lib/auth';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.login(form);
      saveUser({
        name: response.name,
        email: response.email,
        token: response.token
      });
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] animate-rise">

        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-ink mb-2">Welcome back</h1>
          <p className="text-ink-60 text-base">Sign in to access your document workspace.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-ruby-light border border-ruby/20 text-ruby text-sm animate-pop">
            <span className="w-1.5 h-1.5 rounded-full bg-ruby shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="field-label">Email address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="field"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="field-label" style={{ marginBottom: 0 }}>Password</label>
              <button type="button" className="text-xs text-cobalt hover:underline">Forgot?</button>
            </div>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="field pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-40 hover:text-ink transition-colors"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 rounded-2xl text-base mt-2"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
              : <>Sign in <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-7 text-center text-sm text-ink-60">
          New to DocuMind?{' '}
          <Link to="/signup" className="text-cobalt font-semibold hover:underline">Create account</Link>
        </p>

      </div>
    </div>
  );
}
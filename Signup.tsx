import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2, Sparkles, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const RULES = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Number', test: (v: string) => /\d/.test(v) },
];

function StrengthBar({ password }: { password: string }) {
  const passed = RULES.filter(r => r.test(password)).length;
  const colors = ['bg-ruby', 'bg-amber', 'bg-emerald'];
  const labels = ['Weak', 'Fair', 'Strong'];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passed ? colors[passed - 1] : 'bg-ink-10'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-40">{passed > 0 ? labels[passed - 1] : ''}</span>
        <div className="flex gap-3">
          {RULES.map(r => (
            <span key={r.label} className={`text-xs flex items-center gap-1 transition-colors ${r.test(password) ? 'text-emerald' : 'text-ink-40'}`}>
              <Check className="w-3 h-3" /> {r.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (RULES.filter(r => r.test(form.password)).length < 2) { setError('Password is too weak.'); return; }
    setLoading(true);
    try {
      await api.signup({
        name: form.name,
        email: form.email,
        password: form.password
      });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      toast.error(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
           style={{ backgroundImage: 'radial-gradient(#141210 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.06] -translate-y-1/2 translate-x-1/2 pointer-events-none"
           style={{ background: 'radial-gradient(circle, #1B4FD8, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-[0.06] translate-y-1/2 -translate-x-1/2 pointer-events-none"
           style={{ background: 'radial-gradient(circle, #0D7A5F, transparent 70%)' }} />

      <div className="relative w-full max-w-md animate-rise">
        <Link to="/login" className="flex items-center gap-2 mb-8 group w-fit">
          <div className="w-9 h-9 rounded-xl bg-cobalt flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-ink">DocuMind</span>
        </Link>

        <div className="card p-8 shadow-float">
          <div className="mb-7">
            <h1 className="font-display text-2xl font-bold text-ink mb-1.5">Create your account</h1>
            <p className="text-ink-60 text-sm">Join DocuMind and start chatting with your documents.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-ruby-light border border-ruby/20 text-ruby text-sm animate-pop">
              <span className="w-1.5 h-1.5 rounded-full bg-ruby shrink-0" />{error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="field-label">Full name</label>
              <input type="text" name="name" value={form.name} onChange={onChange}
                     placeholder="Your full name" required className="field" />
            </div>
            <div>
              <label className="field-label">Email address</label>
              <input type="email" name="email" value={form.email} onChange={onChange}
                     placeholder="you@example.com" required className="field" />
            </div>
            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} name="password"
                       value={form.password} onChange={onChange}
                       placeholder="Create a strong password" required className="field pr-11" />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-40 hover:text-ink transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <StrengthBar password={form.password} />
            </div>
            <div>
              <label className="field-label">Confirm password</label>
              <input type="password" name="confirm" value={form.confirm} onChange={onChange}
                     placeholder="Re-enter password" required
                     className={`field ${form.confirm && form.confirm !== form.password ? 'border-ruby focus:border-ruby focus:shadow-none' : ''}`} />
              {form.confirm && form.confirm !== form.password && (
                <p className="mt-1.5 text-xs text-ruby">Passwords do not match</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl text-base mt-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                : <>Create account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-sm text-ink-60">
            Already have an account?{' '}
            <Link to="/login" className="text-cobalt font-semibold hover:underline">Sign in</Link>
          </p>
        </div>


      </div>
    </div>
  );
}
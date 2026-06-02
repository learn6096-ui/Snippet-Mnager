import { useState } from 'react';

interface LoginCardProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToSignup: () => void;
}

export default function LoginCard({ onLogin, onSwitchToSignup }: LoginCardProps) {
  const [email, setEmail] = useState('dev@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await onLogin(email, password);
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 w-full scale-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 mb-4 transition-transform hover:scale-110">
          <svg className="w-7 h-7 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-dark-100">Welcome back</h1>
        <p className="text-dark-400 mt-1 text-sm">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="fade-in-up" style={{ animationDelay: '100ms' }}>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
          <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className="input-field"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div className="fade-in-up" style={{ animationDelay: '150ms' }}>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Password</label>
          <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              className="input-field"
              placeholder="Enter your password"
              required
            />
          </div>
        </div>

        {error && (
          <div className="text-accent-red text-sm bg-accent-red/10 border border-accent-red/20 rounded-lg px-4 py-2.5 scale-in">
            {error}
          </div>
        )}

        <div className="fade-in-up" style={{ animationDelay: '200ms' }}>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3"
          >
            {isLoading ? (
              <div className="spinner w-4 h-4" />
            ) : null}
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>

      <p className="text-center text-dark-400 text-sm mt-6 fade-in-up" style={{ animationDelay: '250ms' }}>
        Don't have an account?{' '}
        <button onClick={onSwitchToSignup} className="text-accent-blue hover:underline font-medium transition-colors">
          Sign up
        </button>
      </p>
    </div>
  );
}

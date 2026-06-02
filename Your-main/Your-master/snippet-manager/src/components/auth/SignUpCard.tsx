import { useState } from 'react';

interface SignUpCardProps {
  onSignup: (username: string, email: string, password: string) => Promise<void>;
  onSwitchToLogin: () => void;
}

export default function SignUpCard({ onSignup, onSwitchToLogin }: SignUpCardProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await onSignup(username, email, password);
    } catch {
      setError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 w-full scale-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 mb-4 transition-transform hover:scale-110">
          <svg className="w-7 h-7 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-dark-100">Create account</h1>
        <p className="text-dark-400 mt-1 text-sm">Start managing your code snippets</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="fade-in-up" style={{ animationDelay: '50ms' }}>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            placeholder="devmaster"
            required
          />
        </div>

        <div className="fade-in-up" style={{ animationDelay: '100ms' }}>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="fade-in-up" style={{ animationDelay: '150ms' }}>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </div>

        <div className="fade-in-up" style={{ animationDelay: '200ms' }}>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
            placeholder="Repeat your password"
            required
          />
        </div>

        {error && (
          <div className="text-accent-red text-sm bg-accent-red/10 border border-accent-red/20 rounded-lg px-4 py-2.5 scale-in">
            {error}
          </div>
        )}

        <div className="fade-in-up" style={{ animationDelay: '250ms' }}>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3"
          >
            {isLoading ? (
              <div className="spinner w-4 h-4" />
            ) : null}
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </div>
      </form>

      <p className="text-center text-dark-400 text-sm mt-6 fade-in-up" style={{ animationDelay: '300ms' }}>
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="text-accent-blue hover:underline font-medium transition-colors">
          Sign in
        </button>
      </p>
    </div>
  );
}

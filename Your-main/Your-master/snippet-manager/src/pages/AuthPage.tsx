import { useState, useEffect } from 'react';
import LoginCard from '../components/auth/LoginCard';
import SignUpCard from '../components/auth/SignUpCard';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { login, signup } = useStore();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    navigate('/dashboard');
  };

  const handleSignup = async (username: string, email: string, password: string) => {
    await signup(username, email, password);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 noise-overlay">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.07]"
          style={{
            background: 'radial-gradient(circle, #58a6ff, transparent)',
            top: '10%',
            left: '15%',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.05]"
          style={{
            background: 'radial-gradient(circle, #bc8cff, transparent)',
            bottom: '15%',
            right: '10%',
            animation: 'float 10s ease-in-out infinite 2s',
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, #3fb950, transparent)',
            top: '50%',
            left: '50%',
            animation: 'float 12s ease-in-out infinite 4s',
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(88,166,255,0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(88,166,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className={`relative z-10 w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-lg shadow-accent-blue/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <span className="text-3xl font-bold gradient-text">SnipVCS</span>
          </div>
          <p className="text-dark-500 text-sm">Version-controlled code snippets</p>
        </div>

        {mode === 'login' ? (
          <LoginCard onLogin={handleLogin} onSwitchToSignup={() => setMode('signup')} />
        ) : (
          <SignUpCard onSignup={handleSignup} onSwitchToLogin={() => setMode('login')} />
        )}
      </div>
    </div>
  );
}

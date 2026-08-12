import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, AlertTriangle, Sparkles } from 'lucide-react';
import { loginAdmin, enterDemoMode } from '../authSlice';
import Input from '../../../shared/components/Input/Input';
import Button from '../../../shared/components/Button/Button';

export default function LoginForm() {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      dispatch(loginAdmin({ email, password }));
    }
  };

  const handleDemoClick = () => {
    dispatch(enterDemoMode());
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="admin@wattcharge.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
        />

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Sign In'}
        </Button>
      </form>

      <div className="relative flex py-4 items-center">
        <div className="flex-grow border-t border-white/5"></div>
        <span className="flex-shrink mx-4 text-appTextGray text-xs uppercase tracking-widest font-semibold">Or</span>
        <div className="flex-grow border-t border-white/5"></div>
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={handleDemoClick}
      >
        <Sparkles className="w-4 h-4 text-appSecondary" />
        Enter Demo Mode
      </Button>
    </div>
  );
}

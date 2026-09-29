import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Users, Sparkles, FolderKanban, BarChart3, FlaskConical,
  BrainCircuit, UserCheck, LogOut, Menu, X, Sun, Moon
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'discovery', label: 'Discover Teammates', icon: Users },
    { id: 'generator', label: 'Team Generator', icon: Sparkles },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'assessments', label: 'Assessments', icon: UserCheck },
    { id: 'explainability', label: 'Explainable AI', icon: BrainCircuit },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'research', label: 'Research Lab', icon: FlaskConical },
  ];

  const ThemeToggle = ({ className = '' }: { className?: string }) => (
    <button
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle color theme"
      className={`p-2 rounded-lg bg-surface3 hover:bg-edge text-muted hover:text-fg border border-edge transition ${className}`}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-edge">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentTab('landing')}
          >
            <div className="w-9 h-9 rounded-md bg-indigo-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="font-mono font-bold text-[13px] text-white tracking-tight">CF</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-fg tracking-tight">CoFound</span>
                <span className="badge-info">AI</span>
              </div>
              <p className="label-mono">Explainable Team Chemistry</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600/10 text-accent-indigo border border-brand-500/30 shadow-sm'
                      : 'text-muted hover:text-fg hover:bg-surface3'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-accent-indigo' : 'text-subtle'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right User Action */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentTab('profile')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface3 hover:bg-edge border border-edge text-fg text-xs font-medium transition"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-[10px]">
                    {user.profile?.full_name ? user.profile.full_name.charAt(0) : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user.profile?.full_name || user.email}</span>
                </button>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-lg bg-surface3 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 text-muted border border-edge transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('login')}
                  className="px-4 py-2 text-xs font-medium text-muted hover:text-fg transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentTab('register')}
                  className="btn-primary px-4 py-2 text-xs"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-muted hover:text-fg bg-surface3"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface2 border-b border-edge px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-brand-600/10 text-accent-indigo border border-brand-500/30'
                    : 'text-muted hover:bg-surface3'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
          <div className="pt-4 border-t border-edge">
            {user ? (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setCurrentTab('profile');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-sm text-fg"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.profile?.full_name ? user.profile.full_name.charAt(0) : 'U'}
                  </div>
                  <span>{user.profile?.full_name || user.email}</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setCurrentTab('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-medium text-fg bg-surface3 rounded-lg"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-medium text-white bg-brand-600 rounded-lg"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

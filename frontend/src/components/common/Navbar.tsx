import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Brain, Code2, Swords, BarChart3, Menu, X } from 'lucide-react';

const navItems = [
  { path: '/', label: '首页', icon: Brain, color: '#00f5ff' },
  { path: '/editor', label: '编辑器', icon: Code2, color: '#00f5ff' },
  { path: '/battle', label: '对战', icon: Swords, color: '#ff00ff' },
  { path: '/stats', label: '统计', icon: BarChart3, color: '#ffff00' }
];

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled 
          ? 'bg-[var(--cyber-bg-secondary)]/95 backdrop-blur-md border-b border-[var(--cyber-border)]'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--cyber-neon-cyan)]/20 to-[var(--cyber-neon-purple)]/20 border border-[var(--cyber-neon-cyan)] flex items-center justify-center"
          >
            <Brain size={22} className="text-[var(--cyber-neon-cyan)]" />
          </motion.div>
          <span className="font-display text-lg font-bold tracking-wider hidden sm:block">
            <span className="text-[var(--cyber-neon-cyan)]">NEURAL</span>
            <span className="text-[var(--cyber-neon-pink)]">ARENA</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-4 py-2 group"
              >
                <div className="flex items-center gap-2">
                  <Icon
                    size={16}
                    style={{ color: isActive ? item.color : 'var(--cyber-text-muted)' }}
                  />
                  <span
                    className={cn(
                      'font-mono text-sm transition-colors',
                      isActive
                        ? 'text-white'
                        : 'text-[var(--cyber-text-secondary)] group-hover:text-white'
                    )}
                  >
                    {item.label}
                  </span>
                </div>
                
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: item.color }}
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
        
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[var(--cyber-text-secondary)] hover:text-white"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[var(--cyber-bg-secondary)] border-b border-[var(--cyber-border)] overflow-hidden"
          >
            <div className="px-6 py-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded transition-colors',
                      isActive
                        ? 'bg-[var(--cyber-bg-tertiary)] text-white'
                        : 'text-[var(--cyber-text-secondary)] hover:bg-[var(--cyber-bg-tertiary)]/50 hover:text-white'
                    )}
                  >
                    <Icon size={18} style={{ color: item.color }} />
                    <span className="font-mono">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

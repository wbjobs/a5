import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Home from '@/pages/Home';
import Editor from '@/pages/Editor';
import Battle from '@/pages/Battle';
import Stats from '@/pages/Stats';
import Navbar from '@/components/common/Navbar';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/battle" element={<Battle />} />
        <Route path="/stats" element={<Stats />} />
        <Route 
          path="*" 
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-screen bg-[var(--cyber-bg-primary)] flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-8xl font-display font-bold text-[var(--cyber-neon-red)] mb-4"
                >
                  404
                </motion.div>
                <h2 className="font-display text-2xl font-bold text-white mb-2">页面未找到</h2>
                <p className="font-mono text-[var(--cyber-text-secondary)] mb-6">
                  你访问的页面不存在或已被移动
                </p>
                <Code2 size={64} className="text-[var(--cyber-neon-cyan)] mx-auto mb-4" />
              </div>
            </motion.div>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <div className={cn("min-h-screen bg-[var(--cyber-bg-primary)] text-white")}>
      <Navbar />
      <AnimatedRoutes />
    </div>
  );
}

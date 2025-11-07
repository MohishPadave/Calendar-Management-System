import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import Button from './Button';

const ThemeToggle: React.FC = () => {
  const { actualTheme, toggleTheme } = useTheme();

  const iconVariants = {
    initial: { scale: 0, rotate: -180, opacity: 0 },
    animate: { 
      scale: 1, 
      rotate: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25
      }
    },
    exit: { 
      scale: 0, 
      rotate: 180, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
      className="relative overflow-hidden p-2"
      animate={true}
    >
      <AnimatePresence mode="wait">
        {actualTheme === 'light' ? (
          <motion.svg
            key="moon"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </motion.svg>
        ) : (
          <motion.svg
            key="sun"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.svg>
        )}
      </AnimatePresence>
      
      {/* Ripple effect background */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        animate={{
          background: actualTheme === 'light' 
            ? ['rgba(59, 130, 246, 0)', 'rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0)']
            : ['rgba(251, 191, 36, 0)', 'rgba(251, 191, 36, 0.1)', 'rgba(251, 191, 36, 0)']
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </Button>
  );
};

export default ThemeToggle;
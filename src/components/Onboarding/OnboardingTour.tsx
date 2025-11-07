import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipStep {
  id: string;
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

interface OnboardingTourProps {
  onComplete: () => void;
}

const TOUR_STEPS: TooltipStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: '👋 Welcome to Your Calendar!',
    description: 'Let\'s take a quick tour of the features to help you get started.',
    position: 'bottom',
  },
  {
    id: 'create-button',
    target: '[data-tour="create-button"]',
    title: '➕ Create Events',
    description: 'Click here to create a new event. You can set the title, time, description, and color.',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'navigation',
    target: '[data-tour="navigation"]',
    title: '🗓️ Navigate Dates',
    description: 'Use these arrows to move between months, or click "Today" to jump to the current date.',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'view-selector',
    target: '[data-tour="view-selector"]',
    title: '👁️ Switch Views',
    description: 'Change between Month, Week, and Year views to see your schedule differently.',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'theme-toggle',
    target: '[data-tour="theme-toggle"]',
    title: '🌓 Dark Mode',
    description: 'Toggle between light and dark themes for comfortable viewing.',
    position: 'left',
    highlight: true,
  },
  {
    id: 'calendar-cell',
    target: '[data-tour="calendar-cell"]',
    title: '📝 Click to Create',
    description: 'Click any date on the calendar to quickly create an event for that day.',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'complete',
    target: 'body',
    title: '🎉 You\'re All Set!',
    description: 'You now know all the features. Start creating events and managing your schedule!',
    position: 'bottom',
  },
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(true);

  const step = TOUR_STEPS[currentStep];

  useEffect(() => {
    if (!step) return;

    const updatePosition = () => {
      const target = document.querySelector(step.target);
      if (!target) {
        // If target not found, center the tooltip
        setTooltipPosition({ 
          top: window.innerHeight / 2, 
          left: window.innerWidth / 2 
        });
        return;
      }

      const rect = target.getBoundingClientRect();
      const tooltipWidth = 320;
      const padding = 20;
      
      let top = rect.top + rect.height / 2;
      let left = rect.left + rect.width / 2;

      // Special handling for body element
      if (step.target === 'body') {
        top = window.innerHeight / 2;
        left = window.innerWidth / 2;
      } else {
        // Calculate position based on step.position
        switch (step.position) {
          case 'top':
            top = rect.top;
            left = rect.left + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left;
            // Don't clamp left position for 'left' tooltips
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right;
            // Don't clamp left position for 'right' tooltips
            break;
        }

        // Only clamp for top/bottom positions
        if (step.position === 'top' || step.position === 'bottom') {
          const maxLeft = window.innerWidth - tooltipWidth / 2 - padding;
          const minLeft = tooltipWidth / 2 + padding;
          left = Math.max(minLeft, Math.min(maxLeft, left));
        }

        // Clamp vertical position for all
        const maxTop = window.innerHeight - padding - 150;
        const minTop = padding + 100;
        top = Math.max(minTop, Math.min(maxTop, top));
      }

      setTooltipPosition({ top, left });

      // Add highlight to target (but not for body)
      if (step.highlight && step.target !== 'body') {
        target.classList.add('tour-highlight');
      }
    };

    // Initial position with a small delay to ensure DOM is ready
    setTimeout(updatePosition, 100);
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      
      // Remove highlight
      const target = document.querySelector(step.target);
      if (target) {
        target.classList.remove('tour-highlight');
      }
    };
  }, [currentStep, step]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  if (!step || !isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 bg-black/60 z-[9998]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Skip Button - Top Right */}
      <motion.button
        onClick={handleSkip}
        className="fixed top-6 right-6 z-[9999] px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Skip Tour ✕
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          className="fixed z-[9999] w-80 max-w-[calc(100vw-40px)]"
          style={{
            top: Math.max(20, Math.min(tooltipPosition.top, window.innerHeight - 300)),
            left: Math.max(20, Math.min(tooltipPosition.left, window.innerWidth - 340)),
            transform: 
              step.target === 'body' ? 'translate(-50%, -50%)' :
              step.position === 'top' ? 'translate(-50%, calc(-100% - 20px))' :
              step.position === 'bottom' ? 'translate(-50%, 20px)' :
              step.position === 'left' ? 'translate(calc(-100% - 20px), -50%)' :
              'translate(20px, -50%)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-5">
            {/* Progress */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex space-x-1">
                {TOUR_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-blue-500'
                        : index < currentStep
                        ? 'w-1.5 bg-blue-300'
                        : 'w-1.5 bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={handleSkip}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Skip tour
              </button>
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {step.description}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  currentStep === 0
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Previous
              </button>

              <span className="text-xs text-gray-500 dark:text-gray-400">
                {currentStep + 1} of {TOUR_STEPS.length}
              </span>

              <button
                onClick={handleNext}
                className="px-4 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>

          {/* Arrow pointer */}
          {step.target !== 'body' && (
            <div
              className={`absolute w-3 h-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transform rotate-45 ${
                step.position === 'top'
                  ? 'bottom-[-6px] left-1/2 -translate-x-1/2 border-b border-r'
                  : step.position === 'bottom'
                  ? 'top-[-6px] left-1/2 -translate-x-1/2 border-t border-l'
                  : step.position === 'left'
                  ? 'right-[-6px] top-1/2 -translate-y-1/2 border-t border-r'
                  : 'left-[-6px] top-1/2 -translate-y-1/2 border-b border-l'
              }`}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Global styles for highlights */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 9997 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5) !important;
          border-radius: 8px;
        }
      `}</style>
    </>
  );
};

export default OnboardingTour;

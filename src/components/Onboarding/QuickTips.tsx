import React from 'react';
import { motion } from 'framer-motion';

interface QuickTipsProps {
  isOpen: boolean;
  onClose: () => void;
}

const tips = [
  {
    icon: '➕',
    title: 'Create Events',
    description: 'Click the "Create" button or click any date on the calendar to quickly add an event.',
  },
  {
    icon: '✏️',
    title: 'Edit Events',
    description: 'Click on any event to view details, edit information, or delete it.',
  },
  {
    icon: '⏰',
    title: 'Find Free Time',
    description: 'Use the Free Time Finder in the sidebar to discover available slots in your schedule.',
  },
  {
    icon: '⚠️',
    title: 'Conflict Detection',
    description: 'The calendar automatically detects scheduling conflicts and suggests alternative times.',
  },
  {
    icon: '🗓️',
    title: 'Quick Navigation',
    description: 'Use arrow keys to navigate dates, or click the mini calendar for quick jumps.',
  },
  {
    icon: '👁️',
    title: 'Multiple Views',
    description: 'Switch between Month, Week, and Year views to see your schedule differently.',
  },
  {
    icon: '🎨',
    title: 'Color Coding',
    description: 'Assign colors to events for easy visual organization and categorization.',
  },
  {
    icon: '📊',
    title: 'Statistics',
    description: 'View event statistics and category breakdowns in the sidebar.',
  },
  {
    icon: '🌓',
    title: 'Dark Mode',
    description: 'Toggle between light and dark themes for comfortable viewing anytime.',
  },
  {
    icon: '⌨️',
    title: 'Keyboard Shortcuts',
    description: 'Use arrow keys to navigate, Enter to select, and Escape to close modals.',
  },
];

const QuickTips: React.FC<QuickTipsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              💡 Quick Tips & Features
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(80vh-120px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tips.map((tip, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                        {tip.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default QuickTips;

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConflictInfo, getConflictSeverity } from '@/utils/conflict.utils';
import { format } from 'date-fns';
import Button from '@/components/primitives/Button';

interface ConflictWarningProps {
  conflictInfo: ConflictInfo;
  onSelectSuggestedTime?: (time: Date) => void;
  onDismiss?: () => void;
  className?: string;
}

const ConflictWarning: React.FC<ConflictWarningProps> = ({
  conflictInfo,
  onSelectSuggestedTime,
  onDismiss,
  className = '',
}) => {
  if (!conflictInfo.hasConflict) return null;

  const severity = getConflictSeverity(conflictInfo);
  
  const severityStyles = {
    low: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    medium: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    high: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  };

  const iconStyles = {
    low: 'text-yellow-600 dark:text-yellow-400',
    medium: 'text-orange-600 dark:text-orange-400',
    high: 'text-red-600 dark:text-red-400',
  };

  const textStyles = {
    low: 'text-yellow-800 dark:text-yellow-200',
    medium: 'text-orange-800 dark:text-orange-200',
    high: 'text-red-800 dark:text-red-200',
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`rounded-lg border p-4 ${severityStyles[severity]} ${className}`}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex items-start space-x-3">
          {/* Warning Icon */}
          <motion.div
            className={`flex-shrink-0 ${iconStyles[severity]}`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
          >
            {severity === 'high' ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            {/* Conflict Message */}
            <motion.div
              className={`text-sm font-medium ${textStyles[severity]}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              ⚠️ Scheduling Conflict
            </motion.div>
            
            <motion.p
              className={`mt-1 text-sm ${textStyles[severity]}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {conflictInfo.conflictMessage}
            </motion.p>

            {/* Conflicting Events List */}
            {conflictInfo.conflictingEvents.length > 1 && (
              <motion.div
                className="mt-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.4 }}
              >
                <details className="group">
                  <summary className={`cursor-pointer text-xs ${textStyles[severity]} hover:underline`}>
                    View all {conflictInfo.conflictingEvents.length} conflicting events
                  </summary>
                  <motion.ul
                    className="mt-2 space-y-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {conflictInfo.conflictingEvents.map((event, index) => (
                      <motion.li
                        key={event.id}
                        className={`text-xs ${textStyles[severity]} flex items-center space-x-2`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: event.color }}
                        />
                        <span className="truncate">
                          {event.title} ({format(event.startDate, 'h:mm a')} - {format(event.endDate, 'h:mm a')})
                        </span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </details>
              </motion.div>
            )}

            {/* Suggested Alternative Times */}
            {conflictInfo.suggestedTimes.length > 0 && (
              <motion.div
                className="mt-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className={`text-xs font-medium ${textStyles[severity]} mb-2`}>
                  💡 Suggested alternative times:
                </p>
                <div className="flex flex-wrap gap-2">
                  {conflictInfo.suggestedTimes.map((time, index) => (
                    <motion.div
                      key={time.toISOString()}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectSuggestedTime?.(time)}
                        className={`text-xs px-2 py-1 ${
                          severity === 'high' 
                            ? 'hover:bg-red-100 dark:hover:bg-red-800/50' 
                            : severity === 'medium'
                            ? 'hover:bg-orange-100 dark:hover:bg-orange-800/50'
                            : 'hover:bg-yellow-100 dark:hover:bg-yellow-800/50'
                        }`}
                        animate={true}
                      >
                        {format(time, 'h:mm a')}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Dismiss Button */}
          {onDismiss && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="p-1 -mr-1"
                animate={true}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConflictWarning;
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarEvent } from './CalendarView.types';
import { 
  findFreeTimeSlots, 
  formatTimeSlot, 
  FreeTimeFinderResult,
  FreeTimeSlot 
} from '@/utils/conflict.utils';
import { format, addDays } from 'date-fns';
import Button from '@/components/primitives/Button';

interface FreeTimeFinderProps {
  events: CalendarEvent[];
  currentDate: Date;
  onTimeSlotSelect?: (slot: FreeTimeSlot) => void;
  onCreateEvent?: (startTime: Date, endTime: Date) => void;
  className?: string;
}

const FreeTimeFinder: React.FC<FreeTimeFinderProps> = ({
  events,
  currentDate,
  onTimeSlotSelect,
  onCreateEvent,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [highlightedSlots, setHighlightedSlots] = useState<FreeTimeSlot[]>([]);

  const freeTimeResult = useMemo(() => {
    return findFreeTimeSlots(events, selectedDate);
  }, [events, selectedDate]);

  const handleHighlightSlots = (slots: FreeTimeSlot[], type: string) => {
    setHighlightedSlots(slots);
    // Auto-collapse after 5 seconds
    setTimeout(() => setHighlightedSlots([]), 5000);
  };

  const handleSlotSelect = (slot: FreeTimeSlot) => {
    onTimeSlotSelect?.(slot);
    onCreateEvent?.(slot.start, slot.end);
  };

  const getTimeTypeIcon = (type: 'morning' | 'afternoon' | 'evening') => {
    switch (type) {
      case 'morning':
        return '🌅';
      case 'afternoon':
        return '☀️';
      case 'evening':
        return '🌆';
    }
  };

  const getTimeTypeColor = (type: 'morning' | 'afternoon' | 'evening') => {
    switch (type) {
      case 'morning':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      case 'afternoon':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'evening':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200';
    }
  };

  return (
    <motion.div
      className={`bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              🔍
            </motion.div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Free Time Finder
            </h3>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            animate={true}
          >
            <motion.svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </Button>
        </div>

        {/* Date Selector */}
        <div className="mt-3 flex items-center space-x-2">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Analyzing:</span>
          <select
            value={selectedDate.toDateString()}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="text-sm bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded px-2 py-1 focus-visible"
          >
            {Array.from({ length: 7 }, (_, i) => {
              const date = addDays(currentDate, i);
              return (
                <option key={date.toDateString()} value={date.toDateString()}>
                  {format(date, 'EEEE, MMM d')}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Longest Free Block */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (freeTimeResult.longestFreeBlock) {
                  handleHighlightSlots([freeTimeResult.longestFreeBlock], 'longest');
                }
              }}
              className="w-full p-3 h-auto flex flex-col items-start space-y-1 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800/30 dark:hover:to-emerald-800/30"
              animate={true}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">⏰</span>
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Longest Block
                </span>
              </div>
              {freeTimeResult.longestFreeBlock ? (
                <div className="text-xs text-green-700 dark:text-green-300">
                  {formatTimeSlot(freeTimeResult.longestFreeBlock)}
                </div>
              ) : (
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  No free blocks found
                </div>
              )}
            </Button>
          </motion.div>

          {/* Next Available Hour */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (freeTimeResult.nextAvailableHour) {
                  handleSlotSelect(freeTimeResult.nextAvailableHour);
                }
              }}
              className="w-full p-3 h-auto flex flex-col items-start space-y-1 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-800/30 dark:hover:to-cyan-800/30"
              animate={true}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">⚡</span>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Next Hour
                </span>
              </div>
              {freeTimeResult.nextAvailableHour ? (
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  {formatTimeSlot(freeTimeResult.nextAvailableHour)}
                </div>
              ) : (
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  No hour slots available
                </div>
              )}
            </Button>
          </motion.div>

          {/* Weekly Pattern */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleHighlightSlots(freeTimeResult.recurringWeeklyPattern, 'weekly');
              }}
              className="w-full p-3 h-auto flex flex-col items-start space-y-1 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30"
              animate={true}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">🔄</span>
                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Weekly Pattern
                </span>
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300">
                {freeTimeResult.recurringWeeklyPattern.length} recurring slots
              </div>
            </Button>
          </motion.div>
        </div>

        {/* Highlighted Slots Notification */}
        <AnimatePresence>
          {highlightedSlots.length > 0 && (
            <motion.div
              className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-primary-600 dark:text-primary-400">✨</span>
                <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
                  Highlighted Time Slots
                </span>
              </div>
              <div className="space-y-1">
                {highlightedSlots.map((slot, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between text-xs"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="text-primary-700 dark:text-primary-300">
                      {getTimeTypeIcon(slot.type)} {formatTimeSlot(slot)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSlotSelect(slot)}
                      className="text-xs px-2 py-1 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800/50"
                      animate={true}
                    >
                      Book
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="border-t border-neutral-200 dark:border-neutral-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 space-y-4">
              {/* All Free Slots */}
              <div>
                <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                  All Available Time Slots ({freeTimeResult.allFreeSlots.length})
                </h4>
                
                {freeTimeResult.allFreeSlots.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {freeTimeResult.allFreeSlots.map((slot, index) => (
                      <motion.div
                        key={index}
                        className={`p-3 rounded-lg border ${getTimeTypeColor(slot.type)}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span>{getTimeTypeIcon(slot.type)}</span>
                            <div>
                              <div className="text-sm font-medium">
                                {format(slot.start, 'h:mm a')} - {format(slot.end, 'h:mm a')}
                              </div>
                              <div className="text-xs opacity-75">
                                {Math.floor(slot.duration / 60)}h {slot.duration % 60}m
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSlotSelect(slot)}
                            className="text-xs px-2 py-1"
                            animate={true}
                          >
                            Book
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    className="text-center py-8 text-neutral-500 dark:text-neutral-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-sm">No free time slots found for this day</p>
                    <p className="text-xs mt-1">Try selecting a different date</p>
                  </motion.div>
                )}
              </div>

              {/* Weekly Recurring Patterns */}
              {freeTimeResult.recurringWeeklyPattern.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                    🔄 Recurring Weekly Patterns
                  </h4>
                  <div className="space-y-2">
                    {freeTimeResult.recurringWeeklyPattern.map((slot, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-700 rounded-lg"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{getTimeTypeIcon(slot.type)}</span>
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            {format(slot.start, 'h:mm a')} - {format(slot.end, 'h:mm a')}
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            (Available 4+ days/week)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSlotSelect(slot)}
                          className="text-xs px-2 py-1"
                          animate={true}
                        >
                          Use Pattern
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FreeTimeFinder;
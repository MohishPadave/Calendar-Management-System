import React, { memo, useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CalendarEvent } from './CalendarView.types';
import { getOverlappingEvents } from '@/utils/event.utils';
import { 
  formatDate, 
  isDateInCurrentMonth, 
  isDateToday, 
  isDateSame 
} from '@/utils/date.utils';

interface CalendarCellProps {
  date: Date;
  currentMonth: Date;
  events: CalendarEvent[];
  selectedDate: Date | null;
  isSelected: boolean;
  isFocused: boolean;
  maxVisibleEvents?: number;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onCellFocus: () => void;
  allEvents?: CalendarEvent[];
}

const cellVariants: Variants = {
  initial: { scale: 1, opacity: 1 },
  hover: { 
    scale: 1.02,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 25 
    }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  },
  focus: {
    scale: 1.01,
    transition: { duration: 0.2 }
  }
};

const eventVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      type: "spring",
      stiffness: 500,
      damping: 30
    }
  }),
  hover: {
    scale: 1.05,
    y: -2,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

const todayIndicatorVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
      delay: 0.2
    }
  },
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const CalendarCell: React.FC<CalendarCellProps> = memo(({
  date,
  currentMonth,
  events,
  selectedDate,
  isSelected,
  isFocused,
  maxVisibleEvents = 3,
  onDateClick,
  onEventClick,
  onCellFocus,
  allEvents = [],
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Detect conflicting events
  const conflictingEvents = useMemo(() => {
    const conflicts = new Set<string>();
    events.forEach(event => {
      const overlapping = getOverlappingEvents(allEvents, event);
      if (overlapping.length > 0) {
        conflicts.add(event.id);
        overlapping.forEach(overlap => conflicts.add(overlap.id));
      }
    });
    return conflicts;
  }, [events, allEvents]);
  const isCurrentMonth = isDateInCurrentMonth(date, currentMonth);
  const isToday = isDateToday(date);
  const dayNumber = formatDate(date, 'd');
  
  const visibleEvents = events.slice(0, maxVisibleEvents);
  const hiddenEventsCount = Math.max(0, events.length - maxVisibleEvents);

  const handleCellClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onDateClick(date);
  }, [date, onDateClick]);

  const handleEventClick = useCallback((event: React.MouseEvent, calendarEvent: CalendarEvent) => {
    event.stopPropagation();
    onEventClick(calendarEvent);
  }, [onEventClick]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onDateClick(date);
    }
  }, [date, onDateClick]);

  const cellClasses = `
    relative h-full min-h-[120px] border-r border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f1f1f] cursor-pointer transition-all duration-150 flex flex-col
    ${!isCurrentMonth ? 'bg-gray-50 dark:bg-[#2d2d2d] text-gray-400 dark:text-gray-600' : 'hover:bg-gray-50 dark:hover:bg-[#2d2d2d]'}
    ${isToday ? 'bg-blue-50 dark:bg-blue-900/10' : ''}
    ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
    ${isFocused ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-inset' : ''}
  `;

  return (
    <motion.div
      className={cellClasses}
      onClick={handleCellClick}
      onFocus={onCellFocus}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={isFocused ? 0 : -1}
      role="gridcell"
      aria-label={`${formatDate(date, 'EEEE, MMMM d, yyyy')}${events.length > 0 ? `, ${events.length} event${events.length === 1 ? '' : 's'}` : ''}`}
      aria-selected={isSelected}
      variants={cellVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      animate={isFocused ? "focus" : "initial"}
      layout
      data-tour={isToday ? "calendar-cell" : undefined}
    >
      {/* Date number */}
      <div className="flex items-start justify-start p-2">
        {isToday ? (
          <motion.span 
            className="bg-[#1a73e8] dark:bg-[#8ab4f8] text-white dark:text-[#202124] rounded-full w-7 h-7 flex items-center justify-center text-xs font-medium"
            variants={todayIndicatorVariants}
            initial="initial"
            animate="animate"
          >
            {dayNumber}
          </motion.span>
        ) : (
          <span 
            className={`text-xs font-normal px-2 py-1 ${
              !isCurrentMonth 
                ? 'text-gray-400 dark:text-gray-600' 
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {dayNumber}
          </span>
        )}
      </div>

      {/* Events */}
      <div className="px-1 pb-1 space-y-0.5 flex-1 overflow-hidden">
        <AnimatePresence>
          {visibleEvents.map((event, index) => (
            <motion.div
              key={event.id}
              className={`text-xs px-1.5 py-0.5 rounded text-left truncate cursor-pointer transition-all duration-150 hover:opacity-80 ${
                conflictingEvents.has(event.id) ? 'ring-1 ring-red-400' : ''
              }`}
              style={{ 
                backgroundColor: event.color,
                color: '#fff'
              }}
              onClick={(e) => handleEventClick(e, event)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onEventClick(event);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Event: ${event.title}${conflictingEvents.has(event.id) ? ' (Has conflicts)' : ''}`}
              variants={eventVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              custom={index}
              layout
            >
              <span className="font-medium text-[11px] leading-tight">
                {event.title}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {hiddenEventsCount > 0 && (
          <motion.div
            className="text-[11px] text-gray-600 dark:text-gray-400 px-1.5 py-0.5 cursor-pointer hover:underline"
            onClick={handleCellClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: visibleEvents.length * 0.1 + 0.2 }}
          >
            +{hiddenEventsCount} more
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

CalendarCell.displayName = 'CalendarCell';

export default CalendarCell;
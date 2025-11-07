import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarEvent } from './CalendarView.types';
import { 
  format, 
  startOfYear, 
  endOfYear, 
  eachMonthOfInterval, 
  startOfMonth,
  endOfMonth,
  getMonthDays,
  isDateSame,
  isDateToday,
  isDateInCurrentMonth
} from '@/utils/date.utils';
import { filterEventsByDate } from '@/utils/event.utils';

interface YearViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onMonthClick: (date: Date) => void;
}

const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const YearView: React.FC<YearViewProps> = memo(({
  currentDate,
  events,
  selectedDate,
  onDateClick,
  onEventClick,
  onMonthClick,
}) => {
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const eventsByMonth = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    
    months.forEach(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthEvents = events.filter(event => 
        event.startDate >= monthStart && event.startDate <= monthEnd
      );
      grouped.set(month.toDateString(), monthEvents);
    });
    
    return grouped;
  }, [events, months]);

  const renderMiniMonth = (month: Date, index: number) => {
    const monthDays = getMonthDays(month);
    const monthEvents = eventsByMonth.get(month.toDateString()) || [];
    const eventCountByDate = new Map<string, number>();
    
    monthEvents.forEach(event => {
      const dateKey = event.startDate.toDateString();
      eventCountByDate.set(dateKey, (eventCountByDate.get(dateKey) || 0) + 1);
    });

    return (
      <motion.div
        key={month.toDateString()}
        className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 hover:shadow-md dark:hover:shadow-black/20 transition-all duration-200 cursor-pointer"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          delay: index * 0.05, 
          type: "spring", 
          stiffness: 300, 
          damping: 25 
        }}
        whileHover={{ scale: 1.02, y: -2 }}
        onClick={() => onMonthClick(month)}
      >
        {/* Month Header */}
        <div className="text-center mb-2">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {format(month, 'MMM')}
          </h3>
          <div className="flex items-center justify-center space-x-1 mt-1">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {monthEvents.length} events
            </span>
            {monthEvents.length > 0 && (
              <motion.div
                className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-px mb-1">
          {WEEKDAYS_SHORT.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px">
          {monthDays.map((date) => {
            const isCurrentMonth = isDateInCurrentMonth(date, month);
            const isToday = isDateToday(date);
            const isSelected = selectedDate ? isDateSame(date, selectedDate) : false;
            const eventCount = eventCountByDate.get(date.toDateString()) || 0;

            return (
              <motion.div
                key={date.toDateString()}
                className={`
                  relative aspect-square flex items-center justify-center text-xs cursor-pointer rounded-sm
                  ${!isCurrentMonth 
                    ? 'text-neutral-300 dark:text-neutral-600' 
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }
                  ${isToday ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-bold' : ''}
                  ${isSelected ? 'bg-primary-200 dark:bg-primary-800 text-primary-800 dark:text-primary-200' : ''}
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  onDateClick(date);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">
                  {format(date, 'd')}
                </span>
                
                {/* Event Indicator */}
                {eventCount > 0 && (
                  <motion.div
                    className="absolute bottom-0 right-0 w-1 h-1 bg-primary-500 dark:bg-primary-400 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  />
                )}
                
                {eventCount > 3 && (
                  <motion.div
                    className="absolute top-0 right-0 w-1 h-1 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="min-h-full bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Year Header */}
      <motion.div
        className="p-6 border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-center">
          <motion.h2
            className="text-3xl font-bold text-neutral-900 dark:text-neutral-100"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            {format(currentDate, 'yyyy')}
          </motion.h2>
          <motion.p
            className="text-sm text-neutral-600 dark:text-neutral-400 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {events.length} events this year • Click any month to view details
          </motion.p>
        </div>
      </motion.div>

      {/* Months Grid */}
      <div className="p-6 overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {months.map((month, index) => renderMiniMonth(month, index))}
        </div>
      </div>
    </motion.div>
  );
});

YearView.displayName = 'YearView';

export default YearView;
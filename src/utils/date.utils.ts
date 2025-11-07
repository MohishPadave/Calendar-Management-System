import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addYears,
  subYears,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  startOfDay,
  endOfDay,
  isWithinInterval,
  parseISO,
  formatISO,
  addMinutes,
  differenceInMinutes,
  isBefore,
  isAfter,
} from 'date-fns';

export { 
  format,
  startOfDay, 
  endOfDay, 
  startOfYear, 
  endOfYear, 
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth
};

export const formatDate = (date: Date, formatStr: string): string => {
  return format(date, formatStr);
};

export const getMonthDays = (date: Date): Date[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
};

export const getWeekDays = (date: Date): Date[] => {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
  
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
};

export const isDateInCurrentMonth = (date: Date, currentMonth: Date): boolean => {
  return isSameMonth(date, currentMonth);
};

export const isDateToday = (date: Date): boolean => {
  return isToday(date);
};

export const isDateSame = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};

export const navigateMonth = (date: Date, direction: 'prev' | 'next'): Date => {
  return direction === 'prev' ? subMonths(date, 1) : addMonths(date, 1);
};

export const navigateWeek = (date: Date, direction: 'prev' | 'next'): Date => {
  return direction === 'prev' ? subWeeks(date, 1) : addWeeks(date, 1);
};

export const navigateYear = (date: Date, direction: 'prev' | 'next'): Date => {
  return direction === 'prev' ? subYears(date, 1) : addYears(date, 1);
};

export const getTimeSlots = (intervalMinutes: number = 60): string[] => {
  const slots: string[] = [];
  const startTime = new Date();
  startTime.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 24 * (60 / intervalMinutes); i++) {
    const time = addMinutes(startTime, i * intervalMinutes);
    slots.push(format(time, 'HH:mm'));
  }
  
  return slots;
};

export const getEventPosition = (
  startDate: Date,
  endDate: Date,
  dayStart: Date,
  slotHeight: number = 60,
  intervalMinutes: number = 60
): { top: number; height: number } => {
  const dayStartTime = startOfDay(dayStart);
  const dayEndTime = endOfDay(dayStart);
  
  const eventStart = isBefore(startDate, dayStartTime) ? dayStartTime : startDate;
  const eventEnd = isAfter(endDate, dayEndTime) ? dayEndTime : endDate;
  
  const startMinutes = differenceInMinutes(eventStart, dayStartTime);
  const durationMinutes = differenceInMinutes(eventEnd, eventStart);
  
  const top = (startMinutes / intervalMinutes) * slotHeight;
  const height = Math.max((durationMinutes / intervalMinutes) * slotHeight, 20);
  
  return { top, height };
};

export const isEventInDateRange = (
  event: { startDate: Date; endDate: Date },
  startDate: Date,
  endDate: Date
): boolean => {
  return isWithinInterval(event.startDate, { start: startDate, end: endDate }) ||
         isWithinInterval(event.endDate, { start: startDate, end: endDate }) ||
         (isBefore(event.startDate, startDate) && isAfter(event.endDate, endDate));
};

export const createDateFromTimeString = (date: Date, timeString: string): Date => {
  const timeParts = timeString.split(':');
  const hours = parseInt(timeParts[0] || '0', 10);
  const minutes = parseInt(timeParts[1] || '0', 10);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};

export const formatEventTime = (startDate: Date, endDate: Date): string => {
  if (isSameDay(startDate, endDate)) {
    return `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`;
  }
  return `${format(startDate, 'MMM d, HH:mm')} - ${format(endDate, 'MMM d, HH:mm')}`;
};

export const serializeDate = (date: Date): string => {
  return formatISO(date);
};

export const deserializeDate = (dateString: string): Date => {
  return parseISO(dateString);
};

export const getToday = (): Date => {
  return new Date();
};

export const clampDate = (date: Date, min?: Date, max?: Date): Date => {
  if (min && isBefore(date, min)) return min;
  if (max && isAfter(date, max)) return max;
  return date;
};
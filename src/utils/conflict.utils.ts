import { CalendarEvent } from '@/components/Calendar/CalendarView.types';
import { 
  isWithinInterval, 
  areIntervalsOverlapping, 
  addMinutes, 
  addHours,
  startOfDay,
  endOfDay,
  format,
  isSameDay,
  differenceInMinutes,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval
} from 'date-fns';

export interface ConflictInfo {
  hasConflict: boolean;
  conflictingEvents: CalendarEvent[];
  conflictMessage: string;
  suggestedTimes: Date[];
}

export interface FreeTimeSlot {
  start: Date;
  end: Date;
  duration: number; // in minutes
  type: 'morning' | 'afternoon' | 'evening';
}

export interface FreeTimeFinderResult {
  longestFreeBlock: FreeTimeSlot | null;
  nextAvailableHour: FreeTimeSlot | null;
  recurringWeeklyPattern: FreeTimeSlot[];
  allFreeSlots: FreeTimeSlot[];
}

/**
 * Detects conflicts between a new event and existing events
 */
export const detectEventConflicts = (
  newEvent: Omit<CalendarEvent, 'id'>,
  existingEvents: CalendarEvent[],
  excludeEventId?: string
): ConflictInfo => {
  const conflictingEvents = existingEvents.filter(event => {
    if (excludeEventId && event.id === excludeEventId) {
      return false;
    }

    return areIntervalsOverlapping(
      { start: newEvent.startDate, end: newEvent.endDate },
      { start: event.startDate, end: event.endDate },
      { inclusive: false }
    );
  });

  const hasConflict = conflictingEvents.length > 0;
  
  let conflictMessage = '';
  if (hasConflict && conflictingEvents.length > 0) {
    const firstConflict = conflictingEvents[0];
    if (firstConflict) {
      const timeRange = `${format(firstConflict.startDate, 'h:mm a')}–${format(firstConflict.endDate, 'h:mm a')}`;
      
      if (conflictingEvents.length === 1) {
        conflictMessage = `You already have "${firstConflict.title}" from ${timeRange}`;
      } else {
        conflictMessage = `You have ${conflictingEvents.length} conflicting events starting with "${firstConflict.title}" at ${timeRange}`;
      }
    }
  }

  const suggestedTimes = hasConflict 
    ? generateAlternativeTimeSlots(newEvent, existingEvents, excludeEventId)
    : [];

  return {
    hasConflict,
    conflictingEvents,
    conflictMessage,
    suggestedTimes,
  };
};

/**
 * Generates alternative time slots when conflicts are detected
 */
export const generateAlternativeTimeSlots = (
  newEvent: Omit<CalendarEvent, 'id'>,
  existingEvents: CalendarEvent[],
  excludeEventId?: string
): Date[] => {
  const eventDuration = differenceInMinutes(newEvent.endDate, newEvent.startDate);
  const eventDate = startOfDay(newEvent.startDate);
  const suggestions: Date[] = [];
  
  // Business hours: 8 AM to 6 PM
  const businessStart = new Date(eventDate);
  businessStart.setHours(8, 0, 0, 0);
  const businessEnd = new Date(eventDate);
  businessEnd.setHours(18, 0, 0, 0);

  // Try every 30-minute slot during business hours
  let currentSlot = new Date(businessStart);
  
  while (currentSlot < businessEnd) {
    const slotEnd = addMinutes(currentSlot, eventDuration);
    
    if (slotEnd <= businessEnd) {
      const testEvent = {
        ...newEvent,
        startDate: new Date(currentSlot),
        endDate: new Date(slotEnd),
      };
      
      const conflicts = detectEventConflicts(testEvent, existingEvents, excludeEventId);
      
      if (!conflicts.hasConflict) {
        suggestions.push(new Date(currentSlot));
        
        // Limit to 3 suggestions
        if (suggestions.length >= 3) {
          break;
        }
      }
    }
    
    currentSlot = addMinutes(currentSlot, 30);
  }

  return suggestions;
};

/**
 * Finds free time slots for productivity planning
 */
export const findFreeTimeSlots = (
  events: CalendarEvent[],
  targetDate: Date,
  minDuration: number = 60 // minimum duration in minutes
): FreeTimeFinderResult => {
  const dayStart = startOfDay(targetDate);
  const dayEnd = endOfDay(targetDate);
  
  // Business hours: 8 AM to 6 PM
  const businessStart = new Date(dayStart);
  businessStart.setHours(8, 0, 0, 0);
  const businessEnd = new Date(dayStart);
  businessEnd.setHours(18, 0, 0, 0);

  // Get events for the target date
  const dayEvents = events
    .filter(event => isSameDay(event.startDate, targetDate))
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const freeSlots: FreeTimeSlot[] = [];
  let currentTime = new Date(businessStart);

  // Find gaps between events
  for (const event of dayEvents) {
    const eventStart = event.startDate < businessStart ? businessStart : event.startDate;
    const eventEnd = event.endDate > businessEnd ? businessEnd : event.endDate;

    // Check for free time before this event
    if (currentTime < eventStart) {
      const duration = differenceInMinutes(eventStart, currentTime);
      if (duration >= minDuration) {
        freeSlots.push({
          start: new Date(currentTime),
          end: new Date(eventStart),
          duration,
          type: getTimeOfDayType(currentTime),
        });
      }
    }

    currentTime = eventEnd > currentTime ? eventEnd : currentTime;
  }

  // Check for free time after the last event
  if (currentTime < businessEnd) {
    const duration = differenceInMinutes(businessEnd, currentTime);
    if (duration >= minDuration) {
      freeSlots.push({
        start: new Date(currentTime),
        end: new Date(businessEnd),
        duration,
        type: getTimeOfDayType(currentTime),
      });
    }
  }

  // Find longest free block
  const longestFreeBlock = freeSlots.reduce((longest, current) => {
    return !longest || current.duration > longest.duration ? current : longest;
  }, null as FreeTimeSlot | null);

  // Find next available 1-hour slot
  const nextAvailableHour = freeSlots.find(slot => slot.duration >= 60) || null;

  // Find recurring weekly pattern
  const recurringWeeklyPattern = findRecurringWeeklyPattern(events, targetDate);

  return {
    longestFreeBlock,
    nextAvailableHour,
    recurringWeeklyPattern,
    allFreeSlots: freeSlots,
  };
};

/**
 * Finds recurring weekly free time patterns
 */
export const findRecurringWeeklyPattern = (
  events: CalendarEvent[],
  referenceDate: Date
): FreeTimeSlot[] => {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 }); // Sunday
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const recurringSlots: FreeTimeSlot[] = [];

  // Check each day of the week for consistent free time
  const timeSlots = [
    { start: 9, end: 10, label: '9-10 AM' },
    { start: 10, end: 11, label: '10-11 AM' },
    { start: 11, end: 12, label: '11 AM-12 PM' },
    { start: 14, end: 15, label: '2-3 PM' },
    { start: 15, end: 16, label: '3-4 PM' },
    { start: 16, end: 17, label: '4-5 PM' },
  ];

  for (const timeSlot of timeSlots) {
    let availableDays = 0;
    let sampleSlot: FreeTimeSlot | null = null;

    for (const day of weekDays) {
      const slotStart = new Date(day);
      slotStart.setHours(timeSlot.start, 0, 0, 0);
      const slotEnd = new Date(day);
      slotEnd.setHours(timeSlot.end, 0, 0, 0);

      const hasConflict = events.some(event =>
        areIntervalsOverlapping(
          { start: slotStart, end: slotEnd },
          { start: event.startDate, end: event.endDate },
          { inclusive: false }
        )
      );

      if (!hasConflict) {
        availableDays++;
        if (!sampleSlot) {
          sampleSlot = {
            start: slotStart,
            end: slotEnd,
            duration: 60,
            type: getTimeOfDayType(slotStart),
          };
        }
      }
    }

    // If available 4+ days a week, consider it a recurring pattern
    if (availableDays >= 4 && sampleSlot) {
      recurringSlots.push(sampleSlot);
    }
  }

  return recurringSlots;
};

/**
 * Determines the time of day type for a given time
 */
const getTimeOfDayType = (time: Date): 'morning' | 'afternoon' | 'evening' => {
  const hour = time.getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

/**
 * Formats a time slot for display
 */
export const formatTimeSlot = (slot: FreeTimeSlot): string => {
  const startTime = format(slot.start, 'h:mm a');
  const endTime = format(slot.end, 'h:mm a');
  const duration = Math.floor(slot.duration / 60);
  const minutes = slot.duration % 60;
  
  let durationText = '';
  if (duration > 0) {
    durationText += `${duration}h`;
  }
  if (minutes > 0) {
    durationText += `${minutes}m`;
  }
  
  return `${startTime} - ${endTime} (${durationText})`;
};

/**
 * Gets conflict severity level
 */
export const getConflictSeverity = (conflictInfo: ConflictInfo): 'low' | 'medium' | 'high' => {
  if (!conflictInfo.hasConflict) return 'low';
  
  const conflictCount = conflictInfo.conflictingEvents.length;
  if (conflictCount >= 3) return 'high';
  if (conflictCount >= 2) return 'medium';
  return 'low';
};
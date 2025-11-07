import { CalendarEvent } from '@/components/Calendar/CalendarView.types';
import { isEventInDateRange, isDateSame, startOfDay, endOfDay } from './date.utils';

export const filterEventsByDate = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  
  return events.filter(event => 
    isEventInDateRange(event, dayStart, dayEnd)
  );
};

export const filterEventsByDateRange = (
  events: CalendarEvent[], 
  startDate: Date, 
  endDate: Date
): CalendarEvent[] => {
  return events.filter(event => 
    isEventInDateRange(event, startDate, endDate)
  );
};

export const sortEventsByStartTime = (events: CalendarEvent[]): CalendarEvent[] => {
  return [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
};

export const groupEventsByDate = (events: CalendarEvent[]): Map<string, CalendarEvent[]> => {
  const grouped = new Map<string, CalendarEvent[]>();
  
  events.forEach(event => {
    const dateKey = event.startDate.toDateString();
    const existing = grouped.get(dateKey) || [];
    grouped.set(dateKey, [...existing, event]);
  });
  
  // Sort events within each day
  grouped.forEach((dayEvents, key) => {
    grouped.set(key, sortEventsByStartTime(dayEvents));
  });
  
  return grouped;
};

export const getOverlappingEvents = (
  events: CalendarEvent[], 
  targetEvent: CalendarEvent
): CalendarEvent[] => {
  return events.filter(event => {
    if (event.id === targetEvent.id) return false;
    
    return (
      (targetEvent.startDate >= event.startDate && targetEvent.startDate < event.endDate) ||
      (targetEvent.endDate > event.startDate && targetEvent.endDate <= event.endDate) ||
      (targetEvent.startDate <= event.startDate && targetEvent.endDate >= event.endDate)
    );
  });
};

export interface LayoutEvent extends CalendarEvent {
  width: number;
  left: number;
}

export const calculateEventLayout = (
  events: CalendarEvent[]
): LayoutEvent[] => {
  const sortedEvents = sortEventsByStartTime(events);
  const columns: Array<CalendarEvent[]> = [];
  
  sortedEvents.forEach(event => {
    let placed = false;
    
    // Try to place in existing column
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      if (!column) continue;
      
      const lastEventInColumn = column[column.length - 1];
      
      if (!lastEventInColumn || event.startDate >= lastEventInColumn.endDate) {
        column.push(event);
        placed = true;
        break;
      }
    }
    
    // Create new column if couldn't place
    if (!placed) {
      columns.push([event]);
    }
  });
  
  // Calculate layout properties
  const layoutEvents: LayoutEvent[] = [];
  
  columns.forEach((column, columnIndex) => {
    column.forEach(event => {
      layoutEvents.push({
        ...event,
        width: 100 / columns.length,
        left: (columnIndex * 100) / columns.length,
      });
    });
  });
  
  return layoutEvents;
};

export const validateEvent = (event: Partial<CalendarEvent>): string[] => {
  const errors: string[] = [];
  
  if (!event.title?.trim()) {
    errors.push('Title is required');
  }
  
  if (event.title && event.title.length > 100) {
    errors.push('Title must be 100 characters or less');
  }
  
  if (event.description && event.description.length > 500) {
    errors.push('Description must be 500 characters or less');
  }
  
  if (!event.startDate) {
    errors.push('Start date is required');
  }
  
  if (!event.endDate) {
    errors.push('End date is required');
  }
  
  if (event.startDate && event.endDate && event.startDate >= event.endDate) {
    errors.push('End date must be after start date');
  }
  
  return errors;
};

export const createEvent = (
  data: Omit<CalendarEvent, 'id'> & { id?: string }
): CalendarEvent => {
  const event: CalendarEvent = {
    id: data.id || generateEventId(),
    title: data.title.trim(),
    startDate: data.startDate,
    endDate: data.endDate,
    color: data.color || '#3b82f6',
    category: data.category || 'Other',
  };
  
  if (data.description !== undefined) {
    event.description = data.description.trim();
  }
  
  return event;
};

export const updateEvent = (
  event: CalendarEvent, 
  updates: Partial<CalendarEvent>
): CalendarEvent => {
  const updatedEvent: CalendarEvent = {
    ...event,
    ...updates,
    title: updates.title?.trim() || event.title,
  };
  
  if (updates.description !== undefined) {
    updatedEvent.description = updates.description.trim();
  }
  
  return updatedEvent;
};

export const generateEventId = (): string => {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getEventsByCategory = (
  events: CalendarEvent[], 
  category: string
): CalendarEvent[] => {
  return events.filter(event => event.category === category);
};

export const searchEvents = (
  events: CalendarEvent[], 
  query: string
): CalendarEvent[] => {
  const lowercaseQuery = query.toLowerCase().trim();
  
  if (!lowercaseQuery) return events;
  
  return events.filter(event => 
    event.title.toLowerCase().includes(lowercaseQuery) ||
    event.description?.toLowerCase().includes(lowercaseQuery) ||
    event.category?.toLowerCase().includes(lowercaseQuery)
  );
};

export const getEventDuration = (event: CalendarEvent): number => {
  return event.endDate.getTime() - event.startDate.getTime();
};

export const isAllDayEvent = (event: CalendarEvent): boolean => {
  const start = event.startDate;
  const end = event.endDate;
  
  return (
    start.getHours() === 0 && 
    start.getMinutes() === 0 && 
    end.getHours() === 23 && 
    end.getMinutes() === 59
  );
};

export const cloneEvent = (event: CalendarEvent): CalendarEvent => {
  return {
    ...event,
    id: generateEventId(),
    startDate: new Date(event.startDate),
    endDate: new Date(event.endDate),
  };
};
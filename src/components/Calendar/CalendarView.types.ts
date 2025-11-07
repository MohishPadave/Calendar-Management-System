export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  color: string;
  category: string;
}

export interface CalendarViewProps {
  events: CalendarEvent[];
  onEventAdd: (event: CalendarEvent) => void;
  onEventUpdate: (id: string, updates: Partial<CalendarEvent>) => void;
  onEventDelete: (id: string) => void;
  initialView?: 'month' | 'week' | 'year';
  initialDate?: Date;
}

export type CalendarView = 'month' | 'week' | 'year';

export interface CalendarState {
  currentDate: Date;
  view: CalendarView;
  selectedDate: Date | null;
  selectedEvent: CalendarEvent | null;
  isEventModalOpen: boolean;
  focusedCell: { row: number; col: number } | null;
}

export interface EventFormData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  color: string;
  category: string;
}

export const EVENT_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
] as const;

export const EVENT_CATEGORIES = [
  'Work',
  'Personal',
  'Meeting',
  'Appointment',
  'Reminder',
  'Holiday',
  'Other',
] as const;

export type EventColor = typeof EVENT_COLORS[number];
export type EventCategory = typeof EVENT_CATEGORIES[number];
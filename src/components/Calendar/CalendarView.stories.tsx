import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import CalendarView from './CalendarView';
import { CalendarEvent } from './CalendarView.types';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { addDays, addHours, subDays, startOfMonth, endOfMonth } from 'date-fns';

const meta: Meta<typeof CalendarView> = {
  title: 'Components/CalendarView',
  component: CalendarView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A production-grade calendar component with month and week views, event management, and full accessibility support.',
      },
    },
  },
  argTypes: {
    initialView: {
      control: { type: 'radio' },
      options: ['month', 'week'],
      description: 'Initial calendar view mode',
    },
    initialDate: {
      control: { type: 'date' },
      description: 'Initial date to display',
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="light">
        <div style={{ height: '100vh', padding: '0' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CalendarView>;

// Sample events for stories
const createSampleEvents = (): CalendarEvent[] => {
  const today = new Date();
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly team sync and planning session',
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      color: '#3b82f6',
      category: 'Work',
    },
    {
      id: '2',
      title: 'Lunch with Client',
      description: 'Business lunch at downtown restaurant',
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 30),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      color: '#10b981',
      category: 'Meeting',
    },
    {
      id: '3',
      title: 'Doctor Appointment',
      description: 'Annual checkup',
      startDate: addDays(today, 1),
      endDate: addHours(addDays(today, 1), 1),
      color: '#ef4444',
      category: 'Personal',
    },
    {
      id: '4',
      title: 'Project Deadline',
      description: 'Final submission for Q4 project',
      startDate: addDays(today, 3),
      endDate: addHours(addDays(today, 3), 2),
      color: '#f59e0b',
      category: 'Work',
    },
    {
      id: '5',
      title: 'Weekend Trip',
      description: 'Mountain hiking adventure',
      startDate: addDays(today, 5),
      endDate: addDays(today, 7),
      color: '#8b5cf6',
      category: 'Personal',
    },
  ];
  return events;
};

const createLargeDataset = (): CalendarEvent[] => {
  const today = new Date();
  const events: CalendarEvent[] = [];
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];
  const categories = ['Work', 'Personal', 'Meeting', 'Appointment', 'Reminder'];
  
  // Generate 50+ events across the month
  for (let i = 0; i < 50; i++) {
    const randomDay = Math.floor(Math.random() * 30) - 15; // ±15 days from today
    const randomHour = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
    const randomDuration = Math.floor(Math.random() * 3) + 1; // 1-3 hours
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + randomDay);
    startDate.setHours(randomHour, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + randomDuration);
    
    events.push({
      id: `event-${i}`,
      title: `Event ${i + 1}`,
      description: `Description for event ${i + 1}`,
      startDate,
      endDate,
      color: colors[i % colors.length] || '#3b82f6',
      category: categories[i % categories.length] || 'Other',
    });
  }
  
  return events;
};

// Default story with sample events
export const Default: Story = {
  args: {
    events: createSampleEvents(),
    onEventAdd: action('onEventAdd'),
    onEventUpdate: action('onEventUpdate'),
    onEventDelete: action('onEventDelete'),
    initialView: 'month',
    initialDate: new Date(),
  },
};

// Empty state story
export const EmptyState: Story = {
  args: {
    events: [],
    onEventAdd: action('onEventAdd'),
    onEventUpdate: action('onEventUpdate'),
    onEventDelete: action('onEventDelete'),
    initialView: 'month',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar with no events, showing the empty state and ability to create new events.',
      },
    },
  },
};

// Week view story
export const WeekView: Story = {
  args: {
    events: createSampleEvents(),
    onEventAdd: action('onEventAdd'),
    onEventUpdate: action('onEventUpdate'),
    onEventDelete: action('onEventDelete'),
    initialView: 'week',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar in week view mode showing time slots and event positioning.',
      },
    },
  },
};

// Large dataset story
export const LargeDataset: Story = {
  args: {
    events: createLargeDataset(),
    onEventAdd: action('onEventAdd'),
    onEventUpdate: action('onEventUpdate'),
    onEventDelete: action('onEventDelete'),
    initialView: 'month',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar with 50+ events to test performance and event overflow handling.',
      },
    },
  },
};

// Interactive playground
export const InteractivePlayground: Story = {
  args: {
    events: createSampleEvents(),
    onEventAdd: action('onEventAdd'),
    onEventUpdate: action('onEventUpdate'),
    onEventDelete: action('onEventDelete'),
    initialView: 'month',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Full interactive calendar for testing all features including event creation, editing, and deletion.',
      },
    },
  },
};

// Mobile view demonstration
export const MobileView: Story = {
  args: {
    events: createSampleEvents(),
    onEventAdd: action('onEventAdd'),
    onEventUpdate: action('onEventUpdate'),
    onEventDelete: action('onEventDelete'),
    initialView: 'month',
    initialDate: new Date(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Calendar optimized for mobile devices with responsive layout and touch interactions.',
      },
    },
  },
};

// Accessibility showcase
export const AccessibilityShowcase: Story = {
  args: {
    events: createSampleEvents(),
    onEventAdd: action('onEventAdd'),
    onEventUpdate: action('onEventUpdate'),
    onEventDelete: action('onEventDelete'),
    initialView: 'month',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar with full keyboard navigation support. Use arrow keys to navigate, Enter to select, and Escape to close modals.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Focus the calendar for keyboard navigation demo
    const calendar = canvasElement.querySelector('[role="application"]') as HTMLElement;
    if (calendar) {
      calendar.focus();
    }
  },
};

// Past events story
export const PastEvents: Story = {
  args: {
    events: [
      {
        id: 'past-1',
        title: 'Completed Project',
        description: 'Successfully delivered project',
        startDate: subDays(new Date(), 5),
        endDate: subDays(new Date(), 4),
        color: '#10b981',
        category: 'Work',
      },
      {
        id: 'past-2',
        title: 'Team Celebration',
        description: 'Celebrated project completion',
        startDate: subDays(new Date(), 3),
        endDate: subDays(new Date(), 3),
        color: '#8b5cf6',
        category: 'Work',
      },
    ],
    onEventAdd: action('onEventAdd'),
    onEventUpdate: action('onEventUpdate'),
    onEventDelete: action('onEventDelete'),
    initialView: 'month',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar showing past events to demonstrate historical data display.',
      },
    },
  },
};

// Different time zones (simulated)
export const DifferentTimeZones: Story = {
  args: {
    events: [
      {
        id: 'tz-1',
        title: 'Morning Standup (PST)',
        description: 'Daily team standup',
        startDate: new Date(new Date().setHours(6, 0, 0, 0)), // Early morning
        endDate: new Date(new Date().setHours(6, 30, 0, 0)),
        color: '#3b82f6',
        category: 'Work',
      },
      {
        id: 'tz-2',
        title: 'Client Call (EST)',
        description: 'East coast client meeting',
        startDate: new Date(new Date().setHours(14, 0, 0, 0)), // Afternoon
        endDate: new Date(new Date().setHours(15, 0, 0, 0)),
        color: '#ef4444',
        category: 'Meeting',
      },
      {
        id: 'tz-3',
        title: 'Late Night Deploy (UTC)',
        description: 'Production deployment',
        startDate: new Date(new Date().setHours(23, 0, 0, 0)), // Late night
        endDate: new Date(new Date().setHours(23, 59, 0, 0)),
        color: '#f59e0b',
        category: 'Work',
      },
    ],
    onEventAdd: action('onEventAdd'),
    onEventUpdate: action('onEventUpdate'),
    onEventDelete: action('onEventDelete'),
    initialView: 'week',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar showing events at different times to simulate multi-timezone scenarios.',
      },
    },
  },
};

// Dark mode showcase
export const DarkMode: Story = {
  args: {
    events: createSampleEvents(),
    onEventAdd: action('onEventAdd'),
    onEventUpdate: action('onEventUpdate'),
    onEventDelete: action('onEventDelete'),
    initialView: 'month',
    initialDate: new Date(),
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="dark">
        <div style={{ height: '100vh', padding: '0' }} className="dark">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#1f2937',
        },
      ],
    },
    docs: {
      description: {
        story: 'Calendar component in dark mode with enhanced visual appeal and smooth theme transitions.',
      },
    },
  },
};

// Advanced animations showcase
export const AdvancedAnimations: Story = {
  args: {
    events: createSampleEvents(),
    onEventAdd: action('onEventAdd'),
    onEventUpdate: action('onEventUpdate'),
    onEventDelete: action('onEventDelete'),
    initialView: 'month',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Showcase of advanced Framer Motion animations including staggered animations, spring physics, and micro-interactions.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Demonstrate animations by programmatically interacting with the calendar
    const addButton = canvasElement.querySelector('[aria-label*="Add Event"]') as HTMLElement;
    if (addButton) {
      // Simulate hover effect
      addButton.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      setTimeout(() => {
        addButton.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      }, 1000);
    }
  },
};

// Smart Conflict Detection showcase
export const ConflictDetection: Story = {
  args: {
    events: [
      {
        id: 'conflict-1',
        title: 'Team Meeting',
        description: 'Weekly team sync',
        startDate: new Date(new Date().setHours(10, 0, 0, 0)),
        endDate: new Date(new Date().setHours(11, 0, 0, 0)),
        color: '#3b82f6',
        category: 'Work',
      },
      {
        id: 'conflict-2',
        title: 'Client Call',
        description: 'Important client discussion',
        startDate: new Date(new Date().setHours(10, 30, 0, 0)), // Overlaps with team meeting
        endDate: new Date(new Date().setHours(11, 30, 0, 0)),
        color: '#ef4444',
        category: 'Meeting',
      },
      {
        id: 'conflict-3',
        title: 'Project Review',
        description: 'Review project progress',
        startDate: new Date(new Date().setHours(10, 45, 0, 0)), // Triple overlap
        endDate: new Date(new Date().setHours(12, 0, 0, 0)),
        color: '#f59e0b',
        category: 'Work',
      },
    ],
    onEventAdd: action('onEventAdd'),
    onEventUpdate: action('onEventUpdate'),
    onEventDelete: action('onEventDelete'),
    initialView: 'month',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates smart conflict detection with visual warnings, alternative time suggestions, and conflict resolution.',
      },
    },
  },
};

// Free Time Finder showcase
export const FreeTimeFinder: Story = {
  args: {
    events: [
      // Morning events
      {
        id: 'busy-1',
        title: 'Morning Standup',
        description: 'Daily team standup',
        startDate: new Date(new Date().setHours(9, 0, 0, 0)),
        endDate: new Date(new Date().setHours(9, 30, 0, 0)),
        color: '#3b82f6',
        category: 'Work',
      },
      // Afternoon events
      {
        id: 'busy-2',
        title: 'Lunch Meeting',
        description: 'Business lunch',
        startDate: new Date(new Date().setHours(12, 0, 0, 0)),
        endDate: new Date(new Date().setHours(13, 30, 0, 0)),
        color: '#10b981',
        category: 'Meeting',
      },
      // Late afternoon
      {
        id: 'busy-3',
        title: 'Project Work',
        description: 'Focus time for development',
        startDate: new Date(new Date().setHours(15, 0, 0, 0)),
        endDate: new Date(new Date().setHours(17, 0, 0, 0)),
        color: '#8b5cf6',
        category: 'Work',
      },
    ],
    onEventAdd: action('onEventAdd'),
    onEventUpdate: action('onEventUpdate'),
    onEventDelete: action('onEventDelete'),
    initialView: 'month',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Showcases the Free Time Finder with longest free blocks, next available slots, and recurring weekly patterns.',
      },
    },
  },
};

// Year View showcase
export const YearView: Story = {
  args: {
    events: createLargeDataset(),
    onEventAdd: action('onEventAdd'),
    onEventUpdate: action('onEventUpdate'),
    onEventDelete: action('onEventDelete'),
    initialView: 'year',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Year view showing all 12 months with event indicators and quick month navigation.',
      },
    },
  },
};

// Productivity Features Combined
export const ProductivitySuite: Story = {
  args: {
    events: createLargeDataset().slice(0, 15), // Moderate dataset with some conflicts
    onEventAdd: action('onEventAdd'),
    onEventUpdate: action('onEventUpdate'),
    onEventDelete: action('onEventDelete'),
    initialView: 'month',
    initialDate: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete productivity suite combining conflict detection, free time finding, and smart scheduling suggestions.',
      },
    },
  },
};
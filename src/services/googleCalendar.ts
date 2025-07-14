
import { supabase } from '@/integrations/supabase/client';

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  colorId?: string;
}

class GoogleCalendarService {
  private static instance: GoogleCalendarService;
  private accessToken: string | null = null;

  static getInstance(): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService();
    }
    return GoogleCalendarService.instance;
  }

  async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.provider_token) {
      this.accessToken = session.provider_token;
      return this.accessToken;
    }
    return null;
  }

  async createEvent(event: GoogleCalendarEvent): Promise<string | null> {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('No Google access token available');
    }

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`Failed to create calendar event: ${response.statusText}`);
      }

      const createdEvent = await response.json();
      return createdEvent.id;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, event: GoogleCalendarEvent): Promise<void> {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('No Google access token available');
    }

    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`Failed to update calendar event: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('No Google access token available');
    }

    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete calendar event: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  getPriorityColor(priority: string): string {
    const colorMap: Record<string, string> = {
      'Low': '2', // Green
      'Medium': '5', // Yellow
      'High': '11', // Red
      'Critical': '4', // Light red
    };
    return colorMap[priority] || '1'; // Default blue
  }

  createEventFromTask(task: any): GoogleCalendarEvent {
    const dueDate = new Date(task.due_date);
    const endDate = new Date(dueDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    return {
      summary: task.title,
      description: task.description || '',
      start: {
        dateTime: dueDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      colorId: this.getPriorityColor(task.priority),
    };
  }
}

export const googleCalendarService = GoogleCalendarService.getInstance();

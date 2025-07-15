
import { supabase } from '@/integrations/supabase/client';

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
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
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found');
        return null;
      }

      // Check for provider_token (Google OAuth access token)
      if (session.provider_token) {
        this.accessToken = session.provider_token;
        console.log('✅ Google access token found:', this.accessToken.substring(0, 20) + '...');
        return this.accessToken;
      }

      // Check provider_refresh_token if access token is missing
      if (session.provider_refresh_token) {
        console.log('🔄 Access token missing, but refresh token available');
        // In a real app, you'd refresh the token here
        // For now, we'll ask user to re-authenticate
        throw new Error('Google access token expired. Please sign out and sign in with Google again.');
      }

      console.log('❌ No Google tokens found in session');
      throw new Error('Please sign in with Google to sync with Google Calendar');
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  async createEvent(event: GoogleCalendarEvent): Promise<string | null> {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('Google Calendar access not available. Please sign out and sign in with Google again.');
    }

    console.log('🚀 Creating Google Calendar event:', {
      summary: event.summary,
      start: event.start.dateTime,
      end: event.end.dateTime
    });

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.summary,
          description: event.description || '',
          start: {
            dateTime: event.start.dateTime,
            timeZone: event.start.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: event.end.dateTime,
            timeZone: event.end.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          colorId: event.colorId
        }),
      });

      console.log('📅 Calendar API Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Calendar API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        if (response.status === 401) {
          throw new Error('Google Calendar access expired. Please sign out and sign in with Google again.');
        } else if (response.status === 403) {
          throw new Error('Google Calendar access denied. Please check your Google Calendar permissions.');
        } else if (response.status === 400) {
          throw new Error('Invalid calendar event data. Please check your task details.');
        }
        
        throw new Error(`Failed to create calendar event: ${response.status} ${response.statusText}`);
      }

      const createdEvent = await response.json();
      console.log('✅ Calendar event created successfully:', {
        id: createdEvent.id,
        htmlLink: createdEvent.htmlLink,
        summary: createdEvent.summary
      });
      return createdEvent.id;
    } catch (error) {
      console.error('💥 Error creating calendar event:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, event: GoogleCalendarEvent): Promise<void> {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('Google Calendar access not available. Please sign out and sign in with Google again.');
    }

    console.log('🔄 Updating Google Calendar event:', eventId);

    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.summary,
          description: event.description || '',
          start: {
            dateTime: event.start.dateTime,
            timeZone: event.start.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: event.end.dateTime,
            timeZone: event.end.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          colorId: event.colorId
        }),
      });

      console.log('📅 Update Calendar API Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Calendar Update API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        if (response.status === 401) {
          throw new Error('Google Calendar access expired. Please sign out and sign in with Google again.');
        } else if (response.status === 404) {
          throw new Error('Calendar event not found. It may have been deleted.');
        }
        
        throw new Error(`Failed to update calendar event: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Calendar event updated successfully');
    } catch (error) {
      console.error('💥 Error updating calendar event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('Google Calendar access not available. Please sign out and sign in with Google again.');
    }

    console.log('🗑️ Deleting Google Calendar event:', eventId);

    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📅 Delete Calendar API Response Status:', response.status);

      if (!response.ok && response.status !== 404) {
        const errorText = await response.text();
        console.error('❌ Calendar Delete API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        if (response.status === 401) {
          throw new Error('Google Calendar access expired. Please sign out and sign in with Google again.');
        }
        
        throw new Error(`Failed to delete calendar event: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Calendar event deleted successfully');
    } catch (error) {
      console.error('💥 Error deleting calendar event:', error);
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

    console.log('🔧 Converting task to calendar event:', {
      title: task.title,
      dueDate: dueDate.toISOString(),
      endDate: endDate.toISOString(),
      priority: task.priority
    });

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

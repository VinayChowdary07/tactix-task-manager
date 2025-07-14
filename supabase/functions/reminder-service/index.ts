
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get current time
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 60 * 60 * 1000); // Check for reminders in the next hour

    // Get tasks with reminders due in the next hour
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select(`
        *,
        auth.users!inner(email)
      `)
      .gte("reminder_time", now.toISOString())
      .lte("reminder_time", reminderTime.toISOString())
      .neq("status", "Done");

    if (error) {
      console.error("Error fetching tasks:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create notifications for each task
    const notifications = [];
    
    for (const task of tasks || []) {
      const message = `Reminder: Task "${task.title}" is due soon!`;
      
      // Create in-app notification
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: task.user_id,
          message: message,
          type: "reminder",
        });

      if (notificationError) {
        console.error("Error creating notification:", notificationError);
      } else {
        notifications.push({
          task_id: task.id,
          message: message,
          user_email: task.users?.email,
        });
      }
    }

    console.log(`Processed ${notifications.length} reminder notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: notifications.length,
        notifications: notifications,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in reminder service:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

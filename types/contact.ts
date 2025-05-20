export interface ContactMessage {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
  created_at: string; // Assuming this is a timestamp string from Supabase
  // Add any other fields like 'is_read' if you plan to implement that
} 
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ohpzvwguqtpruqfdmlst.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocHp2d2d1cXRwcnVxZmRtbHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ5NzA3NDksImV4cCI6MjAzMDU0Njc0OX0.RuCB9z5-953W6Fb_83bx87GdPu93A76jjl3N3Au9J9o";

export const supabase = createClient(supabaseUrl, supabaseKey);

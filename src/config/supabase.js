
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const supabase = createRouteHandlerClient({ cookies });


// import { createClient } from "@supabase/supabase-js";
// const  supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const  supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// export const supabase = createClient(supabaseURL, supabaseAnonKey);
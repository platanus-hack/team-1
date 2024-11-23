import { createClient } from '@supabase/supabase-js';


// Crear el cliente de Supabase
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

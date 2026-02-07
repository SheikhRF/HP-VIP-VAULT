import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with Service Role to bypass RLS for background syncing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET in environment variables');
  }

  // 1. EXTRACT HEADERS
  const headerList = await headers();
  const svix_id = headerList.get("svix-id");
  const svix_timestamp = headerList.get("svix-timestamp");
  const svix_signature = headerList.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', { status: 400 });
  }

  // 2. GET RAW BODY
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // 3. VERIFY WEBHOOK AUTHENTICITY
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Error: Verification failed', { status: 400 });
  }

  // 4. SYNC DATA TO VAULT PROFILES
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, first_name, last_name, email_addresses } = evt.data;
    
    // Map Clerk data to your schema: Combine names for the 'name' column
    const fullName = `${first_name ?? ''} ${last_name ?? ''}`.trim();
    const primaryEmail = email_addresses?.[0]?.email_address;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: id, // Maps Clerk User ID to your primary key
        name: fullName || 'Unknown Member',
        email: primaryEmail,
        updated_at: new Date().toISOString()
        // 'role' will default to 'user' via your SQL schema if not provided
      }, { onConflict: 'id' });

    if (error) {
      console.error('Supabase Sync Error:', error.message);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  // 5. HANDLE USER DELETION
  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    
    if (error) {
      console.error('Deletion Error:', error.message);
      return new Response('Error deleting user', { status: 500 });
    }
  }

  return new Response('Vault Synchronized', { status: 200 });
}
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** ออกจากระบบ (POST เท่านั้น) */
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 เพื่อเปลี่ยน POST เป็น GET ตอน redirect
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}

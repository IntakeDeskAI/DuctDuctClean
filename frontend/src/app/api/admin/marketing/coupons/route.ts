import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get("admin_session")?.value);
}

function generateCouponCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "DUCT-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET /api/admin/marketing/coupons — list coupons
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("marketing_coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// POST /api/admin/marketing/coupons — create coupon
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { code, description, discount_type, discount_value, max_uses, service_type, expires_at } = body;

  if (!discount_type || !discount_value) {
    return NextResponse.json(
      { error: "discount_type and discount_value are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("marketing_coupons")
    .insert({
      code: code || generateCouponCode(),
      description: description || null,
      discount_type,
      discount_value,
      max_uses: max_uses || null,
      service_type: service_type || null,
      expires_at: expires_at || null,
    })
    .select()
    .single();

  if (error) {
    // If code collision, retry with new code
    if (error.code === "23505") {
      const retryCode = generateCouponCode();
      const { data: retryData, error: retryError } = await supabase
        .from("marketing_coupons")
        .insert({
          code: retryCode,
          description: description || null,
          discount_type,
          discount_value,
          max_uses: max_uses || null,
          service_type: service_type || null,
          expires_at: expires_at || null,
        })
        .select()
        .single();

      if (retryError) {
        return NextResponse.json({ error: retryError.message }, { status: 500 });
      }
      return NextResponse.json(retryData);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PATCH /api/admin/marketing/coupons — update coupon
export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("marketing_coupons")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/admin/marketing/coupons — deactivate coupon
export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("marketing_coupons")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

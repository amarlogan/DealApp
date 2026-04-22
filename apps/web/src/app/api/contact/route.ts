import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, captchaToken } = body;

    // 1. Validation
    if (!name || !email || !subject || !message || !captchaToken) {
      return NextResponse.json(
        { error: "Missing required fields or CAPTCHA" },
        { status: 400 }
      );
    }

    // 2. CAPTCHA Verification
    const secretKey = process.env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA";
    const captchaRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secretKey}&response=${captchaToken}`,
    });
    
    const captchaData = await captchaRes.json();
    if (!captchaData.success) {
      return NextResponse.json(
        { error: "Invalid or expired CAPTCHA. Please try again." },
        { status: 403 }
      );
    }

    // 3. Insert into Database using Service Role (Admin) client
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("contact_submissions")
      .insert([
        {
          name,
          email,
          subject,
          message,
          status: "new",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to save submission" },
        { status: 500 }
      );
    }

    // 3. Return success
    return NextResponse.json(
      { message: "Form submitted successfully", id: data.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("Request error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { first_name, last_name, account_type } = await req.json();

  if (!first_name || !last_name) {
    return NextResponse.json({ error: "Name is required for AML screening" }, { status: 400 });
  }

  const appId = process.env.DOJAH_ENV === "sandbox"
    ? process.env.DOJAH_APP_ID_TEST!
    : process.env.DOJAH_APP_ID!;
  const privateKey = process.env.DOJAH_ENV === "sandbox"
    ? process.env.DOJAH_PRIVATE_KEY_TEST!
    : process.env.DOJAH_PRIVATE_KEY!;

  try {
    const dojahRes = await fetch(
      "https://api.dojah.io/api/v1/aml/screening",
      {
        method: "POST",
        headers: {
          "AppId": appId,
          "Authorization": privateKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name,
          last_name,
          type: "individual",
        }),
      }
    );

    const dojahData = await dojahRes.json();

    if (!dojahRes.ok || dojahData.error) {
      console.error("AML screening error:", dojahData);
      return NextResponse.json({
        screened: false,
        status: "failed",
        message: "AML screening could not be completed.",
      });
    }

    const hits = dojahData.entity || [];
    const hasHits = Array.isArray(hits) && hits.length > 0;
    const amlStatus = hasHits ? "flagged" : "clear";

    const table = account_type === "business" ? "kyb_profiles" : "kyc_profiles";

    await supabaseServer
      .from(table)
      .update({
        aml_status: amlStatus,
        aml_screened_at: new Date().toISOString(),
        aml_hits: hasHits ? hits : null,
        ...(hasHits && {
          risk_rating: "high",
          risk_notes: `AML screening flagged ${hits.length} potential match${hits.length > 1 ? "es" : ""}`,
        }),
      })
      .eq("user_id", userId);

    // Notify admin if flagged
    if (hasHits) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "info@kya.com.ng",
          to: process.env.ADMIN_EMAIL || "",
          subject: "⚠ KYA — AML Screening Alert",
          html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#0A0E1A;margin:0;padding:40px 20px;">
            <table width="600" style="max-width:600px;margin:0 auto;background:#0D1420;border-radius:16px;overflow:hidden;border:1px solid rgba(239,68,68,0.3);">
              <tr><td style="background:linear-gradient(135deg,#1A2540,#0D1420);padding:32px 40px;border-bottom:2px solid #ef4444;">
                <span style="font-size:28px;font-weight:900;color:#E8E0D0;font-family:Georgia,serif;">KY<span style="color:#C9A84C;">A</span></span>
              </td></tr>
              <tr><td style="padding:40px;">
                <p style="font-size:16px;font-weight:700;color:#ef4444;margin:0 0 16px;">⚠ AML Screening Alert</p>
                <p style="font-size:14px;color:#8A9AB5;margin:0 0 16px;">A customer has been flagged during AML/PEP/Sanctions screening.</p>
                <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,0.06);border-radius:8px;overflow:hidden;">
                  <tr><td style="padding:12px 16px;background:#080C14;font-size:12px;color:#4A5568;font-weight:700;width:140px;">Customer</td><td style="padding:12px 16px;background:#080C14;font-size:14px;color:#E8E0D0;">${first_name} ${last_name}</td></tr>
                  <tr><td style="padding:12px 16px;background:#080C14;font-size:12px;color:#4A5568;font-weight:700;">Account Type</td><td style="padding:12px 16px;background:#080C14;font-size:14px;color:#E8E0D0;">${account_type || "personal"}</td></tr>
                  <tr><td style="padding:12px 16px;background:#080C14;font-size:12px;color:#4A5568;font-weight:700;">Hits Found</td><td style="padding:12px 16px;background:#080C14;font-size:14px;color:#ef4444;font-weight:700;">${hits.length} match${hits.length > 1 ? "es" : ""}</td></tr>
                </table>
                <table cellpadding="0" cellspacing="0" style="margin-top:24px;">
                  <tr><td style="background:#C9A84C;border-radius:8px;">
                    <a href="https://staff.kya.ng/customers" style="display:inline-block;background:#C9A84C;color:#080C14;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px;">Review Customer &rarr;</a>
                  </td></tr>
                </table>
              </td></tr>
              <tr><td style="background:#080C14;padding:24px 40px;border-top:1px solid rgba(201,168,76,0.2);">
                <p style="font-size:11px;color:#4A5568;margin:0;">KYA Digital Services Ltd · CBN AML 2025 Compliance · AML Screening System</p>
              </td></tr>
            </table></body></html>`,
        });
      } catch (err) {
        console.error("AML notification error:", err);
      }
    }

    return NextResponse.json({
      screened: true,
      status: amlStatus,
      hits: hits.length,
      message: hasHits
        ? `AML screening flagged ${hits.length} potential match${hits.length > 1 ? "es" : ""}. Account flagged for review.`
        : "AML screening clear. No matches found.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AML screening failed";
    console.error("Dojah AML error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
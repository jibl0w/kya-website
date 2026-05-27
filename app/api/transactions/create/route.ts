import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { notifyAdminTransactionCreated } from "@/lib/notifications";

function generateRef(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `KYA-${year}${month}-${random}`;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await req.json();
  const {
    supplierName,
    supplierCategory,
    productDescription,
    quantity,
    unitPrice,
    totalValue,
    currency,
    portOfDestination,
    notes,
  } = body;

  if (!supplierName || !supplierCategory || !productDescription || !quantity || !unitPrice || !portOfDestination) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const transactionRef = generateRef();

  const { data: transaction, error } = await supabaseServer
    .from("transactions")
    .insert({
      user_id: userId,
      transaction_ref: transactionRef,
      supplier_name: supplierName,
      supplier_category: supplierCategory,
      product_description: productDescription,
      quantity,
      unit_price: unitPrice,
      total_value: totalValue,
      currency,
      port_of_destination: portOfDestination,
      notes,
      status: "draft",
      current_step: 2,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const stepNames = [
    "KYC / KYB Verification",
    "Supplier Selection",
    "Form M Submission",
    "Naira Funding",
    "LC Issuance",
    "Pre-Shipment Inspection",
    "Shipment & Documents",
    "FX Processing & Release",
    "USD Credit to Account",
    "Payment Instruction",
    "RMB Settlement",
    "LC Liquidation",
    "Transaction Complete",
  ];

  const steps = stepNames.map((name, i) => ({
    transaction_id: transaction.id,
    step_number: i + 1,
    step_name: name,
    status: i === 0 ? "complete" : i === 1 ? "active" : "pending",
  }));

  await supabaseServer.from("transaction_steps").insert(steps);

  // Send notification to admin
  try {
    const clerkRes = await fetch(
      "https://api.clerk.com/v1/users/" + userId,
      { headers: { Authorization: "Bearer " + process.env.CLERK_SECRET_KEY } }
    );
    const clerkUser = await clerkRes.json();
    const customerName = ((clerkUser.first_name || "") + " " + (clerkUser.last_name || "")).trim() || "Customer";

    await notifyAdminTransactionCreated({
      customerName,
      transactionRef,
      supplierName,
      totalValue,
      currency,
    });
  } catch (err) {
    console.error("Notification error:", err);
  }

  return NextResponse.json({
    success: true,
    transactionId: transaction.id,
    transactionRef,
  });
}
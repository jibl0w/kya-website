import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ documents: [] });
    }

    const { data, error } = await supabaseServer
      .from("documents")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("DB ERROR:", error);
      return NextResponse.json({ documents: [] });
    }

    return NextResponse.json({ documents: data || [] });
  } catch (err) {
    console.error("SERVER ERROR:", err);

    return NextResponse.json(
      { documents: [], error: "Server crashed" },
      { status: 500 }
    );
  }
}
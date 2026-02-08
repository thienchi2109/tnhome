import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/actions/order-actions";
import { requireAdmin } from "@/lib/actions/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = request.nextUrl;

    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const pageSize = Math.min(Math.max(1, Number(searchParams.get("pageSize") || "20")), 100);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await getOrders(
      { page, pageSize },
      { status, search }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

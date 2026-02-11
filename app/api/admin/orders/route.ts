import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/actions/order-actions";
import { isUnauthorizedError } from "@/lib/actions/errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const pageParam = searchParams.get("page");
    const parsedPage =
      pageParam === null || pageParam.trim() === "" ? NaN : Number(pageParam);
    const page = Number.isFinite(parsedPage)
      ? Math.max(1, Math.floor(parsedPage))
      : 1;

    const pageSizeParam = searchParams.get("pageSize");
    const parsedPageSize =
      pageSizeParam === null || pageSizeParam.trim() === ""
        ? NaN
        : Number(pageSizeParam);
    const pageSize = Number.isFinite(parsedPageSize)
      ? Math.min(Math.max(1, Math.floor(parsedPageSize)), 100)
      : 20;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await getOrders(
      { page, pageSize },
      { status, search }
    );

    return NextResponse.json(result);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

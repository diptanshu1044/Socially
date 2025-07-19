import { NextRequest, NextResponse } from "next/server";
import { deleteOldNotifications } from "@/actions/notification.action";

export async function POST(request: NextRequest) {
  try {
    // Check for a secret key to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CLEANUP_SECRET || "your-secret-key";
    
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await deleteOldNotifications();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${result.deletedCount} old notifications`,
        deletedCount: result.deletedCount,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to delete old notifications" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in notification cleanup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

/**
 * Notifications API route. Reads from backendBackup.json.
 *
 * TODO(phase-5): wire to TanStack Query against core-module's activity feed.
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "backendBackup.json");
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const allData = JSON.parse(fileContent);

    if (!allData.notifications) {
      throw new Error("No notifications found in backup data");
    }

    return NextResponse.json(allData.notifications);
  } catch (error: unknown) {
    console.error("Error in notifications API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

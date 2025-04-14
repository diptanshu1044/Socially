// app/api/posts/route.js
import { getPosts } from "@/actions/post.action";
import { NextResponse } from "next/server";

export const revalidate = 10;

export async function GET(request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");

  try {
    const postsData = await getPosts({ page, limit });
    return NextResponse.json(postsData);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

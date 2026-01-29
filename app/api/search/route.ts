import { NextResponse } from "next/server"
import { searchInAllPages } from "@/app/lib/fetchStaticData"
import { setCorsHeaders } from "@/app/lib/cors"
import { processTitle } from "@/app/lib/titleProcessor"

export const runtime = 'edge';
export const revalidate = 86400 // Revalidate every 24 hours (1 day)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const page = Number.parseInt(searchParams.get("page") || "1")
  const perPage = Number.parseInt(searchParams.get("per_page") || "100")

  if (!query) {
    const errorResponse = NextResponse.json({ error: "Search query is required" }, { status: 400 })
    return setCorsHeaders(errorResponse)
  }

  try {
    // Search menggunakan data_page_X.json (tidak preload semua detail)
    const allResults = await searchInAllPages(query, 1000)

    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedResults = allResults.slice(startIndex, endIndex)

    const response = NextResponse.json({
      server_time: new Date().toISOString().replace("T", " ").substr(0, 19),
      status: 200,
      msg: "OK",
      total_videos: allResults.length,
      result: paginatedResults.map((file: any) => ({
        single_img: file.single_img,
        length: file.length,
        views: file.views,
        title: processTitle(file.title),
        file_code: file.file_code,
        uploaded: file.uploaded,
        splash_img: file.splash_img,
      })),
    })

    const corsResponse = setCorsHeaders(response)
    corsResponse.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600')
    return corsResponse
  } catch (error) {
    const errorResponse = NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    const corsErrorResponse = setCorsHeaders(errorResponse)
    corsErrorResponse.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600')
    return corsErrorResponse
  }
}

export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 200 }))
}


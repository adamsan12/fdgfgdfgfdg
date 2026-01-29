import { NextResponse } from "next/server"
import { getFileDetail } from "@/app/lib/fetchStaticData"
import { setCorsHeaders } from "@/app/lib/cors"
import { processTitle } from "@/app/lib/titleProcessor"

export const revalidate = 86400 // Revalidate every 24 hours (1 day)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fileCode = searchParams.get("file_code")

  if (!fileCode) {
    const errorResponse = NextResponse.json({ error: "file_code is required" }, { status: 400 })
    return setCorsHeaders(errorResponse)
  }

  try {
    // Load file detail hanya saat dibutuhkan (lazy loading)
    const fileInfo = await getFileDetail(fileCode)

    if (!fileInfo) {
      const notFoundResponse = NextResponse.json({ error: "File not found" }, { status: 404 })
      return setCorsHeaders(notFoundResponse)
    }

    const response = NextResponse.json({
      status: 200,
      result: [
        {
          filecode: fileInfo.filecode,
          size: fileInfo.size,
          status: 200,
          protected_embed: fileInfo.protected_embed,
          uploaded: fileInfo.uploaded,
          last_view: new Date().toISOString().replace("T", " ").substr(0, 19),
          protected_dl: fileInfo.protected_dl,
          single_img: fileInfo.single_img,
          title: processTitle(fileInfo.title),
          views: fileInfo.views,
          length: fileInfo.length,
          splash_img: fileInfo.splash_img,
        },
      ],
      server_time: new Date().toISOString().replace("T", " ").substr(0, 19),
      msg: "OK",
    })

    return setCorsHeaders(response)
  } catch (error) {
    const errorResponse = NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    return setCorsHeaders(errorResponse)
  }
}

export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 200 }))
}


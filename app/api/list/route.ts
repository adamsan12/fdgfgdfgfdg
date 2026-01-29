import { NextResponse } from "next/server";
import { getListData, getMeta } from "@/app/lib/fetchStaticData";
import { setCorsHeaders } from "@/app/lib/cors";
import { processTitle } from "@/app/lib/titleProcessor";

export const runtime = 'edge';
export const revalidate = 86400; // Revalidate every 24 hours (1 day)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number.parseInt(searchParams.get("page") || "1");
  const perPage = Number.parseInt(searchParams.get("per_page") || "50");

  try {
    // Get list data dari data_page_X.json
    const pageData = await getListData(page);
    const meta = await getMeta();

    // Paginate hasil jika perPage berbeda dari default (200)
    let items = pageData.data || [];
    if (perPage !== 200) {
      const startIndex = 0;
      const endIndex = perPage;
      items = items.slice(startIndex, endIndex);
    }

    const response = NextResponse.json({
      result: {
        total_pages: meta.total_pages || pageData.total_pages || 0,
        results_total: (meta.total || pageData.total || 0).toString(),
        results: items.length,
        files: items.map((file: any) => ({
          single_img: file.single_img,
          uploaded: file.uploaded,
          views: file.views,
          length: file.length,
          file_code: file.file_code,
          title: processTitle(file.title),
          splash_img: file.splash_img,
        })),
        per_page_limit: perPage.toString(),
      },
      status: 200,
      msg: "OK",
      server_time: new Date().toISOString().replace("T", " ").substr(0, 19),
    });

    return setCorsHeaders(response);
  } catch (error) {
    const errorResponse = NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    return setCorsHeaders(errorResponse);
  }
}

export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 200 }));
}
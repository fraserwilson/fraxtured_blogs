import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const maxUploadSizeBytes = 50 * 1024 * 1024;

function getInternalApiBaseUrl() {
  const configured = process.env.INTERNAL_API_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  return "http://localhost:5050/api";
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const writeKey = process.env.INTERNAL_API_WRITE_KEY?.trim();
  if (!writeKey) {
    return NextResponse.json({ error: "Upload is not configured." }, { status: 500 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > maxUploadSizeBytes) {
    return NextResponse.json({ error: "File too large. Max size is 50MB." }, { status: 413 });
  }

  const formData = await request.formData();

  const upstreamResponse = await fetch(`${getInternalApiBaseUrl()}/blogs/upload`, {
    method: "POST",
    body: formData,
    headers: {
      "X-Write-Api-Key": writeKey
    },
    cache: "no-store"
  });

  const responseText = await upstreamResponse.text();
  if (!upstreamResponse.ok) {
    return new NextResponse(responseText || "Upload failed.", { status: upstreamResponse.status });
  }

  return new NextResponse(responseText, {
    status: 200,
    headers: {
      "Content-Type": upstreamResponse.headers.get("content-type") ?? "application/json; charset=utf-8"
    }
  });
}

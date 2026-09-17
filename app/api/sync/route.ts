import { NextRequest, NextResponse } from "next/server";
import { get, put } from "@vercel/blob";

export const runtime = "nodejs";
export const maxDuration = 30;

const BLOB_PATHNAME = "strata/topics.json";

function passcodeOk(req: NextRequest): boolean {
  const configured = process.env.SYNC_PASSCODE;
  if (!configured) return false;
  return req.headers.get("x-strata-passcode") === configured;
}

export async function GET(req: NextRequest) {
  if (!process.env.SYNC_PASSCODE) {
    return NextResponse.json(
      { error: "no-passcode", message: "Sync isn't configured on the server yet." },
      { status: 501 },
    );
  }
  if (!passcodeOk(req)) {
    return NextResponse.json({ error: "unauthorized", message: "Wrong passcode." }, { status: 401 });
  }

  try {
    const result = await get(BLOB_PATHNAME, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json({ topics: [], syncedAt: null });
    }
    const text = await new Response(result.stream).text();
    const body = JSON.parse(text) as { topics: unknown; syncedAt: string };
    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ topics: [], syncedAt: null });
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.SYNC_PASSCODE) {
    return NextResponse.json(
      { error: "no-passcode", message: "Sync isn't configured on the server yet." },
      { status: 501 },
    );
  }
  if (!passcodeOk(req)) {
    return NextResponse.json({ error: "unauthorized", message: "Wrong passcode." }, { status: 401 });
  }

  let topics: unknown;
  try {
    const body = await req.json();
    topics = body.topics;
  } catch {
    return NextResponse.json({ error: "bad-request", message: "Malformed request body." }, { status: 400 });
  }

  if (!Array.isArray(topics)) {
    return NextResponse.json({ error: "bad-request", message: "Expected a topics array." }, { status: 400 });
  }

  const syncedAt = new Date().toISOString();
  try {
    await put(BLOB_PATHNAME, JSON.stringify({ topics, syncedAt }), {
      access: "private",
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: "application/json",
    });
    return NextResponse.json({ syncedAt });
  } catch (err) {
    console.error("Blob sync write failed:", err);
    return NextResponse.json({ error: "sync-failed", message: "Couldn't save the backup right now." }, { status: 502 });
  }
}

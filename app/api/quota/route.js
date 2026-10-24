import { NextResponse } from "next/server";
import { peekQuota, consumeQuota, applyQuota, publicQuota } from "@/lib/quota";
import { METERED_TOOLS } from "@/lib/freeTier";
import { PRO_PRICE_DISPLAY, PASS_DAYS } from "@/lib/pricing";

/**
 * Quota endpoint. The humanizer reads its remaining runs here (it spends them
 * inside /api/humanize). The POST path exists for a browser-side tool that is
 * metered without a server call of its own: it asks permission with the tool
 * name only, so the user's text never leaves the page. No such tool is metered
 * today — the detector and watermark remover were un-metered, see METERED_TOOLS
 * in lib/freeTier.js.
 *
 *   GET  /api/quota?tool=humanize  → read remaining, spends nothing
 *   POST /api/quota { tool }     → spend one attempt
 */

// Quota is per-caller and changes on every write; it must never be cached.
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/** @param {string | null} tool */
function invalidTool(tool) {
  return !tool || !METERED_TOOLS.includes(/** @type {any} */ (tool));
}

export async function GET(request) {
  const tool = new URL(request.url).searchParams.get("tool");

  if (invalidTool(tool)) {
    return NextResponse.json(
      { success: false, error: "Unknown tool." },
      { status: 400, headers: NO_STORE }
    );
  }

  const quota = await peekQuota(request, tool);

  // A peek must never write the cookie — quota state is only created once
  // someone actually uses a tool, so a page view alone sets nothing.
  return applyQuota(
    NextResponse.json({ success: true, ...publicQuota(quota) }, { headers: NO_STORE }),
    { ...quota, cookie: undefined }
  );
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON in request body." },
      { status: 400, headers: NO_STORE }
    );
  }

  const tool = body?.tool;

  if (invalidTool(tool)) {
    return NextResponse.json(
      { success: false, error: "Unknown tool." },
      { status: 400, headers: NO_STORE }
    );
  }

  const quota = await consumeQuota(request, tool);

  return applyQuota(
    NextResponse.json(
      {
        success: quota.allowed,
        ...publicQuota(quota),
        ...(quota.allowed
          ? {}
          : {
              error: "quota_exceeded",
              message: `You've used all ${quota.limit} free runs. Get ${PASS_DAYS} days of unlimited access for ${PRO_PRICE_DISPLAY}, or wait for them to reset.`,
            }),
      },
      { status: quota.allowed ? 200 : 429, headers: NO_STORE }
    ),
    quota
  );
}

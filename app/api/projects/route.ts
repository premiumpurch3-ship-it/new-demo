import {NextResponse} from "next/server";
import {query} from "@/lib/db";
import {requireUser} from "@/lib/guards";
import crypto from "node:crypto";

export async function POST(req: Request) {
  try {
    await requireUser();
    const b = await req.json();
    if (!b.client_id || !b.name) return NextResponse.json({ error: "Client and project name are required." }, { status: 400 });
    const c = await query<{status:string}>("select status from clients where id=$1", [b.client_id]);
    if (!c.rows[0]) return NextResponse.json({ error: "Client not found." }, { status: 404 });
    if (c.rows[0].status === "SUSPENDED") return NextResponse.json({ error: "Suspended clients cannot receive projects." }, { status: 409 });
    const id = crypto.randomUUID();
    const slug = (b.slug ? String(b.slug) : String(b.name)).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
    if (!slug) return NextResponse.json({ error: "A valid project slug is required." }, { status: 400 });
    await query(
      "insert into projects(id,client_id,name,slug,framework,hosting,repo_url,repo_branch,status) values($1,$2,$3,$4,$5,$6,$7,$8,'ACTIVE')",
      [id, b.client_id, String(b.name).trim(), slug, b.framework || "Next.js", b.hosting || "Vercel", b.repo_url ? String(b.repo_url).trim() : null, b.repo_branch ? String(b.repo_branch).trim() : "main"]
    );
    return NextResponse.json({ id }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error && e.message.includes("duplicate key") ? "A project with this slug already exists for this client." : (e instanceof Error ? e.message : "Create failed");
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import {NextResponse} from "next/server";
import {query} from "@/lib/db";
import {requireUser} from "@/lib/guards";
import crypto from "node:crypto";

export async function POST(req: Request) {
  let deploymentId = "";
  try {
    await requireUser();
    const { project_id } = await req.json();
    const p = await query<any>(
      "select p.*,c.status client_status from projects p join clients c on c.id=p.client_id where p.id=$1",
      [project_id]
    );
    if (!p.rows[0]) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    const project = p.rows[0];
    if (project.client_status === "SUSPENDED")
      return NextResponse.json({ error: "Client is suspended; deployment blocked." }, { status: 403 });
    if (project.hosting !== "Vercel")
      return NextResponse.json({ error: "Only Vercel is enabled in this release." }, { status: 400 });

    deploymentId = crypto.randomUUID();
    await query(
      "insert into deployments(id,project_id,status,provider,message) values($1,$2,'QUEUED','Vercel','Deployment requested')",
      [deploymentId, project_id]
    );

    const token = process.env.VERCEL_TOKEN;
    if (!token) {
      await query("update deployments set status='FAILED',message='VERCEL_TOKEN is not configured.' where id=$1", [deploymentId]);
      return NextResponse.json(
        { error: "VERCEL_TOKEN is not configured. Add it in Vercel Environment Variables, then retry." },
        { status: 503 }
      );
    }

    const repoUrl = project.repo_url;
    if (!repoUrl) {
      await query("update deployments set status='FAILED',message='GitHub repository URL is not configured for this project.' where id=$1", [deploymentId]);
      return NextResponse.json({ error: "Add a GitHub repository URL to this project before deploying." }, { status: 400 });
    }

    const match = repoUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/#]+?)(?:\.git)?$/i);
    if (!match) {
      await query("update deployments set status='FAILED',message='Repository URL must be a GitHub HTTPS URL.' where id=$1", [deploymentId]);
      return NextResponse.json({ error: "Repository URL must look like https://github.com/owner/repository." }, { status: 400 });
    }

    const body = {
      name: project.slug,
      gitSource: {
        type: "github",
        repo: `${match[1]}/${match[2]}`,
        ref: project.repo_branch || "main"
      }
    };

    const vr = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await vr.json().catch(() => ({}));

    if (!vr.ok) {
      const msg = typeof data?.error?.message === "string" ? data.error.message : "Vercel API rejected the deployment.";
      await query("update deployments set status='FAILED',message=$1 where id=$2", [msg, deploymentId]);
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    await query(
      "update deployments set status='SUCCESS',message=$1,provider_deployment_id=$2 where id=$3",
      [data?.url ? `Deployment created: ${data.url}` : "Deployment created", data?.id || null, deploymentId]
    );
    return NextResponse.json({ ok: true, url: data?.url || null });
  } catch (e) {
    if (deploymentId)
      await query("update deployments set status='FAILED',message=$1 where id=$2", [e instanceof Error ? e.message : "Deployment error", deploymentId]).catch(() => {});
    return NextResponse.json({ error: e instanceof Error ? e.message : "Deployment failed" }, { status: 500 });
  }
}

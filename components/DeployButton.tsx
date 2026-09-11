 "use client";
import {useState} from "react"; import {useRouter} from "next/navigation";
export default function DeployButton({projectId,hosting}:{projectId:string;hosting:string}){const [busy,setBusy]=useState(false);const router=useRouter();
 async function deploy(){setBusy(true);const r=await fetch("/api/deployments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({project_id:projectId})});const d=await r.json();if(!r.ok)alert(d.error||"Deployment failed");else alert("Deployment request completed.");router.refresh();setBusy(false)}
 return <button className="btn primary" disabled={busy||hosting!=="Vercel"} title={hosting!=="Vercel"?"Provider adapter not configured yet":"Deploy to Vercel"} onClick={deploy}>{busy?"Deploying…":"Deploy to Vercel"}</button>}

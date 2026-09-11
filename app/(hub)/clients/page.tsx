import { query } from "@/lib/db";
import ClientActions from "@/components/ClientActions";
export default async function Clients(){
 const r=await query<{id:string;name:string;company:string|null;email:string;status:string;project_count:string}>("select c.id,c.name,c.company,c.email,c.status,count(p.id)::text project_count from clients c left join projects p on p.client_id=c.id group by c.id order by c.created_at desc");
 return <main className="content"><div className="section-head"><div><h1>Clients</h1><div className="muted">Manage customers and their projects.</div></div><ClientActions mode="create"/></div>
 <div className="table-wrap"><table><thead><tr><th>Name</th><th>Company</th><th>Email</th><th>Status</th><th>Projects</th><th></th></tr></thead><tbody>
 {r.rows.map(c=><tr key={c.id}><td><b>{c.name}</b></td><td>{c.company||"—"}</td><td>{c.email}</td><td><span className={"badge "+(c.status==="ACTIVE"?"success":c.status==="SUSPENDED"?"danger":"warning")}>{c.status}</span></td><td>{c.project_count}</td><td><ClientActions mode="delete" id={c.id}/></td></tr>)}
 {!r.rows.length&&<tr><td colSpan={6}><div className="empty">No clients. Create your first client.</div></td></tr>}
 </tbody></table></div></main>
}
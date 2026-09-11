import { query } from "@/lib/db";
export default async function Dashboard(){
 const [c,p,d]=await Promise.all([
   query<{n:string}>("select count(*)::text n from clients"),
   query<{n:string}>("select count(*)::text n from projects"),
   query<{n:string}>("select count(*)::text n from deployments")
 ]);
 const recent=await query<{name:string;status:string;created_at:string}>("select p.name,d.status,d.created_at from deployments d join projects p on p.id=d.project_id order by d.created_at desc limit 8");
 return <main className="content">
  <div><h1>Dashboard</h1><div className="muted">A single control center for your client deployments.</div></div>
  <div className="grid stats">
   <div className="card"><div className="stat-label">Clients</div><div className="stat-value">{c.rows[0]?.n??0}</div></div>
   <div className="card"><div className="stat-label">Projects</div><div className="stat-value">{p.rows[0]?.n??0}</div></div>
   <div className="card"><div className="stat-label">Deployments</div><div className="stat-value">{d.rows[0]?.n??0}</div></div>
   <div className="card"><div className="stat-label">System</div><div className="stat-value" style={{fontSize:18,marginTop:15}}>Operational</div></div>
  </div>
  <div className="card"><div className="section-head"><h2>Recent deployments</h2></div>
   <div className="table-wrap"><table><thead><tr><th>Project</th><th>Status</th><th>Created</th></tr></thead><tbody>
    {recent.rows.map(x=><tr key={x.created_at+x.name}><td>{x.name}</td><td><span className={"badge "+(x.status==="SUCCESS"?"success":x.status==="FAILED"?"danger":"warning")}>{x.status}</span></td><td>{new Date(x.created_at).toLocaleString()}</td></tr>)}
    {!recent.rows.length&&<tr><td colSpan={3}><div className="empty">No deployments yet.</div></td></tr>}
   </tbody></table></div>
  </div>
 </main>
}
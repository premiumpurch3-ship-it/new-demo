import {query} from "@/lib/db";
import ProjectCreate from "@/components/ProjectCreate";
export default async function Projects(){
 const [p,c]=await Promise.all([
  query<{id:string;name:string;slug:string;framework:string;hosting:string;status:string;client_name:string}>("select p.id,p.name,p.slug,p.framework,p.hosting,p.status,c.name client_name from projects p join clients c on c.id=p.client_id order by p.created_at desc"),
  query<{id:string;name:string}>("select id,name from clients where status<>'SUSPENDED' order by name")
 ]);
 return <main className="content"><div className="section-head"><div><h1>Projects</h1><div className="muted">Create and configure deployable client applications.</div></div><ProjectCreate clients={c.rows}/></div>
 <div className="table-wrap"><table><thead><tr><th>Project</th><th>Client</th><th>Framework</th><th>Hosting</th><th>Status</th><th></th></tr></thead><tbody>{p.rows.map(x=><tr key={x.id}><td><b>{x.name}</b><div className="muted small">{x.slug}</div></td><td>{x.client_name}</td><td>{x.framework}</td><td>{x.hosting}</td><td><span className="badge success">{x.status}</span></td><td><a className="btn" href={"/projects/"+x.id}>Open</a></td></tr>)}{!p.rows.length&&<tr><td colSpan={6}><div className="empty">Create a client first, then create a project.</div></td></tr>}</tbody></table></div>
 </main>
}
export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function HubLayout({children}:{children:React.ReactNode}){
  const user=await getCurrentUser(); if(!user) redirect("/login");
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="logo">F</div><div>FZ247 Deploy Hub</div></div>
      <nav className="nav">
        <Link href="/dashboard">Dashboard</Link><Link href="/clients">Clients</Link><Link href="/projects">Projects</Link><Link href="/deployments">Deployments</Link><Link href="/settings">Settings</Link>
      </nav>
      <div className="side-note">Deploy and manage client projects from one place. Connect your own cloud accounts through environment variables.</div>
    </aside>
    <div className="main">
      <header className="topbar"><span className="muted small">Operations console</span><div className="actions"><span className="small">{user.name} · {user.role}</span><LogoutButton/></div></header>
      {children}
    </div>
  </div>
}
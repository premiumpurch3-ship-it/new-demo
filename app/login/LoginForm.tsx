 "use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function LoginForm(){
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  const router=useRouter();
  async function submit(e:React.FormEvent){e.preventDefault();setLoading(true);setError("");
    try{const r=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Login failed");router.push("/dashboard");router.refresh();}
    catch(e){setError(e instanceof Error?e.message:"Login failed");}finally{setLoading(false);}
  }
  return <form className="form" onSubmit={submit}>
    <div className="field"><label>Email</label><input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com"/></div>
    <div className="field"><label>Password</label><input className="input" type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/></div>
    {error&&<div className="error">{error}</div>}
    <button className="btn primary" disabled={loading}>{loading?"Signing in…":"Sign in"}</button>
    <div className="notice small">First-time setup: run <b>npm run db:init</b> and <b>npm run db:seed</b>. Default credentials are documented in SETUP.md.</div>
  </form>
}
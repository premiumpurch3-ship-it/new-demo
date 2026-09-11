import LoginForm from "./LoginForm";
export default function LoginPage() {
  return <main className="login"><div className="login-card">
    <div className="brand" style={{padding:"0 0 20px"}}><div className="logo">F</div><div>FZ247 Deploy Hub</div></div>
    <h1 style={{fontSize:24}}>Welcome back</h1><p className="muted" style={{marginTop:0,marginBottom:24}}>Sign in to manage clients, projects and deployments.</p>
    <LoginForm />
  </div></main>;
}

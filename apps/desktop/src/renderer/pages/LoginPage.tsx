import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { Button } from "../components/Button";
import { Card } from "../components/Card";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.tokens.accessToken);
        navigate("/connect");
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-background auth-layout">
      <Card className="auth-card">
        <div className="auth-content">
          <div className="brand-row">
            <img className="brand-logo" src={logo} alt="RinaWarp logo" />
            <div>
              <p className="brand-kicker">RinaWarp</p>
              <h1 className="page-title">Phone Toolkit</h1>
            </div>
          </div>
          <p className="body-copy">
            Manage, protect, and optimize devices with secure desktop tooling.
          </p>
        
          <form onSubmit={handleSubmit} className="form-stack">
            <div className="field-stack">
              <label className="field-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>
          
            <div className="field-stack">
              <label className="field-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
              />
            </div>
          
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        
          <div className="auth-footer">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-link">Sign up</a>
          </div>
        </div>
      </Card>
    </div>
  );
}

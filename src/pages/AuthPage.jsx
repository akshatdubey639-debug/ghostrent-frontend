import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setError("");
    setFormData({ name: "", email: "", password: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      return setError("All fields are required.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return setError("Please provide a valid email address.");
    }

    if (!isLogin && formData.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        ...(!isLogin && { name: formData.name }),
      };

      // ✅ SAFE BASE URL
      const baseURL = import.meta.env.VITE_API_URL;

      if (!baseURL) {
        console.error("❌ API URL missing in .env / Vercel");
        setError("Server configuration error.");
        return;
      }

      const endpoint = `${baseURL}${isLogin ? "/auth/login" : "/auth/signup"}`;

      console.log("ENV:", baseURL);
      console.log("ENDPOINT:", endpoint);

      const res = await axios.post(endpoint, payload);
      const data = res.data;

      login(data.token, data.user);
      navigate("/analyze");

    } catch (err) {
      console.error("Auth error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <div className="auth-brand-icon">🛡️</div>
          <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
          <p>{isLogin ? "Login to detect rental scams" : "Join to run your first scan"}</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${isLogin ? "active" : ""}`}
            onClick={() => !isLogin && toggleMode()}
          >
            Login
          </button>

          <button
            type="button"
            className={`auth-tab ${!isLogin ? "active" : ""}`}
            onClick={() => isLogin && toggleMode()}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && <div className="auth-error">{error}</div>}

          {!isLogin && (
            <div className="auth-field">
              <label>Full Name</label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email Address</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Loading..." : isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

      </div>
    </div>
  );
}
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Неверная почта или пароль.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050505",
        color: "#fff",
        padding: "24px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "40px",
          border: "1px solid rgba(255,255,255,.1)",
          background: "#090909",
        }}
      >
        <div
          style={{
            marginBottom: "8px",
            color: "#ed1c24",
            fontSize: "10px",
            letterSpacing: ".2em",
          }}
        >
          АГНИВА
        </div>

        <h1
          style={{
            margin: "0 0 32px",
            fontSize: "28px",
            fontWeight: 400,
          }}
        >
          Вход в управление
        </h1>

        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "11px",
            opacity: 0.55,
          }}
        >
          EMAIL
        </label>

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          style={{
            width: "100%",
            height: "48px",
            boxSizing: "border-box",
            marginBottom: "22px",
            padding: "0 14px",
            border: "1px solid rgba(255,255,255,.12)",
            outline: "none",
            background: "#050505",
            color: "#fff",
          }}
        />

        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "11px",
            opacity: 0.55,
          }}
        >
          ПАРОЛЬ
        </label>

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="current-password"
          style={{
            width: "100%",
            height: "48px",
            boxSizing: "border-box",
            marginBottom: "22px",
            padding: "0 14px",
            border: "1px solid rgba(255,255,255,.12)",
            outline: "none",
            background: "#050505",
            color: "#fff",
          }}
        />

        {error && (
          <p
            style={{
              margin: "0 0 18px",
              color: "#ed1c24",
              fontSize: "12px",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            height: "50px",
            border: 0,
            background: "#ed1c24",
            color: "#fff",
            cursor: loading ? "default" : "pointer",
            fontWeight: 600,
            letterSpacing: ".08em",
          }}
        >
          {loading ? "ВХОД..." : "ВОЙТИ"}
        </button>
      </form>
    </main>
  );
}
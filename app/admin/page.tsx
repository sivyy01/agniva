"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      setLoading(false);
    }

    checkSession();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace("/admin/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#fff",
          padding: "60px",
        }}
      >
        Загрузка...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        padding: "60px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            marginBottom: "60px",
          }}
        >
          <div>
            <div
              style={{
                color: "#ed1c24",
                fontSize: "10px",
                letterSpacing: ".22em",
                marginBottom: "10px",
              }}
            >
              АГНИВА
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "36px",
                fontWeight: 400,
              }}
            >
              Управление сайтом
            </h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              height: "42px",
              padding: "0 18px",
              border: "1px solid rgba(255,255,255,.15)",
              background: "transparent",
              color: "rgba(255,255,255,.7)",
              cursor: "pointer",
            }}
          >
            ВЫЙТИ
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "18px",
          }}
        >
          <Link
            href="/admin/events"
            style={{
              minHeight: "170px",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              border: "1px solid rgba(255,255,255,.1)",
              background: "#090909",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                color: "#ed1c24",
                fontSize: "10px",
                letterSpacing: ".18em",
              }}
            >
              КОНТЕНТ
            </span>

            <div>
              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "22px",
                  fontWeight: 400,
                }}
              >
                Афиша
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,.45)",
                  fontSize: "13px",
                }}
              >
                Добавление и редактирование событий
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
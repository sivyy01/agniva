import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function SupabaseTestPage() {
  const { data, error } = await supabase
    .from("events")
    .select("id, title, event_date, is_published")
    .limit(5);

  if (error) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#fff",
          padding: "60px",
        }}
      >
        <h1>Ошибка Supabase</h1>
        <pre>{error.message}</pre>
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
      <h1>Supabase подключён</h1>

      <p>Соединение с таблицей events работает.</p>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
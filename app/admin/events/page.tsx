"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  image_url: string | null;
  is_published: boolean;
};

export default function AdminEventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
const [uploading, setUploading] = useState(false);
const [deletingId, setDeletingId] = useState<string | null>(null);
const [editingId, setEditingId] = useState<string | null>(null);
  async function loadEvents() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/admin/login");
      return;
    }

    const { data, error } = await supabase
      .from("events")
      .select(
        "id, title, description, event_date, event_time, image_url, is_published"
      )
      .order("event_date", { ascending: true });

    if (error) {
      setMessage(`Ошибка: ${error.message}`);
      setLoading(false);
      return;
    }

    setEvents(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setSaving(true);
  setUploading(false);
  setMessage("");

  const editingItem =
    editingId !== null
      ? events.find((item) => item.id === editingId) ?? null
      : null;

  let imageUrl: string | null =
    editingItem?.image_url ?? null;

  let newImageUploaded = false;

  try {
    if (imageFile) {
      setUploading(true);

      const extension =
        imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName =
        `${Date.now()}-${crypto.randomUUID()}.${extension}`;

      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("event-images")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
      newImageUploaded = true;
    }

    const eventData = {
      title,
      description: description || null,
      event_date: eventDate,
      event_time: eventTime || null,
      image_url: imageUrl,
      is_published: isPublished,
    };

    if (editingId) {
      const { error: updateError } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", editingId);

      if (updateError) {
        throw updateError;
      }

      // Если при редактировании загрузили новую картинку —
      // удаляем старую из Storage.
      if (
        newImageUploaded &&
        editingItem?.image_url
      ) {
        const oldImagePath =
          getImagePath(editingItem.image_url);

        if (oldImagePath) {
          const { error: removeError } =
            await supabase.storage
              .from("event-images")
              .remove([oldImagePath]);

          if (removeError) {
            console.error(
              "Не удалось удалить старое изображение:",
              removeError
            );
          }
        }
      }

      setMessage("Событие обновлено.");
    } else {
      const { error: insertError } = await supabase
        .from("events")
        .insert(eventData);

      if (insertError) {
        throw insertError;
      }

      setMessage("Событие добавлено.");
    }

    setTitle("");
    setDescription("");
    setEventDate("");
    setEventTime("");
    setIsPublished(false);
    setImageFile(null);

    // ВАЖНО — выходим из режима редактирования
    setEditingId(null);

    await loadEvents();
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Неизвестная ошибка";

    setMessage(`Ошибка: ${errorMessage}`);
  } finally {
    setUploading(false);
    setSaving(false);
  }
}
function getImagePath(imageUrl: string) {
  const marker = "/event-images/";
  const markerIndex = imageUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(
    imageUrl
      .slice(markerIndex + marker.length)
      .split("?")[0]
  );
}

async function handleDelete(item: EventItem) {
  const confirmed = window.confirm(
    `Удалить событие «${item.title}»?`
  );

  if (!confirmed) {
    return;
  }

  setDeletingId(item.id);
  setMessage("");

  try {
    const { error: deleteEventError } = await supabase
      .from("events")
      .delete()
      .eq("id", item.id);

    if (deleteEventError) {
      throw deleteEventError;
    }

    if (item.image_url) {
      const imagePath = getImagePath(item.image_url);

      if (imagePath) {
        const { error: deleteImageError } =
          await supabase.storage
            .from("event-images")
            .remove([imagePath]);

        if (deleteImageError) {
          console.error(
            "Не удалось удалить изображение:",
            deleteImageError
          );
        }
      }
    }

    setMessage("Событие удалено.");
    await loadEvents();
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Неизвестная ошибка";

    setMessage(`Ошибка: ${errorMessage}`);
  } finally {
    setDeletingId(null);
  }
}


  return (
  
    <main
      style={{
        minHeight: "100vh",
        padding: "50px",
        background: "#050505",
        color: "#fff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <Link
          href="/admin"
          style={{
            color: "rgba(255,255,255,.5)",
            textDecoration: "none",
            fontSize: "12px",
          }}
        >
          ← НАЗАД
        </Link>

        <div
          style={{
            marginTop: "28px",
            marginBottom: "42px",
          }}
        >
          <span
            style={{
              color: "#ed1c24",
              fontSize: "10px",
              letterSpacing: ".2em",
            }}
          >
            УПРАВЛЕНИЕ
          </span>

          <h1
            style={{
              margin: "10px 0 0",
              fontSize: "38px",
              fontWeight: 400,
            }}
          >
            Афиша
          </h1>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "380px 1fr",
            gap: "30px",
            alignItems: "start",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              padding: "26px",
              border: "1px solid rgba(255,255,255,.1)",
              background: "#090909",
            }}
          >
            <h2
              style={{
                margin: "0 0 26px",
                fontSize: "20px",
                fontWeight: 400,
              }}
            >
             {editingId ? "Редактирование события" : "Новое событие"}
            </h2>

            <label style={labelStyle}>НАЗВАНИЕ</label>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              style={inputStyle}
            />

            <label style={labelStyle}>ДАТА</label>

            <input
              type="date"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
              required
              style={inputStyle}
            />

            <label style={labelStyle}>ВРЕМЯ</label>

            <input
              type="time"
              value={eventTime}
              onChange={(event) => setEventTime(event.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>ОПИСАНИЕ</label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              style={{
                ...inputStyle,
                height: "auto",
                padding: "14px",
                resize: "vertical",
              }}
            />
            <label style={labelStyle}>ИЗОБРАЖЕНИЕ</label>

<input
  type="file"
  accept="image/jpeg,image/png,image/webp"
  onChange={(event) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
  }}
  style={{
    width: "100%",
    boxSizing: "border-box",
    marginBottom: "22px",
    padding: "12px",
    border: "1px solid rgba(255,255,255,.12)",
    background: "#050505",
    color: "rgba(255,255,255,.65)",
  }}
/>



            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "24px",
                color: "rgba(255,255,255,.65)",
                fontSize: "12px",
              }}
            >
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(event) => setIsPublished(event.target.checked)}
              />

              Опубликовать сразу
            </label>

            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                height: "48px",
                border: 0,
                background: "#ed1c24",
                color: "#fff",
                cursor: saving ? "default" : "pointer",
                fontWeight: 600,
              }}
            >
             {uploading
  ? "ЗАГРУЗКА ИЗОБРАЖЕНИЯ..."
  : saving
    ? "СОХРАНЕНИЕ..."
    : editingId
      ? "СОХРАНИТЬ ИЗМЕНЕНИЯ"
      : "ДОБАВИТЬ СОБЫТИЕ"}
            </button>

            {message && (
              <p
                style={{
                  margin: "18px 0 0",
                  color: message.startsWith("Ошибка")
                    ? "#ed1c24"
                    : "rgba(255,255,255,.65)",
                  fontSize: "12px",
                }}
              >
                {message}
              </p>
            )}
          </form>

          <section>
            <h2
              style={{
                margin: "0 0 20px",
                fontSize: "20px",
                fontWeight: 400,
              }}
            >
              События
            </h2>

            {loading && (
              <p style={{ opacity: 0.5 }}>
                Загрузка...
              </p>
            )}

            {!loading && events.length === 0 && (
              <div
                style={{
                  padding: "40px",
                  border: "1px solid rgba(255,255,255,.08)",
                  color: "rgba(255,255,255,.4)",
                }}
              >
                Событий пока нет.
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                
              }}
            >
              {events.map((item) => (
                <article
                  key={item.id}
                  style={{
                    padding: "20px",
                    border: "1px solid rgba(255,255,255,.09)",
                    background: "#090909",
                  }}
                >
                    {item.image_url && (
  <img
    src={item.image_url}
    alt={item.title}
    style={{
      display: "block",
      width: "100%",
      height: "auto",
maxHeight: "520px",
marginBottom: "18px",
objectFit: "contain",
objectPosition: "center",
background: "#050505",
      border: "1px solid rgba(255,255,255,.07)",
    }}
  />
)}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: "0 0 8px",
                          fontSize: "17px",
                          fontWeight: 400,
                        }}
                      >
                        {item.title}
                      </h3>

                      <span
                        style={{
                          color: "rgba(255,255,255,.45)",
                          fontSize: "12px",
                        }}
                      >
                        {item.event_date}
                        {item.event_time
                          ? ` · ${item.event_time.slice(0, 5)}`
                          : ""}
                      </span>
                    </div>

                    <span
                      style={{
                        color: item.is_published
                          ? "#ed1c24"
                          : "rgba(255,255,255,.35)",
                        fontSize: "10px",
                        letterSpacing: ".08em",
                      }}
                    >
                      {item.is_published
                        ? "ОПУБЛИКОВАНО"
                        : "ЧЕРНОВИК"}
                    </span>
                  </div>
                                    <div
  style={{
    marginTop: "18px",
    paddingTop: "14px",
    borderTop: "1px solid rgba(255,255,255,.06)",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  }}
>
  <button
    type="button"
    onClick={() => {
      setEditingId(item.id);
      setTitle(item.title);
      setDescription(item.description ?? "");
      setEventDate(item.event_date);
      setEventTime(item.event_time?.slice(0, 5) ?? "");
      setIsPublished(item.is_published);
      setImageFile(null);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }}
    style={{
      border: "1px solid rgba(255,255,255,.18)",
      background: "transparent",
      color: "rgba(255,255,255,.7)",
      padding: "9px 14px",
      cursor: "pointer",
      fontSize: "10px",
      letterSpacing: ".08em",
    }}
  >
    РЕДАКТИРОВАТЬ
  </button>

  <button
    type="button"
    onClick={() => handleDelete(item)}
    disabled={deletingId === item.id}
    style={{
      border: "1px solid rgba(237,28,36,.55)",
      background: "transparent",
      color: "#ed1c24",
      padding: "9px 14px",
      cursor:
        deletingId === item.id
          ? "default"
          : "pointer",
      fontSize: "10px",
      letterSpacing: ".08em",
      opacity:
        deletingId === item.id
          ? 0.5
          : 1,
    }}
  >
    {deletingId === item.id
      ? "УДАЛЕНИЕ..."
      : "УДАЛИТЬ"}
  </button>
</div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  color: "rgba(255,255,255,.45)",
  fontSize: "10px",
  letterSpacing: ".08em",
};

const inputStyle = {
  width: "100%",
  height: "44px",
  boxSizing: "border-box" as const,
  marginBottom: "18px",
  padding: "0 12px",
  border: "1px solid rgba(255,255,255,.12)",
  outline: "none",
  background: "#050505",
  color: "#fff",
};
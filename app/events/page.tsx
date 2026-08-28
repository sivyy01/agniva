"use client";


import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { BOOKING_LINK } from "@/lib/siteLinks";
import styles from "./Events.module.css";

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  image_url: string | null;
};

const MONTHS = [
  "ЯНВАРЯ",
  "ФЕВРАЛЯ",
  "МАРТА",
  "АПРЕЛЯ",
  "МАЯ",
  "ИЮНЯ",
  "ИЮЛЯ",
  "АВГУСТА",
  "СЕНТЯБРЯ",
  "ОКТЯБРЯ",
  "НОЯБРЯ",
  "ДЕКАБРЯ",
];

function formatDate(value: string) {
  const [, month, day] = value.split("-");

  return `${Number(day)} ${MONTHS[Number(month) - 1]}`;
}

function getAgnivaToday() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Novokuznetsk",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find(
    (part) => part.type === "year"
  )?.value;

  const month = parts.find(
    (part) => part.type === "month"
  )?.value;

  const day = parts.find(
    (part) => part.type === "day"
  )?.value;

  return `${year}-${month}-${day}`;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      const today = getAgnivaToday();

      const { data, error } = await supabase
        .from("events")
        .select(
          "id, title, description, event_date, event_time, image_url"
        )
        .eq("is_published", true)
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .order("event_time", {
          ascending: true,
          nullsFirst: false,
        });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setEvents(data ?? []);
      setLoading(false);
    }

    loadEvents();
  }, []);

  const featuredEvent = events[0];
  const otherEvents = events.slice(1);

  return (
    <main className={styles.page}>
      

      <section className={styles.intro}>
  <div className={styles.introCopy}>
    <div className={styles.index}>
  <i />
  <span>АФИША</span>
</div>

    <h1>
      ЭТОТ ВЕЧЕР
      <br />
      МОЖЕТ НАЧАТЬСЯ
      <br />
      ЗДЕСЬ.
    </h1>

    <p>
      Атмосферные события, живые эмоции
      <br />
      и особая энергия Агнивы.
    </p>

    {!loading && !error && featuredEvent && (
      <a
        href="#featured-event"
        className={styles.heroAction}
      >
        СМОТРЕТЬ АФИШУ
        <span>→</span>
      </a>
    )}
  </div>

  <div className={styles.introVisual}>
    <img
      src="/images/events-atmosphere.png"
      alt="Атмосфера Агнивы"
    />

    <div className={styles.visualShade} />

    {!loading && !error && featuredEvent && (
      <div className={styles.eventPreview}>
        <span className={styles.eventPreviewLabel}>
          БЛИЖАЙШЕЕ СОБЫТИЕ
        </span>

        <div className={styles.eventPreviewDate}>
          {formatDate(featuredEvent.event_date)}

          {featuredEvent.event_time &&
            ` · ${featuredEvent.event_time.slice(0, 5)}`}
        </div>

        <h2>{featuredEvent.title}</h2>

        {featuredEvent.description && (
          <p>{featuredEvent.description}</p>
        )}

        <a href="#featured-event">
          ПОДРОБНЕЕ
          <span>→</span>
        </a>
      </div>
    )}
  </div>
</section>

      {loading && (
        <section className={styles.loading}>
          ЗАГРУЖАЕМ АФИШУ...
        </section>
      )}

      {!loading && error && (
        <section className={styles.empty}>
          <span>АФИША</span>

          <h2>
            СЕЙЧАС МЫ ОБНОВЛЯЕМ
            <br />
            СОБЫТИЯ.
          </h2>

          <p>
            Загляните сюда немного позже.
          </p>
        </section>
      )}

      {!loading && !error && events.length === 0 && (
        <section className={styles.empty}>
          <span>СКОРО</span>

          <h2>
            НОВЫЕ СОБЫТИЯ
            <br />
            УЖЕ ГОТОВЯТСЯ.
          </h2>

          <p>
            Следите за обновлениями —
            скоро здесь появятся новые вечера Агнивы.
          </p>

          <a
  href={BOOKING_LINK}
  target="_blank"
  rel="noreferrer"
  className={styles.emptyButton}
>
  ЗАБРОНИРОВАТЬ СТОЛ
  <span>↗</span>
</a>
        </section>
      )}

      {!loading && !error && featuredEvent && (
        <>
          <section
  id="featured-event"
  className={styles.featured}
>
            <div className={styles.featuredImage}>
              {featuredEvent.image_url ? (
                <img
                  src={featuredEvent.image_url}
                  alt={featuredEvent.title}
                />
              ) : (
                <div className={styles.noImage}>
                  АГНИВА
                </div>
              )}
            </div>

            <div className={styles.featuredContent}>
              <span className={styles.date}>
                {formatDate(
                  featuredEvent.event_date
                )}

                {featuredEvent.event_time && (
                  <>
                    {" · "}
                    {featuredEvent.event_time.slice(
                      0,
                      5
                    )}
                  </>
                )}
              </span>

              <h2>{featuredEvent.title}</h2>

              {featuredEvent.description && (
                <p>
                  {featuredEvent.description}
                </p>
              )}

              <a
  href={BOOKING_LINK}
  target="_blank"
  rel="noreferrer"
  className={styles.eventButton}
>
  ЗАБРОНИРОВАТЬ СТОЛ
  <span>↗</span>
</a>
            </div>
          </section>

          {otherEvents.length > 0 && (
            <section className={styles.more}>
              <div className={styles.moreHeader}>
                <span>СЛЕДУЮЩИЕ СОБЫТИЯ</span>
                <i />
              </div>

              <div className={styles.grid}>
                {otherEvents.map((item) => (
                  <article
                    key={item.id}
                    className={styles.card}
                  >
                    <div className={styles.cardImage}>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                        />
                      ) : (
                        <div
                          className={styles.noImage}
                        >
                          АГНИВА
                        </div>
                      )}
                    </div>

                    <div className={styles.cardContent}>
                      <span>
                        {formatDate(
                          item.event_date
                        )}

                        {item.event_time &&
                          ` · ${item.event_time.slice(
                            0,
                            5
                          )}`}
                      </span>

                      <h3>{item.title}</h3>

                      {item.description && (
                        <p>{item.description}</p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
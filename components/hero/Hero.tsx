"use client";

import { useState } from "react";
import { BOOKING_LINK } from "@/lib/siteLinks";
import styles from "./Hero.module.css";

export function Hero() {
  const [bookingOpen, setBookingOpen] =
    useState(false);

  return (
    <section className={styles.hero}>
      <div className={styles.sidePatternLeft} />
      <div className={styles.sidePatternRight} />

      <div className={styles.content}>
        <div
          className={styles.titleOrnament}
          aria-hidden="true"
        />

        <h1 className={styles.title}>
          МЕСТО
          <br />
          ДЫМНОЙ
          <br />
          КУЛЬТУРЫ
        </h1>

        <div className={styles.directions}>
          <span>КУХНЯ</span>
          <i />
          <span>БАР</span>
          <i />
          <span>ДЫМНАЯ КУЛЬТУРА</span>
        </div>

        <div className={styles.actions}>
          <a
            href="/menu"
            className={styles.primaryButton}
          >
            СМОТРЕТЬ МЕНЮ
            <span>›</span>
          </a>

          <div className={styles.bookingWrap}>
            <a
              href={BOOKING_LINK}
              className={`${styles.secondaryButton} ${styles.mobileBookingButton}`}
            >
              ЗАБРОНИРОВАТЬ
              <span>›</span>
            </a>

            <button
              type="button"
              className={`${styles.secondaryButton} ${styles.desktopBookingButton}`}
              onClick={() =>
                setBookingOpen(
                  (current) => !current
                )
              }
            >
              ЗАБРОНИРОВАТЬ
              <span>›</span>
            </button>

            {bookingOpen && (
              <div
                className={
                  styles.bookingPopover
                }
              >
                <span>
                  БРОНИРОВАНИЕ
                </span>

                <strong>
                  +7 923 030-11-77
                </strong>

                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(
                      "+79230301177"
                    );
                  }}
                >
                  СКОПИРОВАТЬ НОМЕР
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.manifesto}>
          <div
            className={
              styles.manifestoLabel
            }
          >
            СУТЬ АГНИВЫ
          </div>

          <p
            className={
              styles.manifestoText
            }
          >
            <strong>АГНИВА</strong> —
            место, где кухня, бар и дымная
            культура становятся частью
            одного вечера. Здесь
            встречаются, остаются дольше,
            чем планировали, и
            возвращаются за атмосферой.
          </p>
        </div>
      </div>

      <div className={styles.scrollHint}>
        <span />
      </div>
    </section>
  );
}
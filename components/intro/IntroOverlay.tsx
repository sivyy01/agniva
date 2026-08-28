"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
} from "react";

import styles from "./IntroOverlay.module.css";

const SPARK_COUNT = 44;

type SparkStyle = CSSProperties & {
  "--x": string;
  "--delay": string;
  "--duration": string;
  "--drift": string;
  "--length": string;
};

export function IntroOverlay() {
  const [isLeaving, setIsLeaving] =
    useState(false);

  const [isHidden, setIsHidden] =
    useState(false);

  useEffect(() => {
    const leaveTimer =
      window.setTimeout(() => {
        setIsLeaving(true);
      }, 3600);

    const hideTimer =
      window.setTimeout(() => {
        setIsHidden(true);
      }, 4500);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (isHidden) {
    return null;
  }

  return (
    <div
      className={`${styles.overlay} ${
        isLeaving
          ? styles.overlayLeaving
          : ""
      }`}
      aria-hidden="true"
    >
      <div className={styles.background} />
      <div className={styles.redGlow} />

      <div
        className={styles.ornamentTop}
      />

      <div
        className={styles.ornamentBottom}
      />

      <div className={styles.sparks}>
        {Array.from(
          { length: SPARK_COUNT },
          (_, index) => {
            const style: SparkStyle = {
              "--x": `${
                2 + ((index * 37) % 96)
              }%`,

              "--delay": `${
                (index % 13) * 0.11
              }s`,

              "--duration": `${
                2.1 +
                (index % 8) * 0.22
              }s`,

              "--drift": `${
                -46 +
                (index % 11) * 9
              }px`,

              "--length": `${
                8 +
                (index % 7) * 4
              }px`,
            };

            return (
              <span
                key={index}
                className={styles.spark}
                style={style}
              />
            );
          }
        )}
      </div>

      <div className={styles.brand}>
        <div
          className={styles.logoMotion}
        >
          <div
            className={styles.logoStage}
            role="img"
            aria-label="Агнива"
          >
            <div
              className={
                styles.logoMetal
              }
            />

            <div
              className={
                styles.logoEmber
              }
            />

            <div
              className={
                styles.logoSheen
              }
            />
          </div>
        </div>

        <p className={styles.tagline}>
          МЕСТО ДЫМНОЙ КУЛЬТУРЫ
        </p>
      </div>
    </div>
  );
}
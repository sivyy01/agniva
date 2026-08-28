import Image from "next/image";
import styles from "./Intro.module.css";

export function Intro() {
  return (
    <section className={styles.intro} aria-label="Заставка Агнива">
      <div className={styles.texture} />
      <div className={styles.redGlow} />
      <div className={styles.smokeA} />
      <div className={styles.smokeB} />
      <div className={styles.embers} />

      <div className={styles.sparks} aria-hidden="true">
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} className={styles.spark} />
        ))}
      </div>

      <div className={styles.ornamentTop}>
        <Image
          src="/brand/agniva-ornament.svg"
          alt=""
          width={1200}
          height={40}
          priority
          aria-hidden="true"
        />
      </div>

      <div className={styles.brand}>
        <div className={styles.logoWrap}>
          <div
            className={styles.logoMetal}
            role="img"
            aria-label="Агнива"
          />
          <div className={styles.logoSheen} />
        </div>

        <p className={styles.tagline}>МЕСТО ДЫМНОЙ КУЛЬТУРЫ</p>
      </div>

      <div className={styles.ornamentBottom}>
        <Image
          src="/brand/agniva-ornament.svg"
          alt=""
          width={1200}
          height={40}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
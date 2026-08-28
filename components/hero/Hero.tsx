
import styles from "./Hero.module.css";

export function Hero() {
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

  <a
    href="#booking"
    className={styles.secondaryButton}
  >
    ЗАБРОНИРОВАТЬ
    <span>›</span>
  </a>
</div>

<div className={styles.manifesto}>
  <div className={styles.manifestoLabel}>
    СУТЬ АГНИВЫ
  </div>

  <p className={styles.manifestoText}>
    <strong>АГНИВА</strong> — место,
    где кухня, бар и дымная культура
    становятся частью одного вечера.
    Здесь встречаются, остаются дольше,
    чем планировали, и возвращаются
    за атмосферой.
  </p>
</div>
      </div>

      <div className={styles.scrollHint}>
        <span />
      </div>
    </section>
  );
}
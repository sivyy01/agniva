import {
  BOOKING_LINK,
  SOCIAL_LINKS,
} from "@/lib/siteLinks";

import styles from "./ContactsSection.module.css";



export function ContactsSection() {
  return (
    <section
      id="contacts"
      className={styles.contacts}
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
          <div className={styles.index}>
  <i />
  <span>КОНТАКТЫ</span>
</div>

          <h2>
            ВСТРЕТИМСЯ
            <br />
            В <em>АГНИВЕ.</em>
          </h2>

          <p className={styles.lead}>
            Место, где вечер начинается
            с атмосферы и продолжается
            столько, сколько хочется.
          </p>
        </div>

        <div className={styles.info}>
          <article className={styles.infoItem}>
            <span>01</span>

            <div>
              <small>АДРЕС</small>

              <h3>
                Новокузнецк
                <br />
                проспект Николая Ермакова, 30а
              </h3>
            </div>
          </article>

          <article className={styles.infoItem}>
            <span>02</span>

            <div>
              <small>РЕЖИМ РАБОТЫ</small>

              <h3>Круглосуточно</h3>
            </div>
          </article>

                    <article className={styles.infoItem}>
            <span>03</span>

            <div>
              <small>ТЕЛЕФОН</small>

              <a href="tel:+79230301177">
                +7 923 030-11-77
              </a>
            </div>
          </article>

          <div className={styles.socials}>
            <a
              href={SOCIAL_LINKS.telegramBot}
              target="_blank"
              rel="noreferrer"
            >
              TELEGRAM
              <span>↗</span>
            </a>

            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noreferrer"
            >
              INSTAGRAM
              <span>↗</span>
            </a>

            <a
              href={SOCIAL_LINKS.vk}
              target="_blank"
              rel="noreferrer"
            >
              ВКОНТАКТЕ
              <span>↗</span>
            </a>
          </div>

          <div
            id="booking"
            className={styles.booking}
          >


          
            <span className={styles.bookingLabel}>
              БРОНИРОВАНИЕ
            </span>

            <h3>
              ВАШ ВЕЧЕР
              <br />
              НАЧИНАЕТСЯ
              <br />
              <em>ЗДЕСЬ.</em>
            </h3>

            <p>
              Забронируйте стол заранее —
              мы подготовим пространство
              к вашему приходу.
            </p>

            <a
              href={BOOKING_LINK}
target="_blank"
rel="noreferrer"
              className={styles.bookingButton}
            >
              ЗАБРОНИРОВАТЬ
              <span>→</span>
            </a>
          </div>
        </div>
      </div>

      <footer className={styles.bottom}>
  <div className={styles.brandFooter}>
    <span>АГНИВА</span>

    <span>
      МЕСТО ДЫМНОЙ КУЛЬТУРЫ
    </span>

    <span>
      НОВОКУЗНЕЦК
    </span>
  </div>

  <a
    href="https://www.aiva-digital.ru/"
    target="_blank"
    rel="noreferrer"
    className={styles.studioCredit}
  >
    <small>
      DIGITAL EXPERIENCE BY
    </small>

    <strong>
      AIVA DIGITAL
      <span>↗</span>
    </strong>

    <i />

    <small>
      DIGITAL PRODUCTS FOR BUSINESS
    </small>
  </a>
</footer>
    </section>
  );
}
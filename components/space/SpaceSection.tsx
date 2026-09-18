import styles from "./SpaceSection.module.css";

const images = [
  {
    src: "/images/space/space-01.webp",
    alt: "Атмосфера Агнивы",
  },
  {
    src: "/images/space/space-02.webp",
    alt: "DJ в Агниве",
  },
  {
    src: "/images/space/space-03.webp",
    alt: "Интерьер Агнивы",
  },
  {
    src: "/images/space/space-04.webp",
    alt: "Бар Агнивы",
  },
  {
    src: "/images/space/space-05.webp",
    alt: "Кухня и бар Агнивы",
  },
  {
    src: "/images/space/space-06.webp",
    alt: "Барная эстетика Агнивы",
  },
  {
    src: "/images/space/space-07.webp",
    alt: "Дымная культура Агнивы",
  },
  {
    src: "/images/space/space-08.webp",
    alt: "Кухня Агнивы",
  },
  {
    src: "/images/space/space-09.webp",
    alt: "Пространство Агнивы",
  },
  {
    src: "/images/space/space-10.webp",
    alt: "Музыка в Агниве",
  },
];

export function SpaceSection() {
  return (
    <section
      id="space"
      className={styles.space}
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
        <div className={styles.index}>
  <i />
  <span>ПРОСТРАНСТВО</span>
</div>

          <h2>
  АТМОСФЕРА,
  <br />
  РАДИ КОТОРОЙ
  <br />
  ХОЧЕТСЯ
  <br />
  <em>ВЕРНУТЬСЯ.</em>
</h2>

          <p>
            Свет, фактура, авторская подача,
            барная эстетика и живая энергия
            Агнивы — всё пространство работает
            на настроение вечера.
          </p>

          

          <div
            className={styles.symbol}
            aria-hidden="true"
          >
            ◇
          </div>
        </div>

        <div
          id="space-gallery"
          className={styles.gallery}
        >
          {images.map((image, index) => (
            <figure
              key={image.src}
              className={`${styles.item} ${
                styles[`item${index + 1}`]
              }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading={
                  index < 4
                    ? "eager"
                    : "lazy"
                }
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
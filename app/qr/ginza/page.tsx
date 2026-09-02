import type { Metadata } from "next";

import {
  getYumaMenu,
} from "@/lib/yuma-menu";

import styles from "../../menu/Menu.module.css";

export const metadata: Metadata = {
  title: "Ginza | Агнива",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

function formatPrice(
  price: number | null
) {
  if (
    price === null ||
    !Number.isFinite(price)
  ) {
    return "";
  }

  return `${new Intl.NumberFormat(
    "ru-RU"
  ).format(price)} ₽`;
}

export default async function GinzaPage() {
  const menu =
    await getYumaMenu("ginza");

  return (
    <main className={styles.page}>
      <section
        className={styles.intro}
      >
        <div>
          <h1>GINZA</h1>
        </div>

        <div
          className={
            styles.philosophy
          }
        >
          <p>
            QR-меню веранды
            <br />
            Агнива × Ginza
          </p>
        </div>
      </section>

      <section
        className={`${styles.menuGrid} ${styles.menuGridFiltered}`}
      >
        {menu.categories.map(
          (category) => (
            <section
              key={category.id}
              className={
                styles.column
              }
            >
              <div
                className={
                  styles.columnHeader
                }
              >
                <div
                  className={
                    styles.columnTitle
                  }
                >
                  <span
                    className={`${styles.columnIcon} ${styles["icon-smoke"]}`}
                    aria-hidden="true"
                  />

                  <h2>
                    {category.name.toUpperCase()}
                  </h2>
                </div>
              </div>

              <div
                className={
                  styles.cards
                }
              >
                {category.items.map(
                  (item) => (
                    <article
                      key={item.id}
                      className={
                        styles.card
                      }
                      style={{
                        cursor:
                          "default",
                      }}
                    >
                      <div
                        className={
                          styles.cardImage
                        }
                        style={
                          item.image
                            ? {
                                backgroundImage:
                                  `url("${item.image}")`,
                                backgroundSize:
                                  "cover",
                                backgroundPosition:
                                  "center",
                              }
                            : undefined
                        }
                      >
                        {!item.image && (
                          <div
                            className={
                              styles.imagePlaceholder
                            }
                          >
                            <span>
                              АГНИВА
                            </span>
                          </div>
                        )}
                      </div>

                      <div
                        className={
                          styles.cardContent
                        }
                      >
                        <div
                          className={
                            styles.cardTop
                          }
                        >
                          <h3>
                            {item.name}
                          </h3>

                          {item.price !==
                            null && (
                            <span
                              className={
                                styles.price
                              }
                            >
                              {formatPrice(
                                item.price
                              )}
                            </span>
                          )}
                        </div>

                        {item.description && (
                          <p>
                            {
                              item.description
                            }
                          </p>
                        )}
                      </div>
                    </article>
                  )
                )}
              </div>
            </section>
          )
        )}
      </section>

      <section
        className={
          styles.brandBanner
        }
      >
        <div
          className={
            styles.brandMark
          }
        >
          <span />
        </div>

        <div
          className={
            styles.brandBannerText
          }
        >
          <h2>
            АГНИВА × GINZA
          </h2>

          <p>
            Специальное меню
            веранды.
          </p>
        </div>

        <div
          className={
            styles.fireVisual
          }
        />
      </section>
    </main>
  );
}
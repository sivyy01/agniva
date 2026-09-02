import type { Metadata } from "next";

import {
  getYumaMenu,
} from "@/lib/yuma-menu";

import styles from "./GinzaPage.module.css";

export const metadata: Metadata = {
  title: "QR Ginza | Агнива",
  description:
    "Специальное QR-меню Агнивы.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

const HOOKAH_PHONE =
  "+79235044111";

const HOOKAH_PHONE_LABEL =
  "8 (923) 504-41-11";

const GINZA_HOOKAH_CATEGORY_ID =
  "469babbc-1396-4bf8-c986-c7e84c9406d9";

const CLASSIC_HOOKAH_ITEM_ID =
  "c0712980-e0eb-4819-c8e6-bf51af9d47a4";

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
      <div
        className={styles.topPattern}
        aria-hidden="true"
      />

      <section
        className={
          styles.heroSection
        }
      >
        <div
          className={styles.heroShade}
          aria-hidden="true"
        />

        <div className={styles.hero}>
          <div
            className={
              styles.heroContent
            }
          >
            <img
              src="/brand/agniva-logo.svg"
              alt="Агнива — место дымной культуры"
              className={
                styles.brandLogo
              }
            />
          </div>
        </div>

        <section
          className={
            styles.menuSection
          }
        >
          <span
            className={
              styles.menuEyebrow
            }
          >
            СПЕЦИАЛЬНОЕ МЕНЮ
          </span>

          {menu.categories.map(
            (category) => {
              const showCategoryTitle =
                category.id !==
                GINZA_HOOKAH_CATEGORY_ID;

              return (
                <section
                  key={category.id}
                  className={
                    styles.menuCategory
                  }
                >
                  {showCategoryTitle && (
                    <div
                      className={
                        styles.categoryHeader
                      }
                    >
                      <h2>
                        {category.name}
                      </h2>
                    </div>
                  )}

                  <div
                    className={
                      styles.itemsGrid
                    }
                  >
                    {category.items.map(
                      (item) => {
                        const isClassicHookah =
                          item.id ===
                          CLASSIC_HOOKAH_ITEM_ID;

                        const displayName =
                          isClassicHookah
                            ? "КАЛЬЯН"
                            : item.name;

                        const displayDescription =
                          isClassicHookah
                            ? "(НА ЛЮБОМ ТАБАКЕ)"
                            : item.description;

                        return (
                          <article
                            key={item.id}
                            className={
                              styles.menuItem
                            }
                          >
                            <div
                              className={
                                styles.itemMain
                              }
                            >
                              <div
                                className={
                                  styles.itemText
                                }
                              >
                                <h3>
                                  {
                                    displayName
                                  }
                                </h3>

                                {displayDescription && (
                                  <p>
                                    {
                                      displayDescription
                                    }
                                  </p>
                                )}
                              </div>

                              {item.price !==
                                null && (
                                <strong
                                  className={
                                    styles.itemPrice
                                  }
                                >
                                  {formatPrice(
                                    item.price
                                  )}
                                </strong>
                              )}
                            </div>

                            {isClassicHookah && (
                              <>
                                <div
                                  className={
                                    styles.itemActions
                                  }
                                >
                                  <a
                                    href={`tel:${HOOKAH_PHONE}`}
                                    className={
                                      styles.primaryButton
                                    }
                                  >
                                    ЗАКАЗАТЬ КАЛЬЯН
                                    <span>
                                      ›
                                    </span>
                                  </a>

                                  <a
                                    href={`tel:${HOOKAH_PHONE}`}
                                    className={
                                      styles.secondaryButton
                                    }
                                  >
                                    ПОЗВАТЬ КАЛЬЯНЩИКА
                                    <span>
                                      ›
                                    </span>
                                  </a>
                                </div>

                                <div
                                  className={
                                    styles.itemContact
                                  }
                                >
                                  <span>
                                    СДЕЛАТЬ ЗАКАЗ / ПОЗВАТЬ
                                  </span>

                                  <a
                                    href={`tel:${HOOKAH_PHONE}`}
                                  >
                                    {
                                      HOOKAH_PHONE_LABEL
                                    }
                                  </a>
                                </div>
                              </>
                            )}
                          </article>
                        );
                      }
                    )}

                    {category.children.flatMap(
                      (child) =>
                        child.items.map(
                          (item) => (
                            <article
                              key={item.id}
                              className={
                                styles.menuItem
                              }
                            >
                              <div
                                className={
                                  styles.itemMain
                                }
                              >
                                <div
                                  className={
                                    styles.itemText
                                  }
                                >
                                  <h3>
                                    {
                                      item.name
                                    }
                                  </h3>

                                  {item.description && (
                                    <p>
                                      {
                                        item.description
                                      }
                                    </p>
                                  )}
                                </div>

                                {item.price !==
                                  null && (
                                  <strong
                                    className={
                                      styles.itemPrice
                                    }
                                  >
                                    {formatPrice(
                                      item.price
                                    )}
                                  </strong>
                                )}
                              </div>
                            </article>
                          )
                        )
                    )}
                  </div>
                </section>
              );
            }
          )}
        </section>
      </section>
    </main>
  );
}
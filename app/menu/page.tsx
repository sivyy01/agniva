"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import styles from "./Menu.module.css";

type ApiMenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number | null;
  weight: number | null;
  unit: string | null;
  image: string | null;
  sortOrder: number;
};

type ApiMenuCategory = {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  image: string | null;
  sortOrder: number;
  items: ApiMenuItem[];
  children: ApiMenuCategory[];
};

type ApiMenu = {
  profile: "venue";
  storeId: string;
  categoryCount: number;
  itemCount: number;
  categories: ApiMenuCategory[];
};

type ApiResponse = {
  ok: boolean;
  menu?: ApiMenu;
  error?: string;
};

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string | null;
  weight: number | null;
  unit: string | null;
};

type MenuTab =
  | "all"
  | "kitchen"
  | "bar"
  | "smoke";

/*
 * Корневые категории Yuma.
 */
const ROOT_IDS = {
  kitchen:
    "c049a6cd-4a95-4ffc-ef99-e378b7666a8a",

  bar:
    "01c6a9ff-94dc-4def-c0bf-47c9656739da",

  smoke:
    "47a9373e-de06-4dfa-c830-7d8515a14dcd",
} as const;
const BUSINESS_LUNCH_CATEGORY_ID =
  "b2e7ac69-3039-4090-e71d-001a2acfcf1d";

const NOVOKUZNETSK_TIME_ZONE =
  "Asia/Novokuznetsk";
function isBusinessLunchAvailable(
  date: Date
) {
  const parts =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone:
          NOVOKUZNETSK_TIME_ZONE,
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }
    ).formatToParts(date);

  const weekday =
    parts.find(
      (part) =>
        part.type === "weekday"
    )?.value;

  const hour = Number(
    parts.find(
      (part) =>
        part.type === "hour"
    )?.value ?? 0
  );

  const minute = Number(
    parts.find(
      (part) =>
        part.type === "minute"
    )?.value ?? 0
  );

  const isWeekday = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ].includes(weekday ?? "");

  const totalMinutes =
    hour * 60 + minute;

  return (
    isWeekday &&
    totalMinutes >= 12 * 60 &&
    totalMinutes < 16 * 60
  );
}
function filterBusinessLunch(
  category: ApiMenuCategory,
  isAvailable: boolean
): ApiMenuCategory {
  return {
    ...category,

    children:
      category.children
        .filter(
          (child) =>
            isAvailable ||
            child.id !==
              BUSINESS_LUNCH_CATEGORY_ID
        )
        .map((child) =>
          filterBusinessLunch(
            child,
            isAvailable
          )
        ),
  };
}
const HIDDEN_PUBLIC_ITEM_NAMES = new Set([
  "Забивка",
  "Уголь для кальяна по штучно",
  "Уголь для кальяна поштучно",
  "Молоко колба",
  "Вино в колбу",
]);

function isPublicMenuItem(
  item: ApiMenuItem
) {
  return !HIDDEN_PUBLIC_ITEM_NAMES.has(
    item.name.trim()
  );
}

const tabs: {
  id: MenuTab;
  label: string;
}[] = [
    {
      id: "all",
      label: "ВСЕ",
    },
    {
      id: "kitchen",
      label: "КУХНЯ",
    },
    {
      id: "bar",
      label: "БАР",
    },
    {
      id: "smoke",
      label: "ДЫМНАЯ КУЛЬТУРА",
    },
  ];

/*
 * Собираем все позиции категории
 * вместе со всеми вложенными
 * подкатегориями.
 */
function collectItems(
  category: ApiMenuCategory
): ApiMenuItem[] {
  const childItems =
    category.children.flatMap(
      collectItems
    );

  return [
    ...category.items,
    ...childItems,
  ]
    .filter(isPublicMenuItem)
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder
    );
}

/*
 * Цена из Yuma -> формат сайта.
 */
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

/*
 * Преобразуем данные Yuma
 * в формат карточки.
 */
function mapMenuItem(
  item: ApiMenuItem
): MenuItem {
  return {
    id: item.id,

    name: item.name,

    description:
      item.description?.trim() ?? "",

    price:
      formatPrice(item.price),

    image: item.image,

    weight: item.weight,

    unit: item.unit,
  };
}

function MenuCard({
  item,
  onOpen,
}: {
  item: MenuItem;
  onOpen: (item: MenuItem) => void;
}) {
  return (
    <article
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          onOpen(item);
        }
      }}
    >
      <div
        className={styles.cardImage}
        style={
          item.image
            ? {
              backgroundImage:
                `url("${item.image}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
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
            <span>АГНИВА</span>
          </div>
        )}
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardTop}>
          <h3>{item.name}</h3>

          {item.price && (
            <span className={styles.price}>
              {item.price}
            </span>
          )}
        </div>

        {item.description && (
          <p>{item.description}</p>
        )}

        <span className={styles.arrow}>
          →
        </span>
      </div>
    </article>
  );
}
function MenuColumn({
  title,
  items,
  icon,
  showViewAll = true,
  onViewAll,
  onItemOpen,
}: {
  title: string;
  items: MenuItem[];
  icon: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onItemOpen: (item: MenuItem) => void;
}) {
  return (
    <section className={styles.column}>
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
            className={`${styles.columnIcon} ${styles[`icon-${icon}`]
              }`}
            aria-hidden="true"
          />

          <h2>{title}</h2>
        </div>

        {showViewAll && (
          <button
            type="button"
            className={
              styles.viewAll
            }
            onClick={onViewAll}
          >
            СМОТРЕТЬ ВСЕ →
          </button>
        )}
      </div>

      <div className={styles.cards}>
        {items.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            onOpen={onItemOpen}
          />
        ))}
      </div>
    </section>
  );
}

export default function MenuPage() {
  const [
    activeTab,
    setActiveTab,
  ] = useState<MenuTab>("all");

  const [
    selectedItem,
    setSelectedItem,
  ] = useState<MenuItem | null>(null);

  const [
    currentTime,
    setCurrentTime,
  ] = useState<Date | null>(null);

  const [
    activeKitchenCategoryId,
    setActiveKitchenCategoryId,
  ] = useState<string | null>(null);

  const [
    activeBarGroupId,
    setActiveBarGroupId,
  ] = useState<string | null>(null);

  const [
    activeBarCategoryId,
    setActiveBarCategoryId,
  ] = useState<string | null>(null);

  const [
    activeSmokeCategoryId,
    setActiveSmokeCategoryId,
  ] = useState<string | null>(null);

  const [
    menu,
    setMenu,
  ] = useState<ApiMenu | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  function changeTab(
    tab: MenuTab
  ) {
    setActiveTab(tab);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    updateTime();

    const timer =
      window.setInterval(
        updateTime,
        60_000
      );

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const businessLunchAvailable =
    currentTime !== null &&
    isBusinessLunchAvailable(
      currentTime
    );

  /*
   * Загружаем уже очищенное
   * публичное меню.
   */
  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await fetch("/api/menu", {
            cache: "no-store",
          });

        const data =
          (await response.json()) as ApiResponse;

        if (
          !response.ok ||
          !data.ok ||
          !data.menu
        ) {
          throw new Error(
            data.error ??
              "Не удалось загрузить меню"
          );
        }

        setMenu(data.menu);
      } catch (error) {
        console.error(
          "Menu loading error:",
          error
        );

        setError(
          "Не удалось загрузить меню"
        );
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, []);

  /*
   * Ищем корневую категорию кухни.
   */
  const kitchenCategory =
    useMemo(
      () =>
        menu?.categories.find(
          (category) =>
            category.id ===
            ROOT_IDS.kitchen
        ) ?? null,
      [menu]
    );

  const availableKitchenCategory =
    useMemo(() => {
      if (!kitchenCategory) {
        return null;
      }

      return filterBusinessLunch(
        kitchenCategory,
        businessLunchAvailable
      );
    }, [
      kitchenCategory,
      businessLunchAvailable,
    ]);

  const selectedKitchenCategory =
    useMemo(() => {
      if (
        !availableKitchenCategory
      ) {
        return null;
      }

      if (
        activeKitchenCategoryId
      ) {
        const selected =
          availableKitchenCategory.children.find(
            (category) =>
              category.id ===
              activeKitchenCategoryId
          );

        if (selected) {
          return selected;
        }
      }

      return (
        availableKitchenCategory.children[0] ??
        null
      );
    }, [
      availableKitchenCategory,
      activeKitchenCategoryId,
    ]);

  

  const barCategory =
    useMemo(
      () =>
        menu?.categories.find(
          (category) =>
            category.id ===
            ROOT_IDS.bar
        ) ?? null,
      [menu]
    );

  const selectedBarGroup =
    useMemo(() => {
      if (!barCategory) {
        return null;
      }

      if (activeBarGroupId) {
        const selected =
          barCategory.children.find(
            (category) =>
              category.id ===
              activeBarGroupId
          );

        if (selected) {
          return selected;
        }
      }

      return (
        barCategory.children[0] ??
        null
      );
    }, [
      barCategory,
      activeBarGroupId,
    ]);

  const selectedBarCategory =
    useMemo(() => {
      if (!selectedBarGroup) {
        return null;
      }

      if (activeBarCategoryId) {
        const selected =
          selectedBarGroup.children.find(
            (category) =>
              category.id ===
              activeBarCategoryId
          );

        if (selected) {
          return selected;
        }
      }

      return (
        selectedBarGroup.children[0] ??
        selectedBarGroup
      );
    }, [
      selectedBarGroup,
      activeBarCategoryId,
    ]);

  const smokeCategory =
    useMemo(
      () =>
        menu?.categories.find(
          (category) =>
            category.id ===
            ROOT_IDS.smoke
        ) ?? null,
      [menu]
    );

  const selectedSmokeCategory =
    useMemo(() => {
      if (!smokeCategory) {
        return null;
      }

      if (
        activeSmokeCategoryId
      ) {
        const selected =
          smokeCategory.children.find(
            (category) =>
              category.id ===
              activeSmokeCategoryId
          );

        if (selected) {
          return selected;
        }
      }

      return (
        smokeCategory.children[0] ??
        null
      );
    }, [
      smokeCategory,
      activeSmokeCategoryId,
    ]);

  /*
   * Получаем полный ассортимент
   * каждого раздела.
   */
  const kitchenItems =
  useMemo(
    () =>
      availableKitchenCategory
        ? collectItems(
            availableKitchenCategory
          ).map(mapMenuItem)
        : [],
    [availableKitchenCategory]
  );

  const barItems =
    useMemo(
      () =>
        barCategory
          ? collectItems(
            barCategory
          ).map(mapMenuItem)
          : [],
      [barCategory]
    );

  const smokeItems =
    useMemo(
      () =>
        smokeCategory
          ? collectItems(
            smokeCategory
          ).map(mapMenuItem)
          : [],
      [smokeCategory]
    );

  /*
   * На вкладке "ВСЕ"
   * пока сохраняем текущую
   * концепцию сайта:
   *
   * по 3 позиции-превью
   * из каждого направления.
   *
   * После перехода в конкретный
   * раздел показываем уже
   * весь ассортимент.
   */
  const visibleKitchenItems =
    activeTab === "all"
      ? kitchenItems.slice(0, 3)
      : selectedKitchenCategory
        ? collectItems(
          selectedKitchenCategory
        ).map(mapMenuItem)
        : [];

  const visibleBarItems =
    activeTab === "all"
      ? barItems.slice(0, 3)
      : selectedBarCategory
        ? collectItems(
          selectedBarCategory
        ).map(mapMenuItem)
        : [];

  const visibleSmokeItems =
    activeTab === "all"
      ? smokeItems.slice(0, 3)
      : selectedSmokeCategory
        ? collectItems(
          selectedSmokeCategory
        ).map(mapMenuItem)
        : [];

  return (
    <main className={styles.page}>
      <section
        className={styles.intro}
      >
        <div>
          <h1>МЕНЮ</h1>

          <div
            className={styles.tabs}
          >
            {tabs.map(
              (tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    changeTab(tab.id)
                  }
                  className={
                    activeTab ===
                      tab.id
                      ? styles.tabActive
                      : ""
                  }
                >
                  {tab.label}
                </button>
              )
            )}
          </div>
        </div>

        <div
          className={
            styles.philosophy
          }
        >
          <p>
            Дым, огонь и уважение
            к традициям.
            <br />
            Кухня, напитки и
            табаки, собранные
            <br />
            со всего мира.
          </p>

          <Link href="/#about">
            О НАШЕЙ ФИЛОСОФИИ →
          </Link>
        </div>
      </section>

      {loading && (
        <section
          className={
            styles.menuGrid
          }
        >
          <p>
            ЗАГРУЖАЕМ МЕНЮ...
          </p>
        </section>
      )}

     {!loading && error && (
  <section
    className={styles.menuGrid}
  >
    <p>{error}</p>
  </section>
)}

{selectedItem && (
  <div
    className={styles.dishModal}
    onClick={() =>
      setSelectedItem(null)
    }
  >
    <article
      className={styles.dishModalCard}
      onClick={(event) =>
        event.stopPropagation()
      }
    >
      <button
        type="button"
        className={styles.dishModalClose}
        onClick={() =>
          setSelectedItem(null)
        }
        aria-label="Закрыть"
      >
        ×
      </button>

      <div
        className={styles.dishModalImage}
        style={
          selectedItem.image
            ? {
                backgroundImage:
                  `url("${selectedItem.image}")`,
              }
            : undefined
        }
      >
        {!selectedItem.image && (
          <span>АГНИВА</span>
        )}
      </div>

      <div className={styles.dishModalContent}>
        <span className={styles.dishModalLabel}>
          АГНИВА · МЕНЮ
        </span>

        <h2>{selectedItem.name}</h2>

        {selectedItem.description && (
          <p>{selectedItem.description}</p>
        )}

        <div className={styles.dishModalMeta}>
          {selectedItem.weight !== null && (
            <span>
              {selectedItem.weight}
              {selectedItem.unit
                ? ` ${selectedItem.unit}`
                : ""}
            </span>
          )}

          {selectedItem.price && (
            <strong>
              {selectedItem.price}
            </strong>
          )}
        </div>
      </div>
    </article>
  </div>
)}

        
{!loading &&
  !error &&
  activeTab === "kitchen" &&
  availableKitchenCategory && (
    <div
      className={styles.tabs}
    >
      {availableKitchenCategory.children.map(
        (category) => {
          const isActive =
            selectedKitchenCategory
              ?.id ===
            category.id;

          return (
            <button
              key={category.id}
              type="button"
              className={
                isActive
                  ? styles.tabActive
                  : ""
              }
              onClick={() => {
                setActiveKitchenCategoryId(
                  category.id
                );

                window.scrollTo({
                  top: 0,
                  behavior:
                    "smooth",
                });
              }}
            >
              {category.name.toUpperCase()}
            </button>
          );
        }
      )}
    </div>
  )}

      {!loading &&
        !error &&
        activeTab === "bar" &&
        barCategory && (
          <>
            <div
              className={styles.tabs}
            >
              {barCategory.children.map(
                (group) => {
                  const isActive =
                    selectedBarGroup
                      ?.id ===
                    group.id;

                  return (
                    <button
                      key={group.id}
                      type="button"
                      className={
                        isActive
                          ? styles.tabActive
                          : ""
                      }
                      onClick={() => {
                        setActiveBarGroupId(
                          group.id
                        );

                        setActiveBarCategoryId(
                          null
                        );

                        window.scrollTo({
                          top: 0,
                          behavior:
                            "smooth",
                        });
                      }}
                    >
                      {group.name.toUpperCase()}
                    </button>
                  );
                }
              )}
            </div>

            {selectedBarGroup &&
              selectedBarGroup.children.length >
              0 && (
                <div
                  className={styles.tabs}
                >
                  {selectedBarGroup.children.map(
                    (category) => {
                      const isActive =
                        selectedBarCategory
                          ?.id ===
                        category.id;

                      return (
                        <button
                          key={category.id}
                          type="button"
                          className={
                            isActive
                              ? styles.tabActive
                              : ""
                          }
                          onClick={() => {
                            setActiveBarCategoryId(
                              category.id
                            );

                            window.scrollTo({
                              top: 0,
                              behavior:
                                "smooth",
                            });
                          }}
                        >
                          {category.name.toUpperCase()}
                        </button>
                      );
                    }
                  )}
                </div>
              )}
          </>
        )}

      {!loading &&
        !error &&
        activeTab === "smoke" &&
        smokeCategory && (
          <div
            className={styles.tabs}
          >
            {smokeCategory.children.map(
              (category) => {
                const isActive =
                  selectedSmokeCategory
                    ?.id ===
                  category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    className={
                      isActive
                        ? styles.tabActive
                        : ""
                    }
                    onClick={() => {
                      setActiveSmokeCategoryId(
                        category.id
                      );

                      window.scrollTo({
                        top: 0,
                        behavior:
                          "smooth",
                      });
                    }}
                  >
                    {category.name.toUpperCase()}
                  </button>
                );
              }
            )}
          </div>
        )}

      {!loading &&
        !error &&
        menu && (
          <section
            className={`${styles.menuGrid
              } ${activeTab !==
                "all"
                ? styles.menuGridFiltered
                : ""
              }`}
          >
            {(activeTab ===
              "all" ||
              activeTab ===
              "kitchen") && (
                <MenuColumn
                  title="КУХНЯ"
                  icon="kitchen"
                  items={
                    visibleKitchenItems
                  }
                  showViewAll={
                    activeTab ===
                    "all"
                  }
                  onViewAll={() =>
                    changeTab("kitchen")
                  }
                  onItemOpen={setSelectedItem}
                />
              )}

            {(activeTab ===
              "all" ||
              activeTab ===
              "bar") && (
                <MenuColumn
                  title="БАР"
                  icon="bar"
                  items={
                    visibleBarItems
                  }
                  showViewAll={
                    activeTab ===
                    "all"
                  }
                  onViewAll={() =>
                    changeTab("bar")
                  }
                  onItemOpen={setSelectedItem}
                />
              )}

            {(activeTab ===
              "all" ||
              activeTab ===
              "smoke") && (
                <MenuColumn
                  title="ДЫМНАЯ КУЛЬТУРА"
                  icon="smoke"
                  items={
                    visibleSmokeItems
                  }
                  showViewAll={
                    activeTab ===
                    "all"
                  }
                  onViewAll={() =>
                    changeTab("smoke")
                  }
                  onItemOpen={setSelectedItem}
                />
              )}
          </section>
        )}

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
            АГНИВА — МЕСТО
            ДЫМНОЙ КУЛЬТУРЫ
          </h2>

          <p>
            Мы объединяем кухню,
            напитки и традиции
            дымной культуры, чтобы
            каждый момент был
            особенным.
          </p>
        </div>

        <div
          className={
            styles.fireVisual
          }
        />
      </section>

      <footer
        className={styles.footer}
      >
        <div
          className={
            styles.footerItem
          }
        >
          <span
            className={
              styles.footerIcon
            }
          >
            ⌖
          </span>

          <div>
            <span>
              Новокузнецк
            </span>

            <strong>
              проспект Николая
              Ермакова, 30а
            </strong>
          </div>
        </div>

        <div
          className={
            styles.footerItem
          }
        >
          <span
            className={
              styles.footerIcon
            }
          >
            ◷
          </span>

          <div>
            <span>
              Режим работы
            </span>

            <strong>
              Круглосуточно
            </strong>
          </div>
        </div>

        <a
          href="tel:+79230301177"
          className={
            styles.footerItem
          }
        >
          <span
            className={
              styles.footerIcon
            }
          >
            ⌕
          </span>

          <div>
            <span>Телефон</span>

            <strong>
              +7 923 030-11-77
            </strong>
          </div>
        </a>

        <div
          className={
            styles.socials
          }
        >
          <a
            href="#"
            aria-label="Instagram"
          >
            Instagram
          </a>

          <a
            href="#"
            aria-label="ВКонтакте"
          >
            ВКонтакте
          </a>

          <a
            href="#"
            aria-label="Telegram"
          >
            Telegram
          </a>
        </div>
      </footer>
    </main>
  );
}
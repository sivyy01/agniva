import { NextResponse } from "next/server";

import { yumaFetch } from "@/lib/yuma";

type YumaTranslation = {
  languageCode?: string;
  name?: string;
  description?: string | null;
};

type YumaStore = {
  storeId: string;

  translations?: YumaTranslation[];

  [key: string]: unknown;
};

type YumaCategory = {
  categoryId: string;
  parentCategoryId?: string | null;

  translations?: YumaTranslation[];

  sortOrder?: number;

  [key: string]: unknown;
};

type YumaItem = {
  itemId: string;
  categoryId?: string | null;

  translations?: YumaTranslation[];

  sortOrder?: number;

  price?: number;
  netWeight?: number | null;
  UOM?: string | null;

  [key: string]: unknown;
};

type YumaMenu = {
  categories?: YumaCategory[];
  items?: YumaItem[];

  modifierGroups?: unknown[];
  modifiers?: unknown[];
  tenderSettings?: unknown[];

  [key: string]: unknown;
};

function getRussianName(
  translations?: YumaTranslation[]
) {
  if (!translations?.length) {
    return "Без названия";
  }

  return (
    translations.find(
      (translation) =>
        translation.languageCode === "ru"
    )?.name ??
    translations[0]?.name ??
    "Без названия"
  );
}

async function readResponse(
  response: Response
) {
  const contentType =
    response.headers.get(
      "content-type"
    ) ?? "";

  if (response.status === 204) {
    return null;
  }

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    return response.json();
  }

  return response.text();
}

export async function GET() {
  try {
    /*
     * 1. Все доступные точки Yuma.
     */
    const storesResponse =
      await yumaFetch(
        "/open-api/v1/store/all"
      );

    if (!storesResponse.ok) {
      const error =
        await readResponse(
          storesResponse
        );

      return NextResponse.json(
        {
          ok: false,
          step: "stores",
          status:
            storesResponse.status,
          error,
        },
        {
          status:
            storesResponse.status,
        }
      );
    }

    const stores =
      (await storesResponse.json()) as YumaStore[];

    /*
     * 2. Максимально подробно
     * разбираем каждую точку.
     */
    const result =
      await Promise.all(
        stores.map(
          async (store) => {
            const storeId =
              store.storeId;

            /*
             * Информация
             * о самой точке.
             */
            const storeInfoResponse =
              await yumaFetch(
                `/open-api/v1/store/${storeId}`
              );

            const storeInfo =
              await readResponse(
                storeInfoResponse
              );

            /*
             * Полное меню.
             */
            const menuResponse =
              await yumaFetch(
                `/open-api/v1/store/${storeId}/menu`
              );

            const menuRaw =
              await readResponse(
                menuResponse
              );

            /*
             * Stop-list.
             */
            const stopListResponse =
              await yumaFetch(
                `/open-api/v1/store/${storeId}/menu/stop-list`
              );

            const stopList =
              await readResponse(
                stopListResponse
              );

            const menu =
              menuRaw &&
              typeof menuRaw ===
                "object"
                ? (menuRaw as YumaMenu)
                : null;

            const categories =
              menu?.categories ?? [];

            const items =
              menu?.items ?? [];

            /*
             * Для каждой категории
             * считаем:
             *
             * - имя
             * - parent
             * - количество товаров
             * - дочерние категории
             */
            const categorySummary =
              categories
                .map(
                  (category) => {
                    const directItems =
                      items.filter(
                        (item) =>
                          item.categoryId ===
                          category.categoryId
                      );

                    const children =
                      categories.filter(
                        (child) =>
                          child.parentCategoryId ===
                          category.categoryId
                      );

                    const parent =
                      category.parentCategoryId
                        ? categories.find(
                            (
                              candidate
                            ) =>
                              candidate.categoryId ===
                              category.parentCategoryId
                          )
                        : undefined;

                    return {
                      categoryId:
                        category.categoryId,

                      name:
                        getRussianName(
                          category.translations
                        ),

                      parentCategoryId:
                        category.parentCategoryId ??
                        null,

                      parentName:
                        parent
                          ? getRussianName(
                              parent.translations
                            )
                          : null,

                      sortOrder:
                        category.sortOrder ??
                        null,

                      directItemCount:
                        directItems.length,

                      directItems:
                        directItems.map(
                          (item) => ({
                            itemId:
                              item.itemId,

                            name:
                              getRussianName(
                                item.translations
                              ),

                            price:
                              item.price ??
                              null,

                            netWeight:
                              item.netWeight ??
                              null,

                            sortOrder:
                              item.sortOrder ??
                              null,
                          })
                        ),

                      childCategoryCount:
                        children.length,

                      children:
                        children.map(
                          (child) => ({
                            categoryId:
                              child.categoryId,

                            name:
                              getRussianName(
                                child.translations
                              ),

                            sortOrder:
                              child.sortOrder ??
                              null,

                            itemCount:
                              items.filter(
                                (item) =>
                                  item.categoryId ===
                                  child.categoryId
                              ).length,
                          })
                        ),
                    };
                  }
                )
                .sort(
                  (a, b) =>
                    (a.sortOrder ??
                      999999) -
                    (b.sortOrder ??
                      999999)
                );

            /*
             * Корневые категории.
             */
            const rootCategories =
              categorySummary.filter(
                (category) =>
                  !category.parentCategoryId
              );

            /*
             * Проверяем, есть ли
             * товары, категория которых
             * вообще отсутствует
             * в categories.
             */
            const categoryIds =
              new Set(
                categories.map(
                  (category) =>
                    category.categoryId
                )
              );

            const orphanItems =
              items
                .filter(
                  (item) =>
                    !item.categoryId ||
                    !categoryIds.has(
                      item.categoryId
                    )
                )
                .map((item) => ({
                  itemId:
                    item.itemId,

                  categoryId:
                    item.categoryId ??
                    null,

                  name:
                    getRussianName(
                      item.translations
                    ),

                  price:
                    item.price ??
                    null,
                }));

            return {
              storeId,

              name:
                getRussianName(
                  store.translations
                ),

              /*
               * Краткая сводка.
               */
              summary: {
                categoryCount:
                  categories.length,

                itemCount:
                  items.length,

                rootCategoryCount:
                  rootCategories.length,

                modifierGroupCount:
                  menu?.modifierGroups
                    ?.length ?? 0,

                modifierCount:
                  menu?.modifiers
                    ?.length ?? 0,

                orphanItemCount:
                  orphanItems.length,
              },

              /*
               * Самое важное для нас:
               * структура меню.
               */
              rootCategories,

              categorySummary,

              orphanItems,

              /*
               * Статусы API.
               */
              apiStatus: {
                storeInfo:
                  storeInfoResponse.status,

                menu:
                  menuResponse.status,

                stopList:
                  stopListResponse.status,
              },

              /*
               * Сырые ответы Yuma.
               * Пока оставляем специально,
               * чтобы ничего не потерять.
               */
              raw: {
                storeInfo,
                menu: menuRaw,
                stopList,
              },
            };
          }
        )
      );

    return NextResponse.json({
      ok: true,

      storeCount:
        result.length,

      stores:
        result,
    });
  } catch (error) {
    console.error(
      "Yuma full diagnostic error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Unknown Yuma API error",
      },
      {
        status: 500,
      }
    );
  }
}
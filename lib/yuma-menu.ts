import "server-only";

import { yumaFetch } from "@/lib/yuma";

import {
  YUMA_MENU_PROFILES,
} from "@/lib/yuma-menu-config";

/*
 * Тип профиля меню.
 */
export type YumaMenuProfile =
  keyof typeof YUMA_MENU_PROFILES;

/*
 * То, что реально приходит из Yuma.
 */
type YumaTranslation = {
  languageCode?: string;
  name?: string;
  description?: string | null;
};

type YumaImage = {
  imageUri?: string;
};

type YumaCategory = {
  categoryId: string;
  parentCategoryId?: string | null;

  translations?: YumaTranslation[];

  sortOrder?: number;

  image?: YumaImage | null;

  [key: string]: unknown;
};

type YumaItem = {
  itemId: string;
  categoryId?: string | null;

  translations?: YumaTranslation[];

  sortOrder?: number;

  images?: YumaImage[];

  price?: number;

  netWeight?: number | null;

  UOM?: string | null;

  kcalorie?: number | null;
  protein?: number | null;
  fat?: number | null;
  carbohydrate?: number | null;

  [key: string]: unknown;
};

type YumaRawMenu = {
  categories?: YumaCategory[];
  items?: YumaItem[];

  [key: string]: unknown;
};

/*
 * Уже безопасные типы,
 * которые потом будем отдавать сайту.
 */
export type PublicYumaMenuItem = {
  id: string;
  categoryId: string;

  name: string;
  description: string | null;

  price: number | null;
  weight: number | null;
  unit: string | null;

  image: string | null;

  sortOrder: number;

  nutrition: {
    kcalorie: number | null;
    protein: number | null;
    fat: number | null;
    carbohydrate: number | null;
  };
};

export type PublicYumaMenuCategory = {
  id: string;

  name: string;
  description: string | null;

  parentId: string | null;

  image: string | null;

  sortOrder: number;

  items: PublicYumaMenuItem[];

  children: PublicYumaMenuCategory[];
};

export type PublicYumaMenu = {
  profile: YumaMenuProfile;

  storeId: string;

  categoryCount: number;
  itemCount: number;

  categories: PublicYumaMenuCategory[];
};

/*
 * Русское название.
 */
function getTranslation(
  translations?: YumaTranslation[]
) {
  if (!translations?.length) {
    return {
      name: "Без названия",
      description: null,
    };
  }

  const translation =
    translations.find(
      (item) =>
        item.languageCode === "ru"
    ) ?? translations[0];

  return {
    name:
      translation?.name ??
      "Без названия",

    description:
      translation?.description ??
      null,
  };
}

/*
 * Получаем URL первой картинки.
 */
function getItemImage(
  item: YumaItem
) {
  return (
    item.images?.find(
      (image) =>
        Boolean(image.imageUri)
    )?.imageUri ?? null
  );
}
  

/*
 * Рекурсивно собираем ID:
 *
 * указанная категория
 * +
 * все её дочерние категории
 * +
 * дочерние категории дочерних
 * и т.д.
 */
function collectCategoryTreeIds(
  startingCategoryIds: readonly string[],
  categories: YumaCategory[]
) {
  const result =
    new Set<string>();

  const stack = [
    ...startingCategoryIds,
  ];

  while (stack.length > 0) {
    const currentId =
      stack.pop();

    if (
      !currentId ||
      result.has(currentId)
    ) {
      continue;
    }

    result.add(currentId);

    for (
      const category of categories
    ) {
      if (
        category.parentCategoryId ===
        currentId
      ) {
        stack.push(
          category.categoryId
        );
      }
    }
  }

  return result;
}

/*
 * Получаем настройки конкретного
 * профиля публикации.
 */
function getProfileSettings(
  profile: YumaMenuProfile
) {
  switch (profile) {
    case "venue": {
      const config =
        YUMA_MENU_PROFILES.venue;

      return {
        storeId:
          config.storeId,

        includeCategoryIds:
          config.rootCategoryIds,

        excludeCategoryIds:
          config.excludeCategoryIds,

        excludeItemIds:
          config.excludeItemIds,
      };
    }

    case "delivery": {
      const config =
        YUMA_MENU_PROFILES.delivery;

      return {
        storeId:
          config.storeId,

        includeCategoryIds:
          config.rootCategoryIds,

        excludeCategoryIds:
          config.excludeCategoryIds,

        excludeItemIds:
          config.excludeItemIds,
      };
    }

    case "ginza": {
      const config =
        YUMA_MENU_PROFILES.ginza;

      return {
        storeId:
          config.storeId,

        includeCategoryIds:
          config.allowedCategoryIds,

        /*
         * У Ginza сейчас нет
         * дополнительных исключений категорий.
         */
        excludeCategoryIds:
          [] as readonly string[],

        excludeItemIds:
          config.excludeItemIds,
      };
    }
  }
}

/*
 * Преобразование Yuma item
 * в объект для нашего сайта.
 */
function sanitizeItem(
  item: YumaItem
): PublicYumaMenuItem {
  const translation =
    getTranslation(
      item.translations
    );

  return {
    id:
      item.itemId,

    categoryId:
      item.categoryId ?? "",

    name:
      translation.name,

    description:
      translation.description,

    price:
      typeof item.price ===
      "number"
        ? item.price
        : null,

    weight:
      typeof item.netWeight ===
      "number"
        ? item.netWeight
        : null,

    unit:
      item.UOM ?? null,

    image:
      getItemImage(item),

    sortOrder:
      item.sortOrder ?? 999999,

    nutrition: {
      kcalorie:
        item.kcalorie ?? null,

      protein:
        item.protein ?? null,

      fat:
        item.fat ?? null,

      carbohydrate:
        item.carbohydrate ??
        null,
    },
  };
}

/*
 * Создаём дерево категорий.
 *
 * Важный момент:
 * если родительская категория не входит
 * в разрешённый профиль, текущая категория
 * становится корневой.
 *
 * Например:
 *
 * Кальян
 * └── Кальяны веранда Гинза
 *
 * Для ginza-профиля "Кальян" не попадёт,
 * а "Кальяны веранда Гинза"
 * станет самостоятельным корнем.
 */
function buildCategoryTree(
  categories: YumaCategory[],
  items: PublicYumaMenuItem[],
  allowedIds: Set<string>
) {
  const categoryMap =
    new Map(
      categories.map(
        (category) => [
          category.categoryId,
          category,
        ]
      )
    );

  function buildNode(
    category: YumaCategory
  ): PublicYumaMenuCategory | null {
    const translation =
      getTranslation(
        category.translations
      );

    const directItems =
      items
        .filter(
          (item) =>
            item.categoryId ===
            category.categoryId
        )
        .sort(
          (a, b) =>
            a.sortOrder -
            b.sortOrder
        );

    const children =
      categories
        .filter(
          (child) =>
            child.parentCategoryId ===
              category.categoryId &&
            allowedIds.has(
              child.categoryId
            )
        )
        .sort(
          (a, b) =>
            (a.sortOrder ??
              999999) -
            (b.sortOrder ??
              999999)
        )
        .map(buildNode)
        .filter(
          (
            child
          ): child is PublicYumaMenuCategory =>
            child !== null
        );

    /*
     * Не показываем совершенно
     * пустые конечные категории.
     *
     * Если позже в Yuma в такой
     * категории появится товар —
     * она появится автоматически.
     */
    if (
      directItems.length === 0 &&
      children.length === 0
    ) {
      return null;
    }

    const originalParentId =
      category.parentCategoryId ??
      null;

    const parentId =
      originalParentId &&
      allowedIds.has(
        originalParentId
      )
        ? originalParentId
        : null;

    return {
      id:
        category.categoryId,

      name:
        translation.name,

      description:
        translation.description,

      parentId,

      image:
        category.image?.imageUri ??
        null,

      sortOrder:
        category.sortOrder ??
        999999,

      items:
        directItems,

      children,
    };
  }

  const roots =
    categories
      .filter((category) => {
        if (
          !allowedIds.has(
            category.categoryId
          )
        ) {
          return false;
        }

        const parentId =
          category.parentCategoryId;

        return (
          !parentId ||
          !allowedIds.has(parentId) ||
          !categoryMap.has(parentId)
        );
      })
      .sort(
        (a, b) =>
          (a.sortOrder ??
            999999) -
          (b.sortOrder ??
            999999)
      )
      .map(buildNode)
      .filter(
        (
          category
        ): category is PublicYumaMenuCategory =>
          category !== null
      );

  return roots;
}

/*
 * Главная функция.
 *
 * Примеры:
 *
 * getYumaMenu("venue")
 * getYumaMenu("delivery")
 * getYumaMenu("ginza")
 */
export async function getYumaMenu(
  profile: YumaMenuProfile
): Promise<PublicYumaMenu> {
  const settings =
    getProfileSettings(profile);

  const response =
    await yumaFetch(
      `/open-api/v1/store/${settings.storeId}/menu`
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Yuma menu request failed: ${response.status} ${errorText}`
    );
  }

  const rawMenu =
    (await response.json()) as YumaRawMenu;

  const categories =
    rawMenu.categories ?? [];

  const rawItems =
    rawMenu.items ?? [];

  /*
   * 1. Собираем разрешённое дерево.
   */
  const includedCategoryIds =
    collectCategoryTreeIds(
      settings.includeCategoryIds,
      categories
    );

  /*
   * 2. Собираем полностью запрещённые
   * ветки вместе со всеми потомками.
   */
  const excludedCategoryIds =
    collectCategoryTreeIds(
      settings.excludeCategoryIds,
      categories
    );

  /*
   * 3. Итоговый список разрешённых
   * categoryId.
   */
  const allowedCategoryIds =
    new Set(
      [...includedCategoryIds].filter(
        (categoryId) =>
          !excludedCategoryIds.has(
            categoryId
          )
      )
    );

  const excludedItemIds =
    new Set<string>(
      settings.excludeItemIds
    );

  /*
   * 4. Оставляем только товары,
   * которые разрешены данным профилем.
   */
  const items =
    rawItems
      .filter((item) => {
        if (!item.categoryId) {
          return false;
        }

        if (
          !allowedCategoryIds.has(
            item.categoryId
          )
        ) {
          return false;
        }

        if (
          excludedItemIds.has(
            item.itemId
          )
        ) {
          return false;
        }

        return true;
      })
      .map(sanitizeItem)
      .sort(
        (a, b) =>
          a.sortOrder -
          b.sortOrder
      );

  /*
   * 5. Оставляем только разрешённые
   * категории.
   */
  const allowedCategories =
    categories.filter(
      (category) =>
        allowedCategoryIds.has(
          category.categoryId
        )
    );

  /*
   * 6. Строим нормальное дерево
   * для frontend.
   */
  const categoryTree =
    buildCategoryTree(
      allowedCategories,
      items,
      allowedCategoryIds
    );

  /*
   * Считаем только категории,
   * которые реально остались
   * после удаления пустых веток.
   */
  function countCategories(
    nodes: PublicYumaMenuCategory[]
  ): number {
    return nodes.reduce(
      (total, node) =>
        total +
        1 +
        countCategories(
          node.children
        ),
      0
    );
  }

  return {
    profile,

    storeId:
      settings.storeId,

    categoryCount:
      countCategories(
        categoryTree
      ),

    itemCount:
      items.length,

    categories:
      categoryTree,
  };
}
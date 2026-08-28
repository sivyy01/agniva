import { NextResponse } from "next/server";

import { yumaFetch } from "@/lib/yuma";
import {
  getYumaMenu,
} from "@/lib/yuma-menu";
import { YUMA_STORE_IDS } from "@/lib/yuma-menu-config";

type StopListItem = {
  itemId?: string;
  stock?: number | null;
};

type StopListResponse = {
  items?: readonly StopListItem[];
};

type MenuItemWithAvailability = {
  id: string;
  [key: string]: unknown;
};

type MenuCategoryWithAvailability = {
  items?: readonly MenuItemWithAvailability[];
  children?: readonly MenuCategoryWithAvailability[];
  [key: string]: unknown;
};

const DELIVERY_EXCLUDED_CATEGORY_IDS =
  new Set<string>([
    /*
     * Служебная ветка Yuma:
     * "Ролл в подарок Доставка".
     *
     * Эти позиции имеют цену 0 ₽ и
     * не должны быть доступны гостю
     * для ручного добавления.
     */
    "f8d168c7-1f89-4d47-b59b-9ac36b305715",
  ]);

function filterPublicCategories(
  categories:
    readonly MenuCategoryWithAvailability[]
): MenuCategoryWithAvailability[] {
  return categories
    .filter((category) => {
      const id =
        typeof category.id ===
          "string"
          ? category.id
          : "";

      return !DELIVERY_EXCLUDED_CATEGORY_IDS.has(
        id
      );
    })
    .map((category) => ({
      ...category,
      children:
        filterPublicCategories(
          category.children ?? []
        ),
    }));
}

function countPublicCategories(
  categories:
    readonly MenuCategoryWithAvailability[]
): number {
  return categories.reduce(
    (total, category) =>
      total +
      1 +
      countPublicCategories(
        category.children ?? []
      ),
    0
  );
}

function countPublicItems(
  categories:
    readonly MenuCategoryWithAvailability[]
): number {
  return categories.reduce(
    (total, category) =>
      total +
      (category.items?.length ?? 0) +
      countPublicItems(
        category.children ?? []
      ),
    0
  );
}

async function readJsonResponse(
  response: Response
) {
  const text =
    await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function addAvailabilityToCategories(
  categories:
    readonly MenuCategoryWithAvailability[],
  stockByItemId:
    ReadonlyMap<string, number>
): MenuCategoryWithAvailability[] {
  return categories.map(
    (category) => ({
      ...category,

      items:
        category.items?.map(
          (item) => {
            const stock =
              stockByItemId.get(
                item.id
              );

            return {
              ...item,

              /*
               * Если позиции нет в
               * stop-list — ограничений
               * по остатку сейчас нет.
               */
              isAvailable:
                stock === undefined ||
                stock > 0,

              availableStock:
                stock ?? null,
            };
          }
        ) ?? [],

      children:
        addAvailabilityToCategories(
          category.children ?? [],
          stockByItemId
        ),
    })
  );
}

export async function GET() {
  try {
    const [
      menu,
      stopListResponse,
    ] = await Promise.all([
      getYumaMenu("delivery"),

      yumaFetch(
        `/open-api/v1/store/${YUMA_STORE_IDS.AGNIVA}/menu/stop-list`,
        {
          cache: "no-store",
        }
      ),
    ]);

    const stopListData =
      await readJsonResponse(
        stopListResponse
      ) as StopListResponse | null;

    if (
      !stopListResponse.ok ||
      !stopListData ||
      !Array.isArray(
        stopListData.items
      )
    ) {
      console.error(
        "Delivery stop-list API error:",
        stopListResponse.status,
        stopListData
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Не удалось проверить доступность позиций доставки",
        },
        {
          status: 503,
        }
      );
    }

    const stockByItemId =
      new Map<string, number>();

    for (
      const stopItem
      of stopListData.items
    ) {
      const itemId =
        typeof stopItem.itemId ===
          "string"
          ? stopItem.itemId.trim()
          : "";

      const stock =
        Number(
          stopItem.stock
        );

      if (
        !itemId ||
        !Number.isFinite(stock)
      ) {
        continue;
      }

      stockByItemId.set(
        itemId,
        stock
      );
    }

    const publicCategories =
      filterPublicCategories(
        menu.categories as
          readonly MenuCategoryWithAvailability[]
      );

    const menuWithAvailability = {
      ...menu,

      categoryCount:
        countPublicCategories(
          publicCategories
        ),

      itemCount:
        countPublicItems(
          publicCategories
        ),

      categories:
        addAvailabilityToCategories(
          publicCategories,
          stockByItemId
        ),
    };

    return NextResponse.json({
      ok: true,
      menu:
        menuWithAvailability,
    });
  } catch (error) {
    console.error(
      "Delivery menu API error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Не удалось загрузить меню доставки",
      },
      {
        status: 500,
      }
    );
  }
}

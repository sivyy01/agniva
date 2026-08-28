import { NextResponse } from "next/server";

import {
  getYumaMenu,
} from "@/lib/yuma-menu";

export async function GET() {
  try {
    const [
      venue,
      delivery,
      ginza,
    ] = await Promise.all([
      getYumaMenu("venue"),
      getYumaMenu("delivery"),
      getYumaMenu("ginza"),
    ]);

    return NextResponse.json({
      ok: true,

      summary: {
        venue: {
          categoryCount:
            venue.categoryCount,

          itemCount:
            venue.itemCount,

          rootCategories:
            venue.categories.map(
              (category) => ({
                id: category.id,
                name: category.name,

                childCategoryCount:
                  category.children.length,

                directItemCount:
                  category.items.length,
              })
            ),
        },

        delivery: {
          categoryCount:
            delivery.categoryCount,

          itemCount:
            delivery.itemCount,

          rootCategories:
            delivery.categories.map(
              (category) => ({
                id: category.id,
                name: category.name,

                childCategoryCount:
                  category.children.length,

                directItemCount:
                  category.items.length,
              })
            ),
        },

        ginza: {
          categoryCount:
            ginza.categoryCount,

          itemCount:
            ginza.itemCount,

          rootCategories:
            ginza.categories.map(
              (category) => ({
                id: category.id,
                name: category.name,

                childCategoryCount:
                  category.children.length,

                directItemCount:
                  category.items.length,
              })
            ),
        },
      },

      menus: {
        venue,
        delivery,
        ginza,
      },
    });
  } catch (error) {
    console.error(
      "Yuma menu filtering test error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Unknown Yuma menu test error",
      },
      {
        status: 500,
      }
    );
  }
}
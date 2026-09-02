import { NextResponse } from "next/server";

import {
  getYumaMenu,
} from "@/lib/yuma-menu";

export async function GET() {
  try {
    const menu =
      await getYumaMenu("ginza");

    return NextResponse.json({
      ok: true,
      menu,
    });
  } catch (error) {
    console.error(
      "Ginza menu API error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Не удалось загрузить меню Ginza",
      },
      {
        status: 500,
      }
    );
  }
}
import { NextResponse } from "next/server";

import {
  getYumaMenu,
} from "@/lib/yuma-menu";

export async function GET() {
  try {
    const menu =
      await getYumaMenu("venue");

    return NextResponse.json({
      ok: true,
      menu,
    });
  } catch (error) {
    console.error(
      "Public menu API error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Не удалось загрузить меню",
      },
      {
        status: 500,
      }
    );
  }
}
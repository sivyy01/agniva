import {
  NextRequest,
  NextResponse,
} from "next/server";

import { yumaFetch } from "@/lib/yuma";
function normalizePhoneNumber(
  value: string
) {
  let digits = value.replace(
    /\D/g,
    ""
  );

  /*
   * Российский номер:
   * 8 905... -> 7 905...
   */
  if (
    digits.length === 11 &&
    digits.startsWith("8")
  ) {
    digits =
      "7" + digits.slice(1);
  }

  /*
   * 9050677766
   * -> 79050677766
   */
  if (digits.length === 10) {
    digits = "7" + digits;
  }

  return `+${digits}`;
}
export async function GET(
  request: NextRequest
) {
  try {
    const rawPhoneNumber =
  request.nextUrl.searchParams
    .get("phoneNumber")
    ?.trim();

if (!rawPhoneNumber) {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Не указан номер телефона.",
    },
    {
      status: 400,
    }
  );
}

const phoneNumber =
  normalizePhoneNumber(
    rawPhoneNumber
  );

if (
  !/^\+\d{4,15}$/.test(
    phoneNumber
  )
) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Не указан номер телефона.",
        },
        {
          status: 400,
        }
      );
    }

    const response = await yumaFetch(
      `/open-api/v1/customer/find?phoneNumber=${encodeURIComponent(
        phoneNumber
      )}`
    );

    const text = await response.text();

    let data: unknown = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    /*
     * Для нас 404 от Yuma —
     * не ошибка.
     *
     * Это просто означает,
     * что клиент ещё не создан.
     */
    if (response.status === 404) {
      return NextResponse.json({
        ok: true,
        found: false,
        customer: null,
      });
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Не удалось найти клиента в Yuma.",
          yumaStatus: response.status,
          yuma: data,
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      found: true,
      customer: data,
    });
  } catch (error) {
    console.error(
      "Yuma customer find error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Ошибка при поиске клиента в Yuma.",
      },
      {
        status: 500,
      }
    );
  }
}
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { yumaFetch } from "@/lib/yuma";

export async function GET(
  request: NextRequest
) {
  try {
    const customerId =
      request.nextUrl.searchParams
        .get("customerId")
        ?.trim();

    if (!customerId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Не указан customerId.",
        },
        {
          status: 400,
        }
      );
    }

    const response = await yumaFetch(
      `/open-api/v1/customer/${encodeURIComponent(
        customerId
      )}/address`
    );

    const text =
      await response.text();

    let data: unknown = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (response.status === 404) {
      return NextResponse.json({
        ok: true,
        found: false,
        addresses: [],
      });
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Не удалось получить адреса клиента из Yuma.",
          yumaStatus:
            response.status,
          yuma: data,
        },
        {
          status:
            response.status,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      found: true,
      addresses: data,
    });
  } catch (error) {
    console.error(
      "Yuma customer addresses error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Ошибка при получении адресов клиента из Yuma.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const customerId =
      typeof body.customerId ===
      "string"
        ? body.customerId.trim()
        : "";

    if (!customerId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Не указан customerId.",
        },
        {
          status: 400,
        }
      );
    }

    const address =
      body.address;

    if (
      !address ||
      typeof address !== "object"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Не указан адрес.",
        },
        {
          status: 400,
        }
      );
    }

    const payload = {
      fullAddress:
        address.fullAddress,

      country:
        address.country ||
        "Россия",

      city:
        address.city,

      apt:
        address.apt || "",

      details:
        address.details || "",

      latitude:
        address.latitude,

      longitude:
        address.longitude,

      zip:
        address.zip,

      floor:
        address.floor || "",

      entrance:
        address.entrance || "",

      intercom:
        address.intercom || "",
    };

    if (
      !payload.fullAddress ||
      !payload.city ||
      !payload.zip ||
      typeof payload.latitude !==
        "number" ||
      typeof payload.longitude !==
        "number"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Для сохранения адреса не хватает обязательных данных.",
          address: payload,
        },
        {
          status: 400,
        }
      );
    }

    const response =
      await yumaFetch(
        `/open-api/v1/customer/${encodeURIComponent(
          customerId
        )}/address`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              payload
            ),
        }
      );

    const text =
      await response.text();

    let data: unknown = null;

    if (text) {
      try {
        data =
          JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Yuma не сохранила адрес клиента.",
          yumaStatus:
            response.status,
          yuma: data,
        },
        {
          status:
            response.status,
        }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        address: data,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Yuma customer address create error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Ошибка при сохранении адреса клиента в Yuma.",
      },
      {
        status: 500,
      }
    );
  }
}
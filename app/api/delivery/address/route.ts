import { NextResponse } from "next/server";

const DADATA_API_KEY =
  process.env.DADATA_API_KEY;

const DADATA_SUGGEST_URL =
  "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";

type DaDataSuggestion = {
  value?: string;
  unrestricted_value?: string;
  data?: {
    postal_code?: string | null;
    country?: string | null;
    city?: string | null;
    settlement?: string | null;
    street_with_type?: string | null;
    house?: string | null;
    geo_lat?: string | null;
    geo_lon?: string | null;
  };
};

type DaDataResponse = {
  suggestions?: DaDataSuggestion[];
};

function clean(
  value: unknown
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

export async function GET(
  request: Request
) {
  try {
    if (!DADATA_API_KEY) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "DADATA_API_KEY is not configured",
        },
        {
          status: 500,
        }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const query =
      clean(
        searchParams.get("q")
      );

    const exact =
      searchParams.get(
        "exact"
      ) === "1";

    if (
      query.length < 3
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Введите минимум 3 символа адреса.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Обычный режим:
     *   /api/delivery/address?q=Ермакова 30
     *
     * Возвращает до 5 подсказок.
     *
     * Точный режим:
     *   /api/delivery/address?q=<unrestricted_value>&exact=1
     *
     * Используем после того, как пользователь
     * выбрал конкретную подсказку.
     */
    const response =
      await fetch(
        DADATA_SUGGEST_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
            Authorization:
              `Token ${DADATA_API_KEY}`,
          },

          body:
            JSON.stringify({
              query,
              count:
                exact
                  ? 1
                  : 5,

              /*
               * Доставка Агнивы сейчас
               * ограничена Новокузнецком.
               */
              locations: [
                {
                  city:
                    "Новокузнецк",
                },
              ],
            }),

          cache:
            "no-store",
        }
      );

    const data =
      (await response.json()) as
        DaDataResponse;

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "DaData не обработала адрес.",
          status:
            response.status,
          dadata:
            data,
        },
        {
          status:
            response.status,
        }
      );
    }

    const suggestions =
      (
        data.suggestions ??
        []
      )
        .map(
          (suggestion) => {
            const address =
              suggestion.data ??
              {};

            const city =
              clean(
                address.city
              ) ||
              clean(
                address.settlement
              );

            const latitude =
              Number(
                address.geo_lat
              );

            const longitude =
              Number(
                address.geo_lon
              );

            return {
              value:
                clean(
                  suggestion.value
                ),

              unrestrictedValue:
                clean(
                  suggestion.unrestricted_value
                ),

              fullAddress:
                clean(
                  suggestion.unrestricted_value
                ) ||
                clean(
                  suggestion.value
                ),

              city,

              zip:
                clean(
                  address.postal_code
                ),

              latitude:
                Number.isFinite(
                  latitude
                )
                  ? latitude
                  : null,

              longitude:
                Number.isFinite(
                  longitude
                )
                  ? longitude
                  : null,

              street:
                clean(
                  address.street_with_type
                ),

              house:
                clean(
                  address.house
                ),
            };
          }
        )
        .filter(
          (item) =>
            item.value &&
            item.city ===
              "Новокузнецк"
        );

    if (
      suggestions.length ===
      0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Адрес в Новокузнецке не найден.",
          suggestions: [],
        },
        {
          status: 404,
        }
      );
    }

    if (exact) {
      const address =
        suggestions[0];

      const missing: string[] =
        [];

      if (
        !address.fullAddress
      ) {
        missing.push(
          "fullAddress"
        );
      }

      if (!address.city) {
        missing.push(
          "city"
        );
      }

      if (!address.zip) {
        missing.push(
          "zip"
        );
      }

      if (
        address.latitude ===
        null
      ) {
        missing.push(
          "latitude"
        );
      }

      if (
        address.longitude ===
        null
      ) {
        missing.push(
          "longitude"
        );
      }

      if (
        missing.length >
        0
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Для выбранного адреса не хватает данных, необходимых Yuma.",
            missing,
            address,
          },
          {
            status: 422,
          }
        );
      }

      return NextResponse.json({
        ok: true,
        mode: "exact",
        address,
      });
    }

    return NextResponse.json({
      ok: true,
      mode:
        "suggestions",
      suggestions,
    });
  } catch (error) {
    console.error(
      "Delivery address API error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Не удалось проверить адрес.",
      },
      {
        status: 500,
      }
    );
  }
}

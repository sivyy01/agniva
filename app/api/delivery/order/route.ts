import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { yumaFetch } from "@/lib/yuma";
import { getYumaMenu } from "@/lib/yuma-menu";
import { YUMA_STORE_IDS } from "@/lib/yuma-menu-config";

type CheckoutPayment =
  | "cash"
  | "card";

type CheckoutDeliveryType =
  | "take-out"
  | "self-delivery";

type OrderRequest = {
  commit?: boolean;

  personalDataConsent?: boolean;

  deliveryType:
    CheckoutDeliveryType;

  paymentType:
    CheckoutPayment;

  items: Array<{
    itemId: string;
    quantity: number;
  }>;

  customer: {
    firstName: string;
    lastName?: string;
    phone: string;
    email?: string;
  };

  address?: {
    fullAddress: string;
    city: string;
    zip: string;
    latitude: number;
    longitude: number;
    apt?: string;
    entrance?: string;
    floor?: string;
    intercom?: string;
  };

  comment?: string;
};

type DeliveryMenuItem = {
  id: string;
  categoryId: string;
  name: string;
  price: number | null;
};

const DELIVERY_BLOCKED_CATEGORY_IDS =
  new Set<string>([
    /*
     * Служебная категория Yuma:
     * "Ролл в подарок Доставка".
     *
     * На публичной витрине она уже
     * скрыта. Здесь дублируем защиту
     * на сервере заказа, чтобы её
     * позиции нельзя было передать
     * напрямую через POST-запрос.
     */
    "f8d168c7-1f89-4d47-b59b-9ac36b305715",
  ]);

type DeliveryMenuCategory = {
  items?: readonly DeliveryMenuItem[];
  children?: readonly DeliveryMenuCategory[];
};

type YumaStopListItem = {
  itemId?: string;
  stock?: number | null;
};

type YumaStopList = {
  items?: readonly YumaStopListItem[];
  modifiers?: readonly unknown[];
};

function collectMenuItems(
  categories:
    readonly DeliveryMenuCategory[]
) {
  const result =
    new Map<
      string,
      DeliveryMenuItem
    >();

  function visit(
    category:
      DeliveryMenuCategory
  ) {
    for (
      const item
      of category.items ?? []
    ) {
      result.set(
        item.id,
        item
      );
    }

    for (
      const child
      of category.children ?? []
    ) {
      visit(child);
    }
  }

  for (
    const category
    of categories
  ) {
    visit(category);
  }

  return result;
}

function normalizeText(
  value: unknown
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function normalizePhoneNumber(
  value: unknown
) {
  const raw =
    normalizeText(value);

  if (!raw) {
    return "";
  }

  const digits =
    raw.replace(/\D/g, "");

  /*
   * Российские номера:
   * 8 905 067-77-66
   * 7 905 067-77-66
   * 905 067-77-66
   *
   * Для Yuma всегда отправляем
   * международный формат +7...
   */
  if (
    digits.length === 11 &&
    digits.startsWith("8")
  ) {
    return `+7${digits.slice(1)}`;
  }

  if (
    digits.length === 11 &&
    digits.startsWith("7")
  ) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+7${digits}`;
  }

  /*
   * Для остальных международных
   * номеров сохраняем общий формат +...
   */
  if (
    digits.length >= 4 &&
    digits.length <= 15
  ) {
    return `+${digits}`;
  }

  return "";
}

async function readYumaResponse(
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
    return text;
  }
}

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as
        OrderRequest;
        if (
  body.personalDataConsent !== true
) {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Необходимо дать согласие на обработку персональных данных.",
    },
    {
      status: 400,
    }
  );
}

    if (
      body.deliveryType !==
        "take-out" &&
      body.deliveryType !==
        "self-delivery"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Некорректный тип доставки.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      body.paymentType !==
        "cash" &&
      body.paymentType !==
        "card"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Некорректный способ оплаты.",
        },
        {
          status: 400,
        }
      );
    }

    const firstName =
      normalizeText(
        body.customer?.firstName
      );

    const lastName =
      normalizeText(
        body.customer?.lastName
      );

    const phone =
      normalizePhoneNumber(
        body.customer?.phone
      );

    const email =
      normalizeText(
        body.customer?.email
      );

    if (!firstName) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Укажите имя.",
        },
        {
          status: 400,
        }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Укажите корректный номер телефона.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Array.isArray(
        body.items
      ) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Корзина пуста.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ВАЖНО:
     * цену никогда не принимаем
     * от браузера.
     *
     * Получаем актуальное меню
     * доставки из Yuma и сами
     * рассчитываем заказ.
     */
    const deliveryMenu =
      await getYumaMenu(
        "delivery"
      );

    const availableItems =
      collectMenuItems(
        deliveryMenu.categories
      );

    /*
     * Stop-list проверяем на сервере
     * при КАЖДОМ preview и commit.
     *
     * Поэтому даже если позиция
     * попала в корзину раньше, после
     * попадания в стоп-лист реальный
     * заказ с ней уже не пройдёт.
     */
    const stopListResponse =
      await yumaFetch(
        `/open-api/v1/store/${YUMA_STORE_IDS.AGNIVA}/menu/stop-list`,
        {
          cache: "no-store",
        }
      );

    const stopListData =
      await readYumaResponse(
        stopListResponse
      );

    if (!stopListResponse.ok) {
      console.error(
        "Yuma stop-list error:",
        stopListResponse.status,
        stopListData
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Не удалось проверить доступность позиций. Попробуйте ещё раз.",
        },
        {
          status: 503,
        }
      );
    }

    if (
      !stopListData ||
      typeof stopListData !==
        "object" ||
      !Array.isArray(
        (stopListData as YumaStopList)
          .items
      )
    ) {
      console.error(
        "Unexpected Yuma stop-list response:",
        stopListData
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Не удалось проверить доступность позиций. Попробуйте ещё раз.",
        },
        {
          status: 503,
        }
      );
    }

    const stopStockByItemId =
      new Map<string, number>();

    for (
      const stopItem of
        (stopListData as YumaStopList)
          .items ?? []
    ) {
      const itemId =
        normalizeText(
          stopItem.itemId
        );

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

      stopStockByItemId.set(
        itemId,
        stock
      );
    }

    const orderItems = [];

    let total = 0;

    for (
      const requestedItem
      of body.items
    ) {
      const quantity =
        Number(
          requestedItem.quantity
        );

      if (
        !Number.isInteger(
          quantity
        ) ||
        quantity < 1 ||
        quantity > 99
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Некорректное количество товара.",
          },
          {
            status: 400,
          }
        );
      }

      const menuItem =
        availableItems.get(
          requestedItem.itemId
        );

      if (!menuItem) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Одна из позиций больше недоступна в меню доставки.",
            itemId:
              requestedItem.itemId,
          },
          {
            status: 409,
          }
        );
      }

      if (
        DELIVERY_BLOCKED_CATEGORY_IDS.has(
          menuItem.categoryId
        )
      ) {
        console.warn(
          "Blocked delivery item attempt:",
          {
            itemId:
              menuItem.id,
            categoryId:
              menuItem.categoryId,
            name:
              menuItem.name,
          }
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "Эта позиция недоступна для самостоятельного заказа.",
            itemId:
              menuItem.id,
          },
          {
            status: 409,
          }
        );
      }

      const stopStock =
        stopStockByItemId.get(
          menuItem.id
        );

      if (
        stopStock !== undefined &&
        stopStock <= 0
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              `Позиция «${menuItem.name}» сейчас недоступна.`,
            itemId:
              menuItem.id,
          },
          {
            status: 409,
          }
        );
      }

      if (
        stopStock !== undefined &&
        quantity > stopStock
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              `Позиция «${menuItem.name}»: доступно только ${stopStock} шт.`,
            itemId:
              menuItem.id,
            availableStock:
              stopStock,
          },
          {
            status: 409,
          }
        );
      }

      if (
        menuItem.price === null ||
        !Number.isFinite(
          menuItem.price
        )
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              `У позиции «${menuItem.name}» отсутствует актуальная цена.`,
          },
          {
            status: 409,
          }
        );
      }

      total +=
        menuItem.price *
        quantity;

      orderItems.push({
        itemId:
          menuItem.id,
        price:
          menuItem.price,
        quantity,
        orderItemModifiers:
          [],
      });
    }

    const customerInfo = {
      firstName,
      phoneNumber:
        phone,
      ...(lastName
        ? { lastName }
        : {}),
      ...(email
        ? { email }
        : {}),
      language: "ru",
    };

    let deliveryInfo;

    if (
      body.deliveryType ===
      "take-out"
    ) {
      deliveryInfo = {
        deliveryType:
          "take-out",
        takeOutInfo: {
          customerInfo,
        },
      };
    } else {
      const fullAddress =
        normalizeText(
          body.address
            ?.fullAddress
        );

      const city =
        normalizeText(
          body.address?.city
        );

      const zip =
        normalizeText(
          body.address?.zip
        );

      const latitude =
        Number(
          body.address
            ?.latitude
        );

      const longitude =
        Number(
          body.address
            ?.longitude
        );

      if (!fullAddress) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Для доставки укажите адрес.",
          },
          {
            status: 400,
          }
        );
      }

      if (!city) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Для адреса доставки не определён город.",
          },
          {
            status: 400,
          }
        );
      }

      if (!zip) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Для адреса доставки не определён почтовый индекс.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !Number.isFinite(
          latitude
        ) ||
        !Number.isFinite(
          longitude
        )
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Для адреса доставки не определены координаты.",
          },
          {
            status: 400,
          }
        );
      }

      deliveryInfo = {
        deliveryType:
          "self-delivery",
        selfDeliveryInfo: {
          customerInfo,

          customerAddress: {
            fullAddress,
            country:
              "Россия",
            city,
            latitude,
            longitude,
            zip,

            ...(normalizeText(
              body.address?.apt
            )
              ? {
                  apt:
                    normalizeText(
                      body.address
                        ?.apt
                    ),
                }
              : {}),

            ...(normalizeText(
              body.address
                ?.entrance
            )
              ? {
                  entrance:
                    normalizeText(
                      body.address
                        ?.entrance
                    ),
                }
              : {}),

            ...(normalizeText(
              body.address?.floor
            )
              ? {
                  floor:
                    normalizeText(
                      body.address
                        ?.floor
                    ),
                }
              : {}),

            ...(normalizeText(
              body.address
                ?.intercom
            )
              ? {
                  intercom:
                    normalizeText(
                      body.address
                        ?.intercom
                    ),
                }
              : {}),
          },
        },
      };
    }

    /*
     * По Swagger Yuma:
     *
     * DeliveryType:
     * - take-out
     * - self-delivery
     * - external-delivery
     *
     * PaymentChargeType:
     * - cash
     * - card
     * - custom
     *
     * Для нашего checkout используем
     * только cash / card.
     *
     * skipPaymentProcessing=true:
     * заказ создаётся без попытки
     * проводить банковскую транзакцию
     * через наш Next.js.
     * Расчёт по заказу далее
     * обрабатывается в контуре Yuma/POS.
     */
    const yumaOrderPayload = {
      externalOrderId:
        randomUUID(),

      orderItems,

      deliveryInfo,

      payment: {
        skipPaymentProcessing:
          true,

        paymentCharges: [
          {
            paymentChargeType:
              body.paymentType,

            paymentChargeAmount:
              total,

            ...(body.paymentType ===
            "cash"
              ? {
                  changeFrom:
                    total,
                }
              : {}),
          },
        ],
      },

      discounts: [],
      charges: [],
      total,

      comment:
        normalizeText(
          body.comment
        ),
    };

    /*
     * Без commit=true endpoint
     * только проверяет корзину
     * и показывает итоговый payload.
     *
     * Так мы можем безопасно
     * подключить кнопку
     * «ПРОВЕРИТЬ ДАННЫЕ»
     * без создания заказа
     * на кассе Агнивы.
     */
    if (
      body.commit !== true
    ) {
      return NextResponse.json({
        ok: true,
        mode: "preview",

        summary: {
          itemCount:
            orderItems.reduce(
              (
                sum,
                item
              ) =>
                sum +
                item.quantity,
              0
            ),

          total,

          deliveryType:
            body.deliveryType,

          paymentType:
            body.paymentType,
        },

        yumaOrderPayload,
      });
    }

    const yumaResponse =
      await yumaFetch(
        `/open-api/v1/store/${YUMA_STORE_IDS.AGNIVA}/order`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              yumaOrderPayload
            ),
        }
      );

    const yumaData =
      await readYumaResponse(
        yumaResponse
      );

    if (
      !yumaResponse.ok
    ) {
      console.error(
        "Yuma create order error:",
        yumaResponse.status,
        yumaData
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Yuma не приняла заказ.",
          yumaStatus:
            yumaResponse.status,
          yuma:
            yumaData,
        },
        {
          status:
            yumaResponse.status,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      mode: "created",
      order:
        yumaData,
    });
  } catch (error) {
    console.error(
      "Delivery order API error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Не удалось обработать заказ.",
      },
      {
        status: 500,
      }
    );
  }
}

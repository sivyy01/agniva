"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import styles from "./Delivery.module.css";
import { DELIVERY_LINK } from "@/lib/siteLinks";

type ApiMenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number | null;
  weight: number | null;
  unit: string | null;
  image: string | null;
  sortOrder: number;
  isAvailable?: boolean;
  availableStock?: number | null;
};

type ApiMenuCategory = {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  image: string | null;
  sortOrder: number;
  items: ApiMenuItem[];
  children: ApiMenuCategory[];
};

type ApiMenu = {
  profile: "delivery";
  storeId: string;
  categoryCount: number;
  itemCount: number;
  categories: ApiMenuCategory[];
};

type ApiResponse = {
  ok: boolean;
  menu?: ApiMenu;
  error?: string;
};

type CartLine = {
  item: ApiMenuItem;
  quantity: number;
};

type CheckoutMode =
  | "delivery"
  | "takeout";

type CheckoutPayment =
  | "cash"
  | "card";

type CheckoutTimeMode =
  | "asap"
  | "scheduled";

type CheckoutForm = {
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  apt: string;
  entrance: string;
  floor: string;
  intercom: string;
  comment: string;
};

type DeliveryAddress = {
  value: string;
  unrestrictedValue: string;
  fullAddress: string;
  city: string;
  zip: string;
  latitude: number | null;
  longitude: number | null;
  street: string;
  house: string;
};

type AddressApiResponse = {
  ok: boolean;
  mode?:
  | "suggestions"
  | "exact";
  error?: string;
  suggestions?: DeliveryAddress[];
  address?: DeliveryAddress;
};

type OrderSummary = {
  itemCount: number;
  total: number;
  deliveryType:
  | "take-out"
  | "self-delivery";
  paymentType:
  | "cash"
  | "card";
};

type OrderPreviewResponse = {
  ok: boolean;
  mode?: "preview";
  error?: string;
  summary?: OrderSummary;
};

type OrderCreatedResponse = {
  ok: boolean;
  mode?: "created";
  error?: string;
  order?: {
    posOrderId?: string;
    orderDisplayNumber?: string;
    expectedTimeMessage?: string;
    expectedTime?: number;
    expectedIntervalInMinutes?: number;
    invoiceNumber?: string;
  };
};

function collectItems(
  category: ApiMenuCategory
): ApiMenuItem[] {
  return [
    ...category.items,
    ...category.children.flatMap(
      collectItems
    ),
  ].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder
  );
}

function formatPrice(
  price: number | null
) {
  if (
    price === null ||
    !Number.isFinite(price)
  ) {
    return "";
  }

  return `${new Intl.NumberFormat(
    "ru-RU"
  ).format(price)} ₽`;
}
const INTERNAL_DELIVERY_ENABLED = false;
export default function DeliveryPage() {
  const [
    menu,
    setMenu,
  ] =
    useState<ApiMenu | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    activeCategoryId,
    setActiveCategoryId,
  ] =
    useState<string | null>(
      null
    );

  const [
    activeSubcategoryId,
    setActiveSubcategoryId,
  ] =
    useState<string | null>(
      null
    );

  const [
    cart,
    setCart,
  ] =
    useState<
      Record<string, CartLine>
    >({});

  const [
    cartOpen,
    setCartOpen,
  ] =
    useState(false);

  const [
    checkoutOpen,
    setCheckoutOpen,
  ] =
    useState(false);

  const [
    checkoutMode,
    setCheckoutMode,
  ] =
    useState<CheckoutMode>(
      "delivery"
    );

  const [
    checkoutPayment,
    setCheckoutPayment,
  ] =
    useState<CheckoutPayment>(
      "card"
    );
  const [
    personalDataConsent,
    setPersonalDataConsent,
  ] =
    useState(false);

  const [
    checkoutTimeMode,
    setCheckoutTimeMode,
  ] =
    useState<CheckoutTimeMode>(
      "asap"
    );

  const [
    scheduledAt,
    setScheduledAt,
  ] =
    useState("");

  const [
    checkoutMessage,
    setCheckoutMessage,
  ] =
    useState<string | null>(
      null
    );

  const [
    checkoutChecking,
    setCheckoutChecking,
  ] =
    useState(false);

  const [
    checkoutCreating,
    setCheckoutCreating,
  ] =
    useState(false);

  const [
    verifiedFingerprint,
    setVerifiedFingerprint,
  ] =
    useState<string | null>(
      null
    );

  const [
    verifiedSummary,
    setVerifiedSummary,
  ] =
    useState<OrderSummary | null>(
      null
    );

  const [
    createdOrder,
    setCreatedOrder,
  ] =
    useState<
      OrderCreatedResponse["order"] | null
    >(null);

  const [
    checkoutForm,
    setCheckoutForm,
  ] =
    useState<CheckoutForm>({
      phone: "",
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      apt: "",
      entrance: "",
      floor: "",
      intercom: "",
      comment: "",
    });

  const [
    addressSuggestions,
    setAddressSuggestions,
  ] =
    useState<DeliveryAddress[]>(
      []
    );

  const [
    selectedAddress,
    setSelectedAddress,
  ] =
    useState<DeliveryAddress | null>(
      null
    );

  const [
    addressLoading,
    setAddressLoading,
  ] =
    useState(false);

  const [
    addressError,
    setAddressError,
  ] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    async function loadDelivery() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await fetch(
            "/api/delivery",
            {
              cache: "no-store",
            }
          );

        const data =
          (await response.json()) as ApiResponse;

        if (
          !response.ok ||
          !data.ok ||
          !data.menu
        ) {
          throw new Error(
            data.error ??
            "Не удалось загрузить меню доставки"
          );
        }

        setMenu(data.menu);
      } catch (error) {
        console.error(
          "Delivery loading error:",
          error
        );

        setError(
          "Не удалось загрузить меню доставки"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDelivery();
  }, []);

  useEffect(() => {
    if (
      !cartOpen &&
      !checkoutOpen
    ) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    cartOpen,
    checkoutOpen,
  ]);

  useEffect(() => {
    if (
      checkoutMode !==
      "delivery"
    ) {
      setAddressSuggestions(
        []
      );
      setAddressError(null);
      return;
    }

    const query =
      checkoutForm.address.trim();

    /*
     * После выбора адреса повторно
     * DaData не дёргаем, пока человек
     * сам не изменит строку.
     */
    if (
      selectedAddress &&
      query ===
      selectedAddress.value
    ) {
      setAddressSuggestions(
        []
      );
      setAddressError(null);
      return;
    }

    if (query.length < 3) {
      setAddressSuggestions(
        []
      );
      setAddressError(null);
      return;
    }

    const controller =
      new AbortController();

    const timer =
      window.setTimeout(
        async () => {
          try {
            setAddressLoading(
              true
            );
            setAddressError(
              null
            );

            const response =
              await fetch(
                `/api/delivery/address?q=${encodeURIComponent(
                  query
                )}`,
                {
                  cache:
                    "no-store",
                  signal:
                    controller.signal,
                }
              );

            const data =
              (await response.json()) as
              AddressApiResponse;

            if (
              !response.ok ||
              !data.ok
            ) {
              throw new Error(
                data.error ??
                "Не удалось найти адрес."
              );
            }

            setAddressSuggestions(
              data.suggestions ??
              []
            );
          } catch (error) {
            if (
              error instanceof
              DOMException &&
              error.name ===
              "AbortError"
            ) {
              return;
            }

            console.error(
              "Address suggestions error:",
              error
            );

            setAddressSuggestions(
              []
            );
            setAddressError(
              error instanceof Error
                ? error.message
                : "Не удалось найти адрес."
            );
          } finally {
            if (
              !controller.signal
                .aborted
            ) {
              setAddressLoading(
                false
              );
            }
          }
        },
        320
      );

    return () => {
      window.clearTimeout(
        timer
      );
      controller.abort();
    };
  }, [
    checkoutMode,
    checkoutForm.address,
    selectedAddress,
  ]);

  /*
   * У delivery-профиля сейчас один
   * публичный корень — "МЕНЮ".
   */
  const rootCategory =
    menu?.categories[0] ??
    null;

  const categories =
    useMemo(
      () =>
        rootCategory?.children ??
        [],
      [rootCategory]
    );

  const activeCategory =
    useMemo(() => {
      if (!categories.length) {
        return null;
      }

      if (activeCategoryId) {
        const selected =
          categories.find(
            (category) =>
              category.id ===
              activeCategoryId
          );

        if (selected) {
          return selected;
        }
      }

      return categories[0];
    }, [
      categories,
      activeCategoryId,
    ]);

  const activeSubcategory =
    useMemo(() => {
      if (!activeCategory) {
        return null;
      }

      if (
        activeCategory.children.length ===
        0
      ) {
        return null;
      }

      if (activeSubcategoryId) {
        const selected =
          activeCategory.children.find(
            (category) =>
              category.id ===
              activeSubcategoryId
          );

        if (selected) {
          return selected;
        }
      }

      return (
        activeCategory.children[0] ??
        null
      );
    }, [
      activeCategory,
      activeSubcategoryId,
    ]);

  const visibleItems =
    useMemo(() => {
      if (!activeCategory) {
        return [];
      }

      const source =
        activeSubcategory ??
        activeCategory;

      return collectItems(source);
    }, [
      activeCategory,
      activeSubcategory,
    ]);

  const cartItems =
    useMemo(
      () =>
        Object.values(cart),
      [cart]
    );

  const cartCount =
    useMemo(
      () =>
        cartItems.reduce(
          (sum, line) =>
            sum +
            line.quantity,
          0
        ),
      [cartItems]
    );

  const cartTotal =
    useMemo(
      () =>
        cartItems.reduce(
          (sum, line) =>
            sum +
            (line.item.price ?? 0) *
            line.quantity,
          0
        ),
      [cartItems]
    );

  function selectCategory(
    categoryId: string
  ) {
    setActiveCategoryId(
      categoryId
    );

    setActiveSubcategoryId(
      null
    );
  }

  function addToCart(
    item: ApiMenuItem
  ) {
    if (
      item.isAvailable === false
    ) {
      return;
    }

    setCart((current) => {
      const existing =
        current[item.id];

      const currentQuantity =
        existing?.quantity ?? 0;

      if (
        item.availableStock !==
        null &&
        item.availableStock !==
        undefined &&
        currentQuantity >=
        item.availableStock
      ) {
        return current;
      }

      return {
        ...current,
        [item.id]: {
          item,
          quantity:
            currentQuantity + 1,
        },
      };
    });
  }

  function decreaseCartItem(
    itemId: string
  ) {
    setCart((current) => {
      const existing =
        current[itemId];

      if (!existing) {
        return current;
      }

      if (
        existing.quantity <= 1
      ) {
        const next = {
          ...current,
        };

        delete next[itemId];

        return next;
      }

      return {
        ...current,
        [itemId]: {
          ...existing,
          quantity:
            existing.quantity -
            1,
        },
      };
    });
  }

  function removeCartItem(
    itemId: string
  ) {
    setCart((current) => {
      const next = {
        ...current,
      };

      delete next[itemId];

      return next;
    });
  }

  function openCheckout() {
    if (cartCount === 0) {
      return;
    }

    setCheckoutMessage(null);
    setCreatedOrder(null);
    setVerifiedFingerprint(null);
    setVerifiedSummary(null);
    setPersonalDataConsent(false);
    setCartOpen(false);
    setCheckoutOpen(true);
  }

  function updateCheckoutField(
    field: keyof CheckoutForm,
    value: string
  ) {
    /*
     * Если человек руками меняет
     * адрес после выбора подсказки,
     * старые координаты больше
     * использовать нельзя.
     */
    if (field === "address") {
      setSelectedAddress(
        null
      );
      setAddressSuggestions(
        []
      );
      setAddressError(null);
    }

    setCheckoutForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  async function selectDeliveryAddress(
    suggestion: DeliveryAddress
  ) {
    try {
      setAddressLoading(true);
      setAddressError(null);

      const query =
        suggestion.unrestrictedValue ||
        suggestion.value;

      const response =
        await fetch(
          `/api/delivery/address?q=${encodeURIComponent(
            query
          )}&exact=1`,
          {
            cache: "no-store",
          }
        );

      const data =
        (await response.json()) as
        AddressApiResponse;

      if (
        !response.ok ||
        !data.ok ||
        !data.address
      ) {
        throw new Error(
          data.error ??
          "Не удалось подтвердить адрес."
        );
      }

      const address =
        data.address;

      if (
        address.city !==
        "Новокузнецк"
      ) {
        throw new Error(
          "Доставка доступна только по Новокузнецку."
        );
      }

      if (
        !address.street ||
        !address.house
      ) {
        throw new Error(
          "Укажите улицу и номер дома."
        );
      }

      if (
        !address.zip ||
        address.latitude ===
        null ||
        address.longitude ===
        null
      ) {
        throw new Error(
          "Для этого адреса не удалось определить индекс или координаты."
        );
      }

      setSelectedAddress(
        address
      );
      setAddressSuggestions(
        []
      );

      setCheckoutForm(
        (current) => ({
          ...current,
          address:
            address.value,
        })
      );

      /*
       * Любое изменение адреса
       * требует новой preview-проверки.
       */
      setVerifiedFingerprint(
        null
      );
      setVerifiedSummary(
        null
      );
      setCreatedOrder(null);
      setCheckoutMessage(null);
    } catch (error) {
      console.error(
        "Address select error:",
        error
      );

      setSelectedAddress(
        null
      );
      setAddressError(
        error instanceof Error
          ? error.message
          : "Не удалось подтвердить адрес."
      );
    } finally {
      setAddressLoading(false);
    }
  }

  const checkoutFingerprint =
    useMemo(
      () =>
        JSON.stringify({
          mode:
            checkoutMode,
          payment:
            checkoutPayment,
          personalDataConsent,
          timeMode:
            checkoutTimeMode,
          scheduledAt:
            checkoutTimeMode ===
              "scheduled"
              ? scheduledAt
              : null,
          items:
            cartItems
              .map(
                ({
                  item,
                  quantity,
                }) => ({
                  id: item.id,
                  quantity,
                })
              )
              .sort((a, b) =>
                a.id.localeCompare(
                  b.id
                )
              ),
          form:
            checkoutForm,
          selectedAddress:
            selectedAddress
              ? {
                fullAddress:
                  selectedAddress.fullAddress,
                city:
                  selectedAddress.city,
                zip:
                  selectedAddress.zip,
                latitude:
                  selectedAddress.latitude,
                longitude:
                  selectedAddress.longitude,
                house:
                  selectedAddress.house,
              }
              : null,
        }),
      [
        checkoutMode,
        checkoutPayment,
        personalDataConsent,
        checkoutTimeMode,
        scheduledAt,
        cartItems,
        checkoutForm,
        selectedAddress,
      ]
    );

  function buildOrderRequest(
    commit: boolean
  ) {
    return {
      commit,

      personalDataConsent,

      deliveryType:
        checkoutMode ===
          "takeout"
          ? "take-out"
          : "self-delivery",

      paymentType:
        checkoutPayment,

      fulfillmentTime:
        checkoutTimeMode ===
          "scheduled"
          ? {
            mode:
              "scheduled",
            timestamp:
              Math.floor(
                new Date(
                  scheduledAt
                ).getTime() /
                1000
              ),
          }
          : {
            mode:
              "asap",
          },

      items:
        cartItems.map(
          ({
            item,
            quantity,
          }) => ({
            itemId:
              item.id,
            quantity,
          })
        ),

      customer: {
        firstName:
          checkoutForm.firstName.trim(),
        lastName:
          checkoutForm.lastName.trim(),
        phone:
          checkoutForm.phone.trim(),
        email:
          checkoutForm.email.trim(),
      },

      ...(checkoutMode ===
        "delivery" &&
        selectedAddress
        ? {
          address: {
            /*
             * Для Yuma используем
             * подтверждённый DaData
             * адрес, а не просто
             * текст из input.
             */
            fullAddress:
              selectedAddress.value ||
              selectedAddress.fullAddress,
            city:
              selectedAddress.city,
            zip:
              selectedAddress.zip,
            latitude:
              selectedAddress.latitude,
            longitude:
              selectedAddress.longitude,
            apt:
              checkoutForm.apt.trim(),
            entrance:
              checkoutForm.entrance.trim(),
            floor:
              checkoutForm.floor.trim(),
            intercom:
              checkoutForm.intercom.trim(),
          },
        }
        : {}),

      comment:
        checkoutForm.comment.trim(),
    };
  }

  async function validateCheckout() {
    if (
      checkoutChecking
    ) {
      return;
    }

    if (
      !checkoutForm.phone.trim() ||
      !checkoutForm.firstName.trim()
    ) {
      setCheckoutMessage(
        "Укажите имя и телефон."
      );
      return;
    }

    if (
      checkoutTimeMode ===
      "scheduled"
    ) {
      if (!scheduledAt) {
        setCheckoutMessage(
          "Выберите дату и время заказа."
        );
        return;
      }

      const selectedTime =
        new Date(
          scheduledAt
        ).getTime();

      if (
        !Number.isFinite(
          selectedTime
        ) ||
        selectedTime <=
        Date.now()
      ) {
        setCheckoutMessage(
          "Выберите будущее время заказа."
        );
        return;
      }
    }

    if (
      checkoutMode ===
      "delivery" &&
      !checkoutForm.address.trim()
    ) {
      setCheckoutMessage(
        "Для доставки укажите улицу и номер дома."
      );
      return;
    }

    if (
      checkoutMode ===
      "delivery" &&
      !selectedAddress
    ) {
      setCheckoutMessage(
        "Выберите адрес из подсказок, чтобы мы могли определить дом, индекс и координаты."
      );
      return;
    }

    if (
      checkoutMode ===
      "delivery" &&
      selectedAddress &&
      (
        !selectedAddress.house ||
        !selectedAddress.zip ||
        selectedAddress.latitude ===
        null ||
        selectedAddress.longitude ===
        null
      )
    ) {
      setCheckoutMessage(
        "Для доставки нужен подтверждённый адрес с номером дома."
      );
      return;
    }

    if (!personalDataConsent) {
      setCheckoutMessage(
        "Необходимо дать согласие на обработку персональных данных."
      );
      return;
    }

    try {
      setCheckoutChecking(
        true
      );
      setCheckoutMessage(null);

      const response =
        await fetch(
          "/api/delivery/order",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(
                buildOrderRequest(
                  false
                )
              ),
          }
        );

      const data =
        (await response.json()) as
        OrderPreviewResponse;

      if (
        !response.ok ||
        !data.ok ||
        !data.summary
      ) {
        throw new Error(
          data.error ??
          "Не удалось проверить заказ."
        );
      }

      const serverTotal =
        data.summary.total;

      const totalChanged =
        serverTotal !==
        cartTotal;

      setVerifiedFingerprint(
        checkoutFingerprint
      );
      setVerifiedSummary(
        data.summary
      );
      setCreatedOrder(null);

      setCheckoutMessage(
        totalChanged
          ? `Сумма заказа изменилась: ${formatPrice(
            serverTotal
          )}. Проверьте итог перед оформлением.`
          : null
      );
    } catch (error) {
      console.error(
        "Order preview error:",
        error
      );

      setCheckoutMessage(
        error instanceof Error
          ? error.message
          : "Не удалось проверить заказ."
      );
    } finally {
      setCheckoutChecking(
        false
      );
    }
  }

  async function createOrder() {
    if (
      checkoutCreating ||
      createdOrder
    ) {
      return;
    }

    if (
      verifiedFingerprint !==
      checkoutFingerprint ||
      !verifiedSummary
    ) {
      setCheckoutMessage(
        "Сначала повторно проверьте данные заказа."
      );
      return;
    }

    try {
      setCheckoutCreating(
        true
      );
      setCheckoutMessage(null);

      const response =
        await fetch(
          "/api/delivery/order",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(
                buildOrderRequest(
                  true
                )
              ),
          }
        );

      const data =
        (await response.json()) as
        OrderCreatedResponse;

      if (
        !response.ok ||
        !data.ok ||
        data.mode !==
        "created"
      ) {
        throw new Error(
          data.error ??
          "Не удалось оформить заказ."
        );
      }

      setCreatedOrder(
        data.order ?? {}
      );
      setCart({});

      const orderNumber =
        data.order
          ?.orderDisplayNumber ||
        data.order
          ?.invoiceNumber ||
        data.order
          ?.posOrderId ||
        "";

      setCheckoutMessage(null);
    } catch (error) {
      console.error(
        "Create order error:",
        error
      );

      setCheckoutMessage(
        error instanceof Error
          ? error.message
          : "Не удалось создать заказ."
      );
    } finally {
      setCheckoutCreating(
        false
      );
    }
  }

  return (
  <main className={styles.page}>
    {INTERNAL_DELIVERY_ENABLED && (
      <button
        type="button"
        onClick={() =>
          setCartOpen(true)
        }
        style={{
          position: "fixed",
          top: "132px",
          right: "28px",
          zIndex: 1050,
          border:
            "1px solid rgba(255,35,45,0.75)",
          background:
            "rgba(8,8,8,0.94)",
          color: "#fff",
          padding:
            "12px 16px",
          cursor: "pointer",
          fontSize: "12px",
          letterSpacing:
            "0.08em",
          backdropFilter:
            "blur(12px)",
        }}
      >
        КОРЗИНА · {cartCount}
        {cartCount > 0
          ? ` · ${formatPrice(
              cartTotal
            )}`
          : ""}
      </button>
    )}

    <section
      className={styles.hero}
    >
        <div>
          <span
            className={
              styles.eyebrow
            }
          >
            АГНИВА
          </span>

          <h1>
            ДОСТАВКА
            <br />
            ВКУСА И ОГНЯ
          </h1>

          <p>
            Любимые блюда Агнивы
            у вас дома.
            <br />
            Меню, цены и фотографии
            всегда актуальны и
            обновляются автоматически.
          </p>

          <div
            className={
              styles.actions
            }
          >
            <a
              href={DELIVERY_LINK}
              target="_blank"
              rel="noreferrer"
              className={styles.primary}
            >
              СМОТРЕТЬ МЕНЮ
            </a>
          </div>
        </div>

        <div className={styles.visual} />
      </section>

      {INTERNAL_DELIVERY_ENABLED && (
  <section
    id="delivery-menu"
    className={styles.deliveryMenu}
  >
        <div
          className={
            styles.deliveryMenuHeader
          }
        >
          <span>ДОСТАВКА</span>

          <h2>
            МЕНЮ ДОСТАВКИ
          </h2>


        </div>

        {loading && (
          <div
            className={
              styles.menuPlaceholder
            }
          >
            <span>АГНИВА</span>
            <p>
              ЗАГРУЖАЕМ МЕНЮ...
            </p>
          </div>
        )}

        {!loading &&
          error && (
            <div
              className={
                styles.menuPlaceholder
              }
            >
              <span>АГНИВА</span>
              <p>{error}</p>
            </div>
          )}

        {!loading &&
          !error &&
          activeCategory && (
            <>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "26px",
                }}
              >
                {categories.map(
                  (category) => {
                    const isActive =
                      activeCategory.id ===
                      category.id;

                    return (
                      <button

                        key={
                          category.id
                        }
                        type="button"
                        onClick={() =>
                          selectCategory(
                            category.id
                          )
                        }
                        style={{
                          border:
                            isActive
                              ? "1px solid rgba(255,255,255,0.8)"
                              : "1px solid rgba(255,255,255,0.18)",
                          background:
                            isActive
                              ? "rgba(255,255,255,0.08)"
                              : "transparent",
                          color: "#fff",
                          padding:
                            "11px 16px",
                          cursor:
                            "pointer",
                          fontSize:
                            "12px",
                          letterSpacing:
                            "0.08em",
                        }}
                      >
                        {category.name}
                      </button>
                    );
                  }
                )}
              </div>

              {activeCategory
                .children.length >
                0 && (
                  <div
                    style={{
                      display:
                        "flex",
                      flexWrap:
                        "wrap",
                      gap: "8px",
                      marginBottom:
                        "32px",
                    }}
                  >
                    {activeCategory.children.map(
                      (
                        category
                      ) => {
                        const isActive =
                          activeSubcategory
                            ?.id ===
                          category.id;

                        return (
                          <button
                            key={
                              category.id
                            }
                            type="button"
                            onClick={() =>
                              setActiveSubcategoryId(
                                category.id
                              )
                            }
                            style={{
                              border:
                                "none",
                              borderBottom:
                                isActive
                                  ? "1px solid #fff"
                                  : "1px solid transparent",
                              background:
                                "transparent",
                              color:
                                isActive
                                  ? "#fff"
                                  : "rgba(255,255,255,0.55)",
                              padding:
                                "8px 4px",
                              cursor:
                                "pointer",
                              fontSize:
                                "12px",
                              letterSpacing:
                                "0.06em",
                            }}
                          >
                            {category.name}
                          </button>
                        );
                      }
                    )}
                  </div>
                )}

              <div
                style={{
                  display: "flex",
                  alignItems:
                    "flex-end",
                  justifyContent:
                    "space-between",
                  gap: "20px",
                  marginBottom:
                    "24px",
                }}
              >
                <div>
                  <span
                    style={{
                      display:
                        "block",
                      marginBottom:
                        "8px",
                      color:
                        "rgba(255,255,255,0.45)",
                      fontSize:
                        "11px",
                      letterSpacing:
                        "0.1em",
                    }}
                  >
                    КАТЕГОРИЯ
                  </span>

                  <h3
                    style={{
                      margin: 0,
                      color:
                        "#fff",
                      fontSize:
                        "clamp(28px, 4vw, 52px)",
                      fontWeight:
                        500,
                    }}
                  >
                    {(
                      activeSubcategory ??
                      activeCategory
                    ).name}
                  </h3>
                </div>

                <span
                  style={{
                    color:
                      "rgba(255,255,255,0.45)",
                    fontSize:
                      "12px",
                  }}
                >
                  {
                    visibleItems.length
                  }{" "}
                  ПОЗ.
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "18px",
                }}
              >
                {visibleItems.map(
                  (item) => (
                    <article
                      key={item.id}
                      style={{
                        overflow:
                          "hidden",
                        border:
                          "1px solid rgba(255,255,255,0.10)",
                        background:
                          "rgba(255,255,255,0.025)",
                        display:
                          "flex",
                        flexDirection:
                          "column",
                        height:
                          "100%",
                      }}
                    >
                      <div
                        style={{
                          aspectRatio:
                            "4 / 3",
                          overflow:
                            "hidden",
                          background:
                            "#111",
                        }}
                      >
                        {item.image ? (
                          <img
                            src={
                              item.image
                            }
                            alt={
                              item.name
                            }
                            style={{
                              width:
                                "100%",
                              height:
                                "100%",
                              objectFit:
                                "cover",
                              display:
                                "block",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width:
                                "100%",
                              height:
                                "100%",
                              display:
                                "grid",
                              placeItems:
                                "center",
                              color:
                                "rgba(255,255,255,0.22)",
                              letterSpacing:
                                "0.14em",
                            }}
                          >
                            АГНИВА
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          padding:
                            "18px",
                          display:
                            "flex",
                          flexDirection:
                            "column",
                          flex:
                            "1 1 auto",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "flex-start",
                            gap:
                              "18px",
                          }}
                        >
                          <h4
                            style={{
                              margin:
                                0,
                              color:
                                "#fff",
                              fontSize:
                                "20px",
                              lineHeight:
                                1.15,
                              fontWeight:
                                500,
                            }}
                          >
                            {
                              item.name
                            }
                          </h4>

                          <strong
                            style={{
                              flexShrink:
                                0,
                              color:
                                "#fff",
                              fontSize:
                                "15px",
                            }}
                          >
                            {formatPrice(
                              item.price
                            )}
                          </strong>
                        </div>

                        {item.description && (
                          <p
                            style={{
                              margin:
                                "14px 0 0",
                              color:
                                "rgba(255,255,255,0.55)",
                              fontSize:
                                "13px",
                              lineHeight:
                                1.55,
                              whiteSpace:
                                "pre-line",
                            }}
                          >
                            {
                              item.description
                            }
                          </p>
                        )}

                        <div
                          style={{
                            marginTop:
                              "auto",
                            paddingTop:
                              "18px",
                          }}
                        >
                          {item.isAvailable ===
                            false ? (
                            <button
                              type="button"
                              disabled
                              style={{
                                width:
                                  "100%",
                                minHeight:
                                  "44px",
                                border:
                                  "1px solid rgba(255,255,255,0.12)",
                                background:
                                  "rgba(255,255,255,0.035)",
                                color:
                                  "rgba(255,255,255,0.38)",
                                cursor:
                                  "not-allowed",
                                fontSize:
                                  "12px",
                                letterSpacing:
                                  "0.1em",
                              }}
                            >
                              ВРЕМЕННО НЕДОСТУПНО
                            </button>
                          ) : cart[item.id] ? (
                            <div
                              style={{
                                display:
                                  "grid",
                                gridTemplateColumns:
                                  "44px 1fr 44px",
                                minHeight:
                                  "44px",
                                border:
                                  "1px solid rgba(255,35,45,0.75)",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  decreaseCartItem(
                                    item.id
                                  )
                                }
                                style={{
                                  border:
                                    "none",
                                  background:
                                    "transparent",
                                  color:
                                    "#fff",
                                  cursor:
                                    "pointer",
                                  fontSize:
                                    "22px",
                                }}
                              >
                                −
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setCartOpen(
                                    true
                                  )
                                }
                                style={{
                                  border:
                                    "none",
                                  borderLeft:
                                    "1px solid rgba(255,35,45,0.35)",
                                  borderRight:
                                    "1px solid rgba(255,35,45,0.35)",
                                  background:
                                    "rgba(255,35,45,0.08)",
                                  color:
                                    "#fff",
                                  cursor:
                                    "pointer",
                                  fontSize:
                                    "13px",
                                  letterSpacing:
                                    "0.08em",
                                }}
                              >
                                {
                                  cart[
                                    item.id
                                  ].quantity
                                }{" "}
                                В КОРЗИНЕ
                              </button>

                              <button
                                type="button"
                                disabled={
                                  item.availableStock !==
                                  null &&
                                  item.availableStock !==
                                  undefined &&
                                  cart[item.id]
                                    .quantity >=
                                  item.availableStock
                                }
                                onClick={() =>
                                  addToCart(
                                    item
                                  )
                                }
                                style={{
                                  border:
                                    "none",
                                  background:
                                    "transparent",
                                  color:
                                    "#fff",
                                  cursor:
                                    item.availableStock !==
                                      null &&
                                      item.availableStock !==
                                      undefined &&
                                      cart[item.id]
                                        .quantity >=
                                      item.availableStock
                                      ? "not-allowed"
                                      : "pointer",
                                  opacity:
                                    item.availableStock !==
                                      null &&
                                      item.availableStock !==
                                      undefined &&
                                      cart[item.id]
                                        .quantity >=
                                      item.availableStock
                                      ? 0.35
                                      : 1,
                                  fontSize:
                                    "22px",
                                }}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={
                                item.price ===
                                null
                              }
                              onClick={() =>
                                addToCart(
                                  item
                                )
                              }
                              style={{
                                width:
                                  "100%",
                                minHeight:
                                  "44px",
                                border:
                                  "1px solid rgba(255,35,45,0.75)",
                                background:
                                  "rgba(255,35,45,0.08)",
                                color:
                                  "#fff",
                                cursor:
                                  item.price ===
                                    null
                                    ? "not-allowed"
                                    : "pointer",
                                opacity:
                                  item.price ===
                                    null
                                    ? 0.45
                                    : 1,
                                fontSize:
                                  "12px",
                                letterSpacing:
                                  "0.1em",
                              }}
                            >
                              ДОБАВИТЬ
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            </>
          )
        }
      </section>
      )}

      {INTERNAL_DELIVERY_ENABLED && cartOpen && (
        <>
          <button
            type="button"
            aria-label="Закрыть корзину"
            onClick={() =>
              setCartOpen(false)
            }
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1190,
              border: "none",
              background:
                "rgba(0,0,0,0.62)",
              cursor: "default",
            }}
          />

          <aside
            aria-label="Корзина"
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 1200,
              width:
                "min(460px, 100vw)",
              display: "flex",
              flexDirection:
                "column",
              background: "#070707",
              borderLeft:
                "1px solid rgba(255,255,255,0.12)",
              boxShadow:
                "-30px 0 80px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap: "20px",
                padding:
                  "22px 22px 18px",
                borderBottom:
                  "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div>
                <span
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "5px",
                    color:
                      "rgba(255,255,255,0.45)",
                    fontSize:
                      "10px",
                    letterSpacing:
                      "0.12em",
                  }}
                >
                  ДОСТАВКА АГНИВА
                </span>

                <strong
                  style={{
                    color: "#fff",
                    fontSize:
                      "24px",
                    fontWeight:
                      500,
                  }}
                >
                  КОРЗИНА
                </strong>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCartOpen(false)
                }
                style={{
                  width: "42px",
                  height: "42px",
                  border:
                    "1px solid rgba(255,255,255,0.18)",
                  background:
                    "transparent",
                  color: "#fff",
                  cursor:
                    "pointer",
                  fontSize:
                    "20px",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY:
                  "auto",
                padding:
                  "18px 22px",
              }}
            >
              {cartItems.length ===
                0 ? (
                <div
                  style={{
                    minHeight:
                      "260px",
                    display:
                      "grid",
                    placeItems:
                      "center",
                    textAlign:
                      "center",
                    color:
                      "rgba(255,255,255,0.5)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        marginBottom:
                          "10px",
                        color:
                          "#fff",
                        fontSize:
                          "18px",
                      }}
                    >
                      КОРЗИНА ПУСТА
                    </div>
                    <div
                      style={{
                        fontSize:
                          "13px",
                        lineHeight:
                          1.5,
                      }}
                    >
                      Добавьте блюда
                      из меню доставки.
                    </div>
                  </div>
                </div>
              ) : (
                cartItems.map(
                  ({
                    item,
                    quantity,
                  }) => (
                    <article
                      key={item.id}
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "86px 1fr",
                        gap: "14px",
                        padding:
                          "0 0 18px",
                        marginBottom:
                          "18px",
                        borderBottom:
                          "1px solid rgba(255,255,255,0.10)",
                      }}
                    >
                      <div
                        style={{
                          width:
                            "86px",
                          height:
                            "86px",
                          overflow:
                            "hidden",
                          background:
                            "#111",
                        }}
                      >
                        {item.image ? (
                          <img
                            src={
                              item.image
                            }
                            alt=""
                            style={{
                              width:
                                "100%",
                              height:
                                "100%",
                              objectFit:
                                "cover",
                              display:
                                "block",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width:
                                "100%",
                              height:
                                "100%",
                              display:
                                "grid",
                              placeItems:
                                "center",
                              color:
                                "rgba(255,255,255,0.22)",
                              fontSize:
                                "10px",
                            }}
                          >
                            АГНИВА
                          </div>
                        )}
                      </div>

                      <div>
                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            gap:
                              "12px",
                          }}
                        >
                          <strong
                            style={{
                              color:
                                "#fff",
                              fontSize:
                                "15px",
                              lineHeight:
                                1.3,
                              fontWeight:
                                500,
                            }}
                          >
                            {
                              item.name
                            }
                          </strong>

                          <button
                            type="button"
                            aria-label={`Удалить ${item.name}`}
                            onClick={() =>
                              removeCartItem(
                                item.id
                              )
                            }
                            style={{
                              border:
                                "none",
                              background:
                                "transparent",
                              color:
                                "rgba(255,255,255,0.45)",
                              cursor:
                                "pointer",
                              fontSize:
                                "18px",
                            }}
                          >
                            ×
                          </button>
                        </div>

                        <div
                          style={{
                            marginTop:
                              "8px",
                            color:
                              "rgba(255,255,255,0.65)",
                            fontSize:
                              "13px",
                          }}
                        >
                          {formatPrice(
                            item.price
                          )}
                        </div>

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "space-between",
                            gap:
                              "12px",
                            marginTop:
                              "14px",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "grid",
                              gridTemplateColumns:
                                "34px 42px 34px",
                              height:
                                "34px",
                              border:
                                "1px solid rgba(255,255,255,0.18)",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                decreaseCartItem(
                                  item.id
                                )
                              }
                              style={{
                                border:
                                  "none",
                                background:
                                  "transparent",
                                color:
                                  "#fff",
                                cursor:
                                  "pointer",
                                fontSize:
                                  "18px",
                              }}
                            >
                              −
                            </button>

                            <span
                              style={{
                                display:
                                  "grid",
                                placeItems:
                                  "center",
                                borderLeft:
                                  "1px solid rgba(255,255,255,0.10)",
                                borderRight:
                                  "1px solid rgba(255,255,255,0.10)",
                                color:
                                  "#fff",
                                fontSize:
                                  "13px",
                              }}
                            >
                              {
                                quantity
                              }
                            </span>

                            <button
                              type="button"
                              disabled={
                                item.isAvailable ===
                                false ||
                                (
                                  item.availableStock !==
                                  null &&
                                  item.availableStock !==
                                  undefined &&
                                  quantity >=
                                  item.availableStock
                                )
                              }
                              onClick={() =>
                                addToCart(
                                  item
                                )
                              }
                              style={{
                                border:
                                  "none",
                                background:
                                  "transparent",
                                color:
                                  "#fff",
                                cursor:
                                  item.isAvailable ===
                                    false ||
                                    (
                                      item.availableStock !==
                                      null &&
                                      item.availableStock !==
                                      undefined &&
                                      quantity >=
                                      item.availableStock
                                    )
                                    ? "not-allowed"
                                    : "pointer",
                                opacity:
                                  item.isAvailable ===
                                    false ||
                                    (
                                      item.availableStock !==
                                      null &&
                                      item.availableStock !==
                                      undefined &&
                                      quantity >=
                                      item.availableStock
                                    )
                                    ? 0.35
                                    : 1,
                                fontSize:
                                  "18px",
                              }}
                            >
                              +
                            </button>
                          </div>

                          <strong
                            style={{
                              color:
                                "#fff",
                              fontSize:
                                "14px",
                            }}
                          >
                            {formatPrice(
                              (item.price ??
                                0) *
                              quantity
                            )}
                          </strong>
                        </div>
                      </div>
                    </article>
                  )
                )
              )}
            </div>

            <div
              style={{
                padding:
                  "18px 22px 22px",
                borderTop:
                  "1px solid rgba(255,255,255,0.10)",
                background:
                  "#090909",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  gap: "20px",
                  marginBottom:
                    "16px",
                }}
              >
                <span
                  style={{
                    color:
                      "rgba(255,255,255,0.55)",
                    fontSize:
                      "12px",
                    letterSpacing:
                      "0.08em",
                  }}
                >
                  ИТОГО ·{" "}
                  {createdOrder &&
                    verifiedSummary
                    ? verifiedSummary.itemCount
                    : cartCount}{" "}
                  ПОЗ.
                </span>

                <strong
                  style={{
                    color: "#fff",
                    fontSize:
                      "22px",
                    fontWeight:
                      500,
                  }}
                >
                  {formatPrice(
                    createdOrder &&
                      verifiedSummary
                      ? verifiedSummary.total
                      : cartTotal
                  )}
                </strong>
              </div>

              <button
                type="button"
                disabled={
                  cartCount === 0
                }
                onClick={
                  openCheckout
                }
                style={{
                  width: "100%",
                  minHeight:
                    "52px",
                  border:
                    "1px solid rgba(255,35,45,0.85)",
                  background:
                    cartCount > 0
                      ? "rgba(255,35,45,0.14)"
                      : "rgba(255,255,255,0.03)",
                  color:
                    cartCount > 0
                      ? "#fff"
                      : "rgba(255,255,255,0.3)",
                  cursor:
                    cartCount > 0
                      ? "pointer"
                      : "not-allowed",
                  fontSize:
                    "12px",
                  letterSpacing:
                    "0.1em",
                }}
              >
                К ОФОРМЛЕНИЮ
              </button>
            </div>
          </aside>
        </>
      )}

      
  {INTERNAL_DELIVERY_ENABLED && checkoutOpen && (
    <>
            <button
              type="button"
              aria-label="Закрыть оформление"
              onClick={() =>
                setCheckoutOpen(false)
              }
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1190,
                border: "none",
                background:
                  "rgba(0,0,0,0.62)",
              }}
            />

            <aside
              aria-label="Оформление заказа"
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                zIndex: 1200,
                width:
                  "min(560px, 100vw)",
                display: "flex",
                flexDirection:
                  "column",
                background: "#070707",
                borderLeft:
                  "1px solid rgba(255,255,255,0.12)",
                boxShadow:
                  "-30px 0 80px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  gap: "20px",
                  padding:
                    "22px",
                  borderBottom:
                    "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutOpen(
                        false
                      );
                      setCartOpen(true);
                    }}
                    style={{
                      border: "none",
                      background:
                        "transparent",
                      color:
                        "rgba(255,255,255,0.55)",
                      padding: 0,
                      marginBottom:
                        "8px",
                      cursor:
                        "pointer",
                      fontSize:
                        "11px",
                      letterSpacing:
                        "0.08em",
                    }}
                  >
                    ← В КОРЗИНУ
                  </button>

                  <strong
                    style={{
                      display:
                        "block",
                      color: "#fff",
                      fontSize:
                        "24px",
                      fontWeight:
                        500,
                    }}
                  >
                    ОФОРМЛЕНИЕ
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCheckoutOpen(
                      false
                    )
                  }
                  style={{
                    width: "42px",
                    height: "42px",
                    border:
                      "1px solid rgba(255,255,255,0.18)",
                    background:
                      "transparent",
                    color: "#fff",
                    cursor:
                      "pointer",
                    fontSize:
                      "20px",
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY:
                    "auto",
                  padding:
                    "22px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "10px",
                    marginBottom:
                      "28px",
                  }}
                >
                  {(
                    [
                      [
                        "delivery",
                        "ДОСТАВКА",
                      ],
                      [
                        "takeout",
                        "САМОВЫВОЗ",
                      ],
                    ] as const
                  ).map(
                    ([
                      mode,
                      label,
                    ]) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setCheckoutMode(
                            mode
                          );
                          setCheckoutMessage(
                            null
                          );
                        }}
                        style={{
                          minHeight:
                            "48px",
                          border:
                            checkoutMode ===
                              mode
                              ? "1px solid rgba(255,35,45,0.9)"
                              : "1px solid rgba(255,255,255,0.16)",
                          background:
                            checkoutMode ===
                              mode
                              ? "rgba(255,35,45,0.12)"
                              : "transparent",
                          color:
                            "#fff",
                          cursor:
                            "pointer",
                          fontSize:
                            "12px",
                          letterSpacing:
                            "0.08em",
                        }}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>

                <div
                  style={{
                    marginBottom:
                      "28px",
                  }}
                >
                  <span
                    style={{
                      display:
                        "block",
                      marginBottom:
                        "14px",
                      color:
                        "rgba(255,255,255,0.42)",
                      fontSize:
                        "10px",
                      letterSpacing:
                        "0.12em",
                    }}
                  >
                    ВРЕМЯ
                  </span>

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap:
                        "10px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutTimeMode(
                          "asap"
                        );
                        setCheckoutMessage(
                          null
                        );
                      }}
                      style={{
                        minHeight:
                          "48px",
                        border:
                          checkoutTimeMode ===
                            "asap"
                            ? "1px solid rgba(255,35,45,0.9)"
                            : "1px solid rgba(255,255,255,0.16)",
                        background:
                          checkoutTimeMode ===
                            "asap"
                            ? "rgba(255,35,45,0.12)"
                            : "transparent",
                        color:
                          "#fff",
                        cursor:
                          "pointer",
                        fontSize:
                          "12px",
                        letterSpacing:
                          "0.06em",
                      }}
                    >
                      КАК МОЖНО СКОРЕЕ
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutTimeMode(
                          "scheduled"
                        );
                        setCheckoutMessage(
                          null
                        );
                      }}
                      style={{
                        minHeight:
                          "48px",
                        border:
                          checkoutTimeMode ===
                            "scheduled"
                            ? "1px solid rgba(255,35,45,0.9)"
                            : "1px solid rgba(255,255,255,0.16)",
                        background:
                          checkoutTimeMode ===
                            "scheduled"
                            ? "rgba(255,35,45,0.12)"
                            : "transparent",
                        color:
                          "#fff",
                        cursor:
                          "pointer",
                        fontSize:
                          "12px",
                        letterSpacing:
                          "0.06em",
                      }}
                    >
                      К ОПРЕДЕЛЁННОМУ ВРЕМЕНИ
                    </button>
                  </div>

                  {checkoutTimeMode ===
                    "scheduled" && (
                      <div
                        style={{
                          marginTop:
                            "10px",
                        }}
                      >
                        <input
                          type="datetime-local"
                          value={
                            scheduledAt
                          }
                          onChange={(
                            event
                          ) => {
                            setScheduledAt(
                              event.target
                                .value
                            );
                            setCheckoutMessage(
                              null
                            );
                          }}
                          style={{
                            width:
                              "100%",
                            boxSizing:
                              "border-box",
                            minHeight:
                              "50px",
                            border:
                              "1px solid rgba(255,255,255,0.16)",
                            background:
                              "rgba(255,255,255,0.025)",
                            color:
                              "#fff",
                            padding:
                              "0 14px",
                            outline:
                              "none",
                            fontSize:
                              "14px",
                            colorScheme:
                              "dark",
                          }}
                        />

                        <span
                          style={{
                            display:
                              "block",
                            marginTop:
                              "8px",
                            color:
                              "rgba(255,255,255,0.42)",
                            fontSize:
                              "11px",
                            lineHeight:
                              1.45,
                          }}
                        >
                          Выберите дату и время, к которому нужен заказ.
                        </span>
                      </div>
                    )}
                </div>

                <span
                  style={{
                    display: "block",
                    marginBottom:
                      "14px",
                    color:
                      "rgba(255,255,255,0.42)",
                    fontSize:
                      "10px",
                    letterSpacing:
                      "0.12em",
                  }}
                >
                  КОНТАКТНЫЕ ДАННЫЕ
                </span>

                {(
                  [
                    [
                      "phone",
                      "Телефон *",
                      "tel",
                    ],
                    [
                      "firstName",
                      "Имя *",
                      "text",
                    ],
                    [
                      "lastName",
                      "Фамилия",
                      "text",
                    ],
                    [
                      "email",
                      "Email",
                      "email",
                    ],
                  ] as const
                ).map(
                  ([
                    field,
                    placeholder,
                    type,
                  ]) => (
                    <input
                      key={field}
                      type={type}
                      value={
                        checkoutForm[
                        field
                        ]
                      }
                      onChange={(
                        event
                      ) =>
                        updateCheckoutField(
                          field,
                          event.target
                            .value
                        )
                      }
                      placeholder={
                        placeholder
                      }
                      style={{
                        width:
                          "100%",
                        boxSizing:
                          "border-box",
                        minHeight:
                          "50px",
                        marginBottom:
                          "10px",
                        border:
                          "1px solid rgba(255,255,255,0.16)",
                        background:
                          "rgba(255,255,255,0.025)",
                        color:
                          "#fff",
                        padding:
                          "0 14px",
                        outline:
                          "none",
                        fontSize:
                          "14px",
                      }}
                    />
                  )
                )}

                {checkoutMode ===
                  "delivery" && (
                    <>
                      <span
                        style={{
                          display:
                            "block",
                          margin:
                            "20px 0 14px",
                          color:
                            "rgba(255,255,255,0.42)",
                          fontSize:
                            "10px",
                          letterSpacing:
                            "0.12em",
                        }}
                      >
                        АДРЕС ДОСТАВКИ
                      </span>

                      <div
                        style={{
                          display:
                            "grid",
                          gridTemplateColumns:
                            "120px 1fr",
                          minHeight:
                            "50px",
                          marginBottom:
                            "10px",
                          border:
                            "1px solid rgba(255,255,255,0.16)",
                          background:
                            "rgba(255,255,255,0.025)",
                        }}
                      >
                        <span
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            padding:
                              "0 14px",
                            borderRight:
                              "1px solid rgba(255,255,255,0.10)",
                            color:
                              "rgba(255,255,255,0.42)",
                            fontSize:
                              "11px",
                            letterSpacing:
                              "0.06em",
                          }}
                        >
                          ГОРОД
                        </span>

                        <strong
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            padding:
                              "0 14px",
                            color:
                              "#fff",
                            fontSize:
                              "14px",
                            fontWeight:
                              500,
                          }}
                        >
                          Новокузнецк
                        </strong>
                      </div>

                      <div
                        style={{
                          position:
                            "relative",
                          marginBottom:
                            "10px",
                        }}
                      >
                        <input
                          type="text"
                          autoComplete="off"
                          value={
                            checkoutForm.address
                          }
                          onChange={(
                            event
                          ) =>
                            updateCheckoutField(
                              "address",
                              event.target
                                .value
                            )
                          }
                          placeholder="Улица и номер дома *"
                          style={{
                            width:
                              "100%",
                            boxSizing:
                              "border-box",
                            minHeight:
                              "50px",
                            border:
                              selectedAddress
                                ? "1px solid rgba(90,220,130,0.48)"
                                : "1px solid rgba(255,255,255,0.16)",
                            background:
                              "rgba(255,255,255,0.025)",
                            color:
                              "#fff",
                            padding:
                              "0 14px",
                            outline:
                              "none",
                            fontSize:
                              "14px",
                          }}
                        />

                        {addressLoading && (
                          <span
                            style={{
                              position:
                                "absolute",
                              top: "17px",
                              right:
                                "14px",
                              color:
                                "rgba(255,255,255,0.38)",
                              fontSize:
                                "10px",
                              letterSpacing:
                                "0.06em",
                            }}
                          >
                            ИЩЕМ...
                          </span>
                        )}

                        {addressSuggestions.length >
                          0 && (
                            <div
                              style={{
                                position:
                                  "absolute",
                                left: 0,
                                right: 0,
                                top:
                                  "calc(100% + 4px)",
                                zIndex:
                                  1300,
                                maxHeight:
                                  "260px",
                                overflowY:
                                  "auto",
                                border:
                                  "1px solid rgba(255,255,255,0.16)",
                                background:
                                  "#0b0b0b",
                                boxShadow:
                                  "0 18px 48px rgba(0,0,0,0.55)",
                              }}
                            >
                              {addressSuggestions.map(
                                (
                                  suggestion,
                                  index
                                ) => (
                                  <button
                                    key={`${suggestion.value}-${index}`}
                                    type="button"
                                    onClick={() =>
                                      selectDeliveryAddress(
                                        suggestion
                                      )
                                    }
                                    style={{
                                      width:
                                        "100%",
                                      display:
                                        "block",
                                      border:
                                        "none",
                                      borderBottom:
                                        index <
                                          addressSuggestions.length -
                                          1
                                          ? "1px solid rgba(255,255,255,0.07)"
                                          : "none",
                                      background:
                                        "transparent",
                                      color:
                                        "#fff",
                                      padding:
                                        "13px 14px",
                                      textAlign:
                                        "left",
                                      cursor:
                                        "pointer",
                                      fontSize:
                                        "13px",
                                      lineHeight:
                                        1.45,
                                    }}
                                  >
                                    {
                                      suggestion.value
                                    }
                                  </button>
                                )
                              )}
                            </div>
                          )}
                      </div>

                      {selectedAddress && (
                        <div
                          style={{
                            margin:
                              "0 0 10px",
                            padding:
                              "10px 12px",
                            border:
                              "1px solid rgba(90,220,130,0.25)",
                            background:
                              "rgba(90,220,130,0.055)",
                            color:
                              "rgba(220,255,230,0.78)",
                            fontSize:
                              "11px",
                            lineHeight:
                              1.45,
                          }}
                        >
                          ✓ Адрес подтверждён
                          {" · "}
                          {selectedAddress.zip}
                        </div>
                      )}

                      {addressError && (
                        <div
                          style={{
                            margin:
                              "0 0 10px",
                            padding:
                              "10px 12px",
                            border:
                              "1px solid rgba(255,70,70,0.35)",
                            background:
                              "rgba(255,70,70,0.06)",
                            color:
                              "rgba(255,220,220,0.88)",
                            fontSize:
                              "11px",
                            lineHeight:
                              1.45,
                          }}
                        >
                          {addressError}
                        </div>
                      )}

                      <div
                        style={{
                          display:
                            "grid",
                          gridTemplateColumns:
                            "1fr 1fr",
                          gap: "10px",
                        }}
                      >
                        {(
                          [
                            [
                              "apt",
                              "Квартира",
                            ],
                            [
                              "entrance",
                              "Подъезд",
                            ],
                            [
                              "floor",
                              "Этаж",
                            ],
                            [
                              "intercom",
                              "Домофон",
                            ],
                          ] as const
                        ).map(
                          ([
                            field,
                            placeholder,
                          ]) => (
                            <input
                              key={
                                field
                              }
                              type="text"
                              value={
                                checkoutForm[
                                field
                                ]
                              }
                              onChange={(
                                event
                              ) =>
                                updateCheckoutField(
                                  field,
                                  event
                                    .target
                                    .value
                                )
                              }
                              placeholder={
                                placeholder
                              }
                              style={{
                                width:
                                  "100%",
                                boxSizing:
                                  "border-box",
                                minHeight:
                                  "50px",
                                border:
                                  "1px solid rgba(255,255,255,0.16)",
                                background:
                                  "rgba(255,255,255,0.025)",
                                color:
                                  "#fff",
                                padding:
                                  "0 14px",
                                outline:
                                  "none",
                                fontSize:
                                  "14px",
                              }}
                            />
                          )
                        )}
                      </div>
                    </>
                  )}

                <span
                  style={{
                    display: "block",
                    margin:
                      "24px 0 14px",
                    color:
                      "rgba(255,255,255,0.42)",
                    fontSize:
                      "10px",
                    letterSpacing:
                      "0.12em",
                  }}
                >
                  КОММЕНТАРИЙ
                </span>

                <textarea
                  value={
                    checkoutForm.comment
                  }
                  onChange={(
                    event
                  ) =>
                    updateCheckoutField(
                      "comment",
                      event.target
                        .value
                    )
                  }
                  placeholder="Комментарий к заказу"
                  rows={4}
                  style={{
                    width:
                      "100%",
                    boxSizing:
                      "border-box",
                    resize:
                      "vertical",
                    border:
                      "1px solid rgba(255,255,255,0.16)",
                    background:
                      "rgba(255,255,255,0.025)",
                    color: "#fff",
                    padding: "14px",
                    outline: "none",
                    fontSize:
                      "14px",
                    fontFamily:
                      "inherit",
                  }}
                />

                <div
                  style={{
                    marginTop:
                      "24px",
                  }}
                >
                  <span
                    style={{
                      display:
                        "block",
                      marginBottom:
                        "14px",
                      color:
                        "rgba(255,255,255,0.42)",
                      fontSize:
                        "10px",
                      letterSpacing:
                        "0.12em",
                    }}
                  >
                    ОПЛАТА
                  </span>

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutPayment(
                          "card"
                        );
                        setCheckoutMessage(
                          null
                        );
                      }}
                      style={{
                        minHeight:
                          "48px",
                        border:
                          checkoutPayment ===
                            "card"
                            ? "1px solid rgba(255,35,45,0.9)"
                            : "1px solid rgba(255,255,255,0.16)",
                        background:
                          checkoutPayment ===
                            "card"
                            ? "rgba(255,35,45,0.12)"
                            : "transparent",
                        color: "#fff",
                        cursor:
                          "pointer",
                        fontSize:
                          "12px",
                        letterSpacing:
                          "0.08em",
                      }}
                    >
                      КАРТОЙ
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutPayment(
                          "cash"
                        );
                        setCheckoutMessage(
                          null
                        );
                      }}
                      style={{
                        minHeight:
                          "48px",
                        border:
                          checkoutPayment ===
                            "cash"
                            ? "1px solid rgba(255,35,45,0.9)"
                            : "1px solid rgba(255,255,255,0.16)",
                        background:
                          checkoutPayment ===
                            "cash"
                            ? "rgba(255,35,45,0.12)"
                            : "transparent",
                        color: "#fff",
                        cursor:
                          "pointer",
                        fontSize:
                          "12px",
                        letterSpacing:
                          "0.08em",
                      }}
                    >
                      НАЛИЧНЫМИ
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "22px 1fr",
                    gap: "10px",
                    alignItems: "flex-start",
                    marginTop: "20px",
                    padding: "14px",
                    border:
                      "1px solid rgba(255,255,255,0.12)",
                    background:
                      "rgba(255,255,255,0.025)",
                  }}
                >
                  <input
                    id="personal-data-consent"
                    type="checkbox"
                    checked={personalDataConsent}
                    onChange={(event) => {
                      setPersonalDataConsent(
                        event.target.checked
                      );

                      setVerifiedFingerprint(null);
                      setVerifiedSummary(null);
                      setCheckoutMessage(null);
                    }}
                    style={{
                      width: "18px",
                      height: "18px",
                      margin: "2px 0 0",
                      cursor: "pointer",
                      accentColor: "#d71920",
                    }}
                  />

                  <label
                    htmlFor="personal-data-consent"
                    style={{
                      color:
                        "rgba(255,255,255,0.72)",
                      fontSize: "12px",
                      lineHeight: 1.55,
                      cursor: "pointer",
                    }}
                  >
                    Я даю согласие на обработку
                    персональных данных
                  </label>
                </div>

                {checkoutMessage && (
                  <div
                    style={{
                      marginTop:
                        "18px",
                      padding:
                        "12px 14px",
                      border:
                        "1px solid rgba(255,35,45,0.45)",
                      background:
                        "rgba(255,35,45,0.08)",
                      color: "#fff",
                      fontSize:
                        "13px",
                      lineHeight:
                        1.45,
                    }}
                  >
                    {
                      checkoutMessage
                    }
                  </div>
                )}
              </div>

              <div
                style={{
                  padding:
                    "18px 22px 22px",
                  borderTop:
                    "1px solid rgba(255,255,255,0.10)",
                  background:
                    "#090909",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "space-between",
                    gap: "20px",
                    marginBottom:
                      "16px",
                  }}
                >
                  <span
                    style={{
                      color:
                        "rgba(255,255,255,0.55)",
                      fontSize:
                        "12px",
                      letterSpacing:
                        "0.08em",
                    }}
                  >
                    ИТОГО ·{" "}
                    {createdOrder &&
                      verifiedSummary
                      ? verifiedSummary.itemCount
                      : cartCount}{" "}
                    ПОЗ.
                  </span>

                  <strong
                    style={{
                      color: "#fff",
                      fontSize:
                        "24px",
                      fontWeight:
                        500,
                    }}
                  >
                    {formatPrice(
                      createdOrder &&
                        verifiedSummary
                        ? verifiedSummary.total
                        : cartTotal
                    )}
                  </strong>
                </div>

                {createdOrder ? (
                  <div
                    style={{
                      padding:
                        "16px",
                      border:
                        "1px solid rgba(90,220,130,0.55)",
                      background:
                        "rgba(90,220,130,0.08)",
                      color: "#fff",
                    }}
                  >
                    <strong
                      style={{
                        display:
                          "block",
                        marginBottom:
                          "7px",
                        fontSize:
                          "14px",
                      }}
                    >
                      ЗАКАЗ УСПЕШНО ОФОРМЛЕН
                    </strong>

                    <span
                      style={{
                        display:
                          "block",
                        color:
                          "rgba(255,255,255,0.68)",
                        fontSize:
                          "12px",
                        lineHeight:
                          1.5,
                      }}
                    >
                      {createdOrder.orderDisplayNumber
                        ? `Номер заказа: ${createdOrder.orderDisplayNumber}. `
                        : createdOrder.invoiceNumber
                          ? `Номер заказа: ${createdOrder.invoiceNumber}. `
                          : ""}
                      {createdOrder.expectedTimeMessage ??
                        "Мы получили ваш заказ и передали его в работу."}
                    </span>
                  </div>
                ) : verifiedFingerprint ===
                  checkoutFingerprint &&
                  verifiedSummary ? (
                  <button
                    type="button"
                    onClick={
                      createOrder
                    }
                    disabled={
                      checkoutCreating
                    }
                    style={{
                      width:
                        "100%",
                      minHeight:
                        "56px",
                      border:
                        "1px solid rgba(255,35,45,1)",
                      background:
                        checkoutCreating
                          ? "rgba(255,255,255,0.05)"
                          : "#d71920",
                      color:
                        checkoutCreating
                          ? "rgba(255,255,255,0.5)"
                          : "#fff",
                      cursor:
                        checkoutCreating
                          ? "wait"
                          : "pointer",
                      fontSize:
                        "12px",
                      fontWeight:
                        600,
                      letterSpacing:
                        "0.1em",
                    }}
                  >
                    {checkoutCreating
                      ? "ОФОРМЛЯЕМ ЗАКАЗ..."
                      : `ОФОРМИТЬ ЗАКАЗ · ${formatPrice(
                        verifiedSummary.total
                      )}`}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={
                      validateCheckout
                    }
                    disabled={
                      checkoutChecking ||
                      checkoutCreating ||
                      !personalDataConsent
                    }
                    style={{
                      width:
                        "100%",
                      minHeight:
                        "54px",
                      border:
                        "1px solid rgba(255,35,45,0.85)",
                      background:
                        checkoutChecking ||
                          !personalDataConsent
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(255,35,45,0.14)",
                      color:
                        checkoutChecking ||
                          !personalDataConsent
                          ? "rgba(255,255,255,0.38)"
                          : "#fff",
                      cursor:
                        checkoutChecking
                          ? "wait"
                          : !personalDataConsent
                            ? "not-allowed"
                            : "pointer",
                      fontSize:
                        "12px",
                      letterSpacing:
                        "0.1em",
                    }}
                  >
                    {checkoutChecking
                      ? "ПРОВЕРЯЕМ ДАННЫЕ..."
                      : "ПРОДОЛЖИТЬ"}
                  </button>
                )}
              </div>
            </aside>
                    </>
        )}
      </main>
    );
}

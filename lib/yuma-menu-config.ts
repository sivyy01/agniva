export const YUMA_STORE_IDS = {
  AGNIVA: "7ffd5a8f-1d7a-4537-b55f-bdfd3f8d0287",
} as const;

/*
 * Корневые категории основного меню заведения.
 */
export const YUMA_VENUE_ROOT_CATEGORY_IDS = {
  BAR: "01c6a9ff-94dc-4def-c0bf-47c9656739da",
  KITCHEN: "c049a6cd-4a95-4ffc-ef99-e378b7666a8a",
  HOOKAH: "47a9373e-de06-4dfa-c830-7d8515a14dcd",
} as const;

/*
 * Корневая ветка доставки.
 */
export const YUMA_DELIVERY_ROOT_CATEGORY_ID =
  "ae165a49-3f6a-4d8e-fe2f-b06b8a75e561";

/*
 * Служебные категории внутри ветки доставки.
 *
 * Они остаются в Yuma и могут понадобиться
 * нам позднее при сборке заказа / checkout,
 * но НЕ должны отображаться как категории
 * товаров на витрине /delivery.
 */
export const YUMA_DELIVERY_SERVICE_CATEGORY_IDS = {
  /*
   * Внутренние позиции роллов,
   * используемые для наборов.
   */
  ROLLS_FOR_SETS:
    "e2898553-9e8e-4950-a313-bedf601c023e",

  /*
   * Внутренние компоненты ВОК:
   * лапша, рис, спагетти и т.п.
   */
  WOK_GARNISH:
    "b6c684d1-621f-4933-b018-7e7070c930b3",

  /*
   * Районы / тарифы доставки:
   * Центральный, Абашево, Ильинка и т.д.
   *
   * Это не товары.
   */
  DELIVERY_ZONES:
    "d062a9fd-22a2-41ed-9792-4bee87a07799",
} as const;

export const YUMA_HIDDEN_FROM_DELIVERY_CATEGORY_IDS = [
  YUMA_DELIVERY_SERVICE_CATEGORY_IDS.ROLLS_FOR_SETS,
  YUMA_DELIVERY_SERVICE_CATEGORY_IDS.WOK_GARNISH,
  YUMA_DELIVERY_SERVICE_CATEGORY_IDS.DELIVERY_ZONES,
] as const;

/*
 * Отдельное QR-меню для гостей Гинзы.
 *
 * Эта категория:
 * - НЕ должна попадать в /menu
 * - НЕ должна попадать в /delivery
 * - будет доступна только через QR-страницу
 *
 * В дальнейшем сюда можно добавить
 * новые категории, например коктейли Гинзы.
 */
export const YUMA_GINZA_CATEGORY_IDS = [
  "469babbc-1396-4bf8-c986-c7e84c9406d9",
] as const;

/*
 * Категории, которые никогда не должны
 * автоматически попадать в основное
 * публичное меню Агнивы.
 */
export const YUMA_HIDDEN_FROM_VENUE_CATEGORY_IDS = [
  ...YUMA_GINZA_CATEGORY_IDS,
] as const;

/*
 * Глобально скрытые служебные категории.
 *
 * Сюда добавляем только то, что вообще
 * не должно использоваться публичными
 * профилями.
 *
 * Специально НЕ добавляем сюда технические
 * категории доставки, потому что позже
 * можем использовать их при checkout.
 */
export const YUMA_HIDDEN_CATEGORY_IDS: readonly string[] = [];

/*
 * Конкретные позиции, которые нужно
 * скрывать независимо от категории.
 */
export const YUMA_HIDDEN_ITEM_IDS: readonly string[] = [
  // Техническая тестовая позиция "бутылка тест" — 1 ₽
  "291fa46d-520c-4c0f-9c74-90451a9e4e62",
];

/*
 * Профили публикации.
 */
export const YUMA_MENU_PROFILES = {
  venue: {
    storeId: YUMA_STORE_IDS.AGNIVA,

    rootCategoryIds: [
      YUMA_VENUE_ROOT_CATEGORY_IDS.KITCHEN,
      YUMA_VENUE_ROOT_CATEGORY_IDS.BAR,
      YUMA_VENUE_ROOT_CATEGORY_IDS.HOOKAH,
    ],

    excludeCategoryIds: [
      ...YUMA_HIDDEN_FROM_VENUE_CATEGORY_IDS,
      ...YUMA_HIDDEN_CATEGORY_IDS,
    ],

    excludeItemIds: [
      ...YUMA_HIDDEN_ITEM_IDS,
    ],
  },

  delivery: {
    storeId: YUMA_STORE_IDS.AGNIVA,

    rootCategoryIds: [
      YUMA_DELIVERY_ROOT_CATEGORY_ID,
    ],

    excludeCategoryIds: [
      ...YUMA_GINZA_CATEGORY_IDS,

      /*
       * Не показываем служебные категории
       * в каталоге доставки.
       */
      ...YUMA_HIDDEN_FROM_DELIVERY_CATEGORY_IDS,

      ...YUMA_HIDDEN_CATEGORY_IDS,
    ],

    excludeItemIds: [
      ...YUMA_HIDDEN_ITEM_IDS,
    ],
  },

  ginza: {
    storeId: YUMA_STORE_IDS.AGNIVA,

    allowedCategoryIds: [
      ...YUMA_GINZA_CATEGORY_IDS,
    ],

    excludeItemIds: [
      ...YUMA_HIDDEN_ITEM_IDS,
    ],
  },
} as const;
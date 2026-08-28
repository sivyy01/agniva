const YUMA_API_BASE_URL =
  process.env.YUMA_API_BASE_URL;

const YUMA_OPEN_API_USERNAME =
  process.env.YUMA_OPEN_API_USERNAME;

const YUMA_OPEN_API_PASSWORD =
  process.env.YUMA_OPEN_API_PASSWORD;

function getYumaConfig() {
  if (!YUMA_API_BASE_URL) {
    throw new Error(
      "YUMA_API_BASE_URL is not configured"
    );
  }

  if (!YUMA_OPEN_API_USERNAME) {
    throw new Error(
      "YUMA_OPEN_API_USERNAME is not configured"
    );
  }

  if (!YUMA_OPEN_API_PASSWORD) {
    throw new Error(
      "YUMA_OPEN_API_PASSWORD is not configured"
    );
  }

  return {
    baseUrl:
      YUMA_API_BASE_URL.replace(
        /\/$/,
        ""
      ),

    username:
      YUMA_OPEN_API_USERNAME,

    password:
      YUMA_OPEN_API_PASSWORD,
  };
}

export async function yumaFetch(
  path: string,
  init: RequestInit = {}
) {
  const {
    baseUrl,
    username,
    password,
  } = getYumaConfig();

  const normalizedPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  const auth = Buffer.from(
    `${username}:${password}`
  ).toString("base64");

  const response = await fetch(
    `${baseUrl}${normalizedPath}`,
    {
      ...init,

      headers: {
        Accept: "application/json",

        Authorization:
          `Basic ${auth}`,

        ...init.headers,
      },

      cache: "no-store",
    }
  );

  return response;
}
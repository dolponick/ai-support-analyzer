export type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

export type ApiErrorContext = "load" | "create" | "analyze";

export class SafeApiError extends Error {}

export function getSafeApiErrorMessage(
  status: number,
  payload: ApiErrorPayload | null,
  context: ApiErrorContext,
) {
  switch (payload?.error?.code) {
    case "AI_RATE_LIMITED":
      return "Забагато запитів до AI. Спробуйте трохи пізніше.";
    case "AI_CONFIGURATION_ERROR":
    case "AI_ERROR":
    case "AI_INVALID_RESPONSE":
      return "Не вдалося виконати AI-аналіз. Спробуйте ще раз.";
    case "REQUEST_NOT_FOUND":
    case "NOT_FOUND":
      return "Звернення не знайдено.";
    case "VALIDATION_ERROR":
      return context === "create"
        ? "Перевірте імʼя клієнта та текст звернення."
        : "Не вдалося виконати AI-аналіз. Перевірте звернення.";
    case "DATABASE_ERROR":
      return context === "load"
        ? "Не вдалося завантажити звернення. Спробуйте ще раз."
        : context === "create"
          ? "Не вдалося зберегти звернення. Спробуйте ще раз."
          : "Не вдалося зберегти результат аналізу. Спробуйте ще раз.";
  }

  if (status === 429) {
    return "Забагато запитів до AI. Спробуйте трохи пізніше.";
  }

  if (status === 502) {
    return "Не вдалося виконати AI-аналіз. Спробуйте ще раз.";
  }

  if (status >= 500) {
    return context === "load"
      ? "Не вдалося завантажити звернення. Спробуйте ще раз."
      : context === "create"
        ? "Не вдалося зберегти звернення. Спробуйте ще раз."
        : "Не вдалося виконати AI-аналіз. Спробуйте ще раз.";
  }

  if (status === 404) {
    return context === "analyze"
      ? "Звернення не знайдено."
      : "Не вдалося знайти потрібні дані.";
  }

  return context === "load"
    ? "Не вдалося завантажити звернення. Спробуйте ще раз."
    : context === "create"
      ? "Не вдалося зберегти звернення. Спробуйте ще раз."
      : "Не вдалося виконати AI-аналіз. Спробуйте ще раз.";
}

export function getNetworkErrorMessage() {
  return "Не вдалося зʼєднатися із сервером. Спробуйте ще раз.";
}

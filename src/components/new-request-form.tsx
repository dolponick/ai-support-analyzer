"use client";

import { useState, type FormEvent } from "react";
import {
  getNetworkErrorMessage,
  getSafeApiErrorMessage,
  SafeApiError,
  type ApiErrorPayload,
} from "@/lib/client-api-errors";
import type { SupportRequest } from "@/lib/types";

type NewRequestFormProps = {
  onCreated: (request: SupportRequest) => void;
};

export function NewRequestForm({ onCreated }: NewRequestFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const trimmedName = customerName.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedMessage) {
      setError("Вкажіть імʼя клієнта та текст звернення.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: trimmedName,
          message: trimmedMessage,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | ({ request?: SupportRequest } & ApiErrorPayload)
        | null;

      if (!response.ok) {
        throw new SafeApiError(
          getSafeApiErrorMessage(response.status, payload, "create"),
        );
      }

      const createdRequest = payload?.request;

      if (!createdRequest) {
        throw new SafeApiError("Сервер не повернув створене звернення.");
      }

      setCustomerName("");
      setMessage("");
      onCreated(createdRequest);
    } catch (submitError) {
      setError(
        submitError instanceof SafeApiError
          ? submitError.message
          : getNetworkErrorMessage(),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      aria-busy={isSubmitting}
      className="space-y-5"
      onSubmit={handleSubmit}
      noValidate
    >
      <div>
        <label
          className="block text-sm font-semibold text-[#26332d]"
          htmlFor="customer-name"
        >
          Імʼя клієнта
        </label>
        <input
          className="mt-2 block min-h-12 w-full rounded-xl border border-[#cbd5cc] bg-[#fcfdfb] px-4 text-base text-[#17231f] outline-none transition-colors placeholder:text-[#8a968f] focus-visible:border-[#e3735b] focus-visible:ring-4 focus-visible:ring-[#e3735b]/15 disabled:cursor-not-allowed disabled:bg-[#eef1ed]"
          disabled={isSubmitting}
          id="customer-name"
          name="customerName"
          autoComplete="name"
          onChange={(event) => setCustomerName(event.target.value)}
          placeholder="Наприклад, Іван…"
          required
          type="text"
          value={customerName}
          aria-describedby={error ? "new-request-error" : undefined}
          aria-invalid={Boolean(error)}
        />
      </div>

      <div>
        <label
          className="block text-sm font-semibold text-[#26332d]"
          htmlFor="request-message"
        >
          Текст звернення
        </label>
        <textarea
          className="mt-2 block min-h-36 w-full resize-y rounded-xl border border-[#cbd5cc] bg-[#fcfdfb] px-4 py-3 text-base leading-6 text-[#17231f] outline-none transition-colors placeholder:text-[#8a968f] focus-visible:border-[#e3735b] focus-visible:ring-4 focus-visible:ring-[#e3735b]/15 disabled:cursor-not-allowed disabled:bg-[#eef1ed]"
          disabled={isSubmitting}
          id="request-message"
          name="message"
          autoComplete="off"
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Опишіть питання або проблему клієнта…"
          required
          value={message}
          aria-describedby={error ? "new-request-error" : undefined}
          aria-invalid={Boolean(error)}
        />
      </div>

      {error ? (
        <p
          aria-live="polite"
          className="rounded-xl border border-[#e9b5aa] bg-[#fff3f0] px-4 py-3 text-sm leading-6 text-[#9b3e2d]"
          id="new-request-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#e3735b] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(227,115,91,0.2)] transition-colors hover:bg-[#d7644d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#e3735b]/25 disabled:cursor-not-allowed disabled:bg-[#b7c0ba] disabled:shadow-none sm:w-auto"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Зберігаємо…" : "Додати звернення"}
      </button>
    </form>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NewRequestForm } from "@/components/new-request-form";
import { RequestCard } from "@/components/request-card";
import {
  getNetworkErrorMessage,
  getSafeApiErrorMessage,
  SafeApiError,
  type ApiErrorPayload,
} from "@/lib/client-api-errors";
import type { SupportRequest } from "@/lib/types";

type RequestsResponse = {
  requests?: SupportRequest[];
} & ApiErrorPayload;

export function RequestList() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const analyzingIdsRef = useRef<Set<string>>(new Set());
  const [analysisErrors, setAnalysisErrors] = useState<Record<string, string>>(
    {},
  );

  const fetchRequests = useCallback(async () => {
    const response = await fetch("/api/requests", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as
      | RequestsResponse
      | null;

    if (!response.ok) {
      throw new SafeApiError(
        getSafeApiErrorMessage(response.status, payload, "load"),
      );
    }

    return payload?.requests ?? [];
  }, []);

  useEffect(() => {
    let isCurrent = true;

    void fetchRequests()
      .then((loadedRequests) => {
        if (!isCurrent) {
          return;
        }

        setRequests(loadedRequests);
      })
      .catch(() => {
        if (!isCurrent) {
          return;
        }

        setLoadError(
          "Не вдалося завантажити звернення. Спробуйте оновити сторінку.",
        );
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [fetchRequests]);

  function handleCreated(request: SupportRequest) {
    setAnalysisErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[request.id];
      return nextErrors;
    });
    setRequests((currentRequests) => [
      request,
      ...currentRequests.filter((current) => current.id !== request.id),
    ]);
  }

  async function handleAnalyze(requestId: string) {
    if (analyzingIdsRef.current.has(requestId)) {
      return;
    }

    analyzingIdsRef.current.add(requestId);
    setAnalyzingIds((currentIds) => new Set(currentIds).add(requestId));
    setAnalysisErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[requestId];
      return nextErrors;
    });

    try {
      const response = await fetch(`/api/requests/${requestId}/analyze`, {
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as {
        request?: SupportRequest;
      } & ApiErrorPayload;

      if (!response.ok || !payload?.request) {
        throw new SafeApiError(
          getSafeApiErrorMessage(response.status, payload, "analyze"),
        );
      }

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === requestId ? payload.request! : request,
        ),
      );
    } catch (error) {
      setAnalysisErrors((currentErrors) => ({
        ...currentErrors,
        [requestId]:
          error instanceof SafeApiError
            ? error.message
            : getNetworkErrorMessage(),
      }));
    } finally {
      analyzingIdsRef.current.delete(requestId);
      setAnalyzingIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(requestId);
        return nextIds;
      });
    }
  }

  return (
    <div className="mt-8 space-y-12 sm:mt-10 sm:space-y-16">
      <section
        aria-labelledby="new-request-heading"
        className="rounded-3xl border border-[#d8e0d9] bg-white p-5 shadow-[0_14px_36px_rgba(37,55,43,0.06)] sm:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e3735b]">
              Нове звернення
            </p>
            <h2
              className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#17231f] sm:text-3xl"
              id="new-request-heading"
            >
              Додайте запит у чергу
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#68766e] sm:text-base">
              Збережіть звернення, щоб команда могла повернутися до нього та
              опрацювати далі.
            </p>
            <div className="mt-8 border-l-2 border-[#e3735b] pl-4 text-sm leading-6 text-[#68766e]">
              Поля перевіряються сервером перед збереженням.
            </div>
          </div>
          <NewRequestForm onCreated={handleCreated} />
        </div>
      </section>

      <section aria-labelledby="requests-heading">
        <div className="flex flex-col gap-2 border-b border-[#d9dfd9] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a877f]">
              Журнал підтримки
            </p>
            <h2
              className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#17231f] sm:text-3xl"
              id="requests-heading"
            >
              Звернення
            </h2>
          </div>
          <p className="text-sm text-[#7a877f]">
            Нові записи відображаються першими
          </p>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div
              aria-live="polite"
              className="rounded-2xl border border-dashed border-[#cbd5cc] bg-white px-5 py-8 text-center text-sm text-[#68766e]"
              role="status"
            >
              Завантажуємо звернення…
            </div>
          ) : loadError ? (
            <div
              aria-live="assertive"
              className="rounded-2xl border border-[#e9b5aa] bg-[#fff3f0] px-5 py-6 text-sm text-[#9b3e2d]"
              role="alert"
            >
              <p>{loadError}</p>
              <button
                className="mt-4 rounded-lg border border-[#d98d7d] px-3 py-2 font-semibold text-[#9b3e2d] transition-colors hover:bg-[#ffe6e0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#e3735b]/20"
                onClick={() => {
                  setIsLoading(true);
                  setLoadError(null);
                  void fetchRequests()
                    .then((loadedRequests) => {
                      setRequests(loadedRequests);
                      setAnalysisErrors({});
                    })
                    .catch(() => {
                      setLoadError(
                        "Не вдалося завантажити звернення. Спробуйте оновити сторінку.",
                      );
                    })
                    .finally(() => setIsLoading(false));
                }}
                type="button"
              >
                Спробувати ще раз
              </button>
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cbd5cc] bg-white px-5 py-10 text-center">
              <p className="text-base font-medium text-[#435149]">
                Звернень поки немає.
              </p>
              <p className="mt-2 text-sm text-[#7a877f]">
                Перше звернення зʼявиться тут після збереження.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  isAnalyzing={analyzingIds.has(request.id)}
                  analysisError={analysisErrors[request.id] ?? null}
                  onAnalyze={handleAnalyze}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

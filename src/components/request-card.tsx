import type { Priority, SupportRequest } from "@/lib/types";

type RequestCardProps = {
  request: SupportRequest;
  isAnalyzing: boolean;
  analysisError: string | null;
  onAnalyze: (requestId: string) => void;
};

function formatCreatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Дата невідома";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function priorityClass(priority: Priority | null) {
  switch (priority) {
    case "високий":
      return "bg-[#fff0ec] text-[#9b3e2d]";
    case "середній":
      return "bg-[#f7f2e9] text-[#765d32]";
    case "низький":
      return "bg-[#eef1ed] text-[#526257]";
    default:
      return "bg-[#eef1ed] text-[#526257]";
  }
}

export function RequestCard({
  request,
  isAnalyzing,
  analysisError,
  onAnalyze,
}: RequestCardProps) {
  const hasAnalysis = Boolean(
    request.priority &&
      request.category &&
      request.summary &&
      request.draft_reply,
  );

  return (
    <article className="relative overflow-hidden rounded-2xl border border-[#d8e0d9] bg-white p-5 shadow-[0_8px_24px_rgba(37,55,43,0.05)] sm:p-6">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-[#dfe9df]"
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="break-words text-lg font-semibold tracking-[-0.02em] text-[#17231f]">
            {request.customer_name}
          </h3>
          <time
            className="mt-1 block text-xs font-medium uppercase tracking-[0.1em] text-[#7a877f]"
            dateTime={request.created_at}
          >
            {formatCreatedAt(request.created_at)}
          </time>
        </div>
        <span className="inline-flex w-fit shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7a877f]">
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${hasAnalysis ? "bg-[#65a66c]" : "bg-[#d6dfd7]"}`}
          />
          {hasAnalysis ? "Проаналізовано" : "Очікує аналізу"}
        </span>
      </div>

      <p className="mt-5 whitespace-pre-wrap break-words text-[15px] leading-7 text-[#435149]">
        {request.message}
      </p>

      {hasAnalysis ? (
        <div className="mt-6 border-t border-[#edf0ec] pt-5">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span
              className={`rounded-md px-2.5 py-1 font-semibold ${priorityClass(request.priority)}`}
            >
              Пріоритет: {request.priority}
            </span>
            <span className="rounded-md bg-[#f7f2e9] px-2.5 py-1 font-semibold text-[#765d32]">
              Категорія: {request.category}
            </span>
          </div>
          <dl className="mt-5 grid gap-4 text-sm leading-6 text-[#435149]">
            <div>
              <dt className="font-semibold text-[#17231f]">Короткий підсумок</dt>
              <dd className="mt-1">{request.summary}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#17231f]">Чернетка відповіді</dt>
              <dd className="mt-1 whitespace-pre-wrap">{request.draft_reply}</dd>
            </div>
            {request.analyzed_at ? (
              <p className="text-xs text-[#7a877f]">
                Проаналізовано: {formatCreatedAt(request.analyzed_at)}
              </p>
            ) : null}
          </dl>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 border-t border-[#edf0ec] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#7a877f]">
            {hasAnalysis
              ? "Результат збережено в Supabase."
              : "Оцініть пріоритет і категорію звернення за допомогою AI."}
          </p>
          {analysisError ? (
            <p
              className="mt-2 text-sm font-medium text-[#9b3e2d]"
              id={`analysis-error-${request.id}`}
              role="alert"
            >
              {analysisError}
            </p>
          ) : null}
        </div>
        <button
          className="min-h-10 shrink-0 rounded-lg border border-[#b8c9bb] px-3 text-sm font-semibold text-[#31653a] transition-colors hover:bg-[#eef6ed] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#65a66c]/20 disabled:cursor-wait disabled:opacity-60"
          disabled={isAnalyzing}
          aria-busy={isAnalyzing}
          aria-describedby={analysisError ? `analysis-error-${request.id}` : undefined}
          onClick={() => onAnalyze(request.id)}
          type="button"
        >
          {isAnalyzing
            ? "Аналізуємо…"
            : analysisError
              ? "Спробувати ще раз"
              : hasAnalysis
                ? "Аналізувати повторно"
                : "Аналізувати (AI)"}
        </button>
      </div>
    </article>
  );
}

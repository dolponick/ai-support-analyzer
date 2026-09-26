import { RequestList } from "@/components/request-list";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#17231f]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <header className="border-b border-[#d9dfd9] pb-8 sm:pb-10">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#68766e]">
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-[3px] bg-[#e3735b] shadow-[4px_4px_0_#c8d7ca]"
            />
            <span>Внутрішній інструмент підтримки</span>
          </div>
          <div className="mt-8 max-w-3xl">
            <p className="text-sm font-medium text-[#e3735b]">Черга звернень</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#17231f] sm:text-5xl lg:text-6xl">
              AI-обробка звернень
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5f6c65] sm:text-lg">
              Внутрішній інструмент для роботи зі зверненнями клієнтів.
            </p>
          </div>
        </header>

        <RequestList />
      </div>
    </main>
  );
}

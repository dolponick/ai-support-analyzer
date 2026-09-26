import { CreateRequestSchema } from "@/lib/schemas";
import { getSupabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_JSON"
  | "DATABASE_ERROR"
  | "INTERNAL_ERROR";

function errorResponse(
  status: number,
  code: ErrorCode,
  message: string,
): Response {
  return Response.json(
    {
      error: {
        code,
        message,
      },
    },
    { status },
  );
}

function logServerError(operation: string, error: unknown) {
  const details = error instanceof Error ? error.message : "Unknown error";
  console.error(`${operation}: ${details}`);
}

export async function GET() {
  try {
    const { data, error } = await getSupabaseServer()
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logServerError("GET /api/requests database error", error);
      return errorResponse(
        500,
        "DATABASE_ERROR",
        "Не вдалося завантажити звернення.",
      );
    }

    return Response.json({ requests: data ?? [] });
  } catch (error) {
    logServerError("GET /api/requests internal error", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Не вдалося обробити запит.",
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(
      400,
      "INVALID_JSON",
      "Тіло запиту має містити коректний JSON.",
    );
  }

  const parsed = CreateRequestSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      400,
      "VALIDATION_ERROR",
      "Імʼя клієнта та текст звернення мають бути заповнені й відповідати обмеженням довжини.",
    );
  }

  try {
    const { data, error } = await getSupabaseServer()
      .from("requests")
      .insert({
        customer_name: parsed.data.customerName,
        message: parsed.data.message,
      })
      .select("*")
      .single();

    if (error) {
      logServerError("POST /api/requests database error", error);
      return errorResponse(
        500,
        "DATABASE_ERROR",
        "Не вдалося зберегти звернення.",
      );
    }

    return Response.json({ request: data }, { status: 201 });
  } catch (error) {
    logServerError("POST /api/requests internal error", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Не вдалося обробити запит.",
    );
  }
}

export async function POST(_req: Request) {
  return Response.json({ ok: true });
}

export async function GET() {
  return Response.json({ status: "webhook alive" });
}



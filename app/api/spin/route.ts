const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: CORS });
}

const PRIZES = [
  { name: 'Giảm 10%',  weight: 50 },
  { name: 'Giảm 20%',  weight: 30 },
  { name: 'Tẩy Trắng', weight: 15 },
  { name: 'May Mắn',   weight: 5  },
];

function weightedRandom(): string {
  const total = PRIZES.reduce((s, p) => s + p.weight, 0);
  let rand = Math.random() * total;
  for (const p of PRIZES) {
    if (rand < p.weight) return p.name;
    rand -= p.weight;
  }
  return PRIZES[PRIZES.length - 1].name;
}

async function sendToSheet(payload: {
  name: string; phone: string; branch: string; result: string;
}) {
  const sheetUrl = process.env.SHEET_API;
  if (!sheetUrl) return;

  const body = JSON.stringify({
    name:   payload.name,
    phone:  payload.phone,
    branch: payload.branch,
    result: payload.result,
    time:   new Date().toISOString(),
  });

  try {
    // Bước 1: Gửi POST – nhưng KHÔNG follow redirect tự động
    // vì HTTP spec chuyển POST→GET khi gặp 302 (mất body)
    const r1 = await fetch(sheetUrl, {
      method:   'POST',
      redirect: 'manual',
      headers:  { 'Content-Type': 'application/json' },
      body,
    });

    // Bước 2: Tự follow redirect (giữ nguyên POST + body)
    const location = r1.headers.get('location');
    const target   = location ?? sheetUrl;
    const r2 = await fetch(target, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const text = await r2.text();
    console.log('[Sheet] response:', text);
  } catch (err) {
    console.error('[Sheet] fetch failed:', err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, branch } = body as Record<string, string>;

    if (!name || !phone || !branch) {
      return Response.json({ error: 'Thiếu thông tin' }, { status: 400, headers: CORS });
    }

    const result = weightedRandom();

    // Fire-and-forget to Google Sheets
    void sendToSheet({ name, phone, branch, result });

    return Response.json({ status: 'ok', result }, { status: 200, headers: CORS });

  } catch {
    return Response.json({ error: 'Server error' }, { status: 500, headers: CORS });
  }
}
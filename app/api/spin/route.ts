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

/**
 * Gửi dữ liệu lên Google Apps Script Web App.
 * Trả về: 'ok' | 'exists' | 'error'
 */
async function sendToSheet(payload: {
  name: string; phone: string; branch: string; result: string;
}): Promise<'ok' | 'exists' | 'error'> {
  const sheetUrl = process.env.SHEET_API;
  if (!sheetUrl) {
    console.error('[Sheet] SHEET_API chưa được cấu hình trong .env.local');
    return 'error';
  }

  try {
    const res = await fetch(sheetUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:   payload.name,
        phone:  payload.phone,
        branch: payload.branch,
        result: payload.result,
      }),
    });

    const text = await res.text();
    console.log('[Sheet] response:', text);

    const json = JSON.parse(text) as { status: string };
    if (json.status === 'exists') return 'exists';
    if (json.status === 'ok')     return 'ok';
    return 'error';

  } catch (err) {
    console.error('[Sheet] fetch failed:', err);
    return 'error';
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

    const sheetStatus = await sendToSheet({ name, phone, branch, result });

    if (sheetStatus === 'exists') {
      return Response.json(
        { error: 'Số điện thoại này đã tham gia rồi!' },
        { status: 409, headers: CORS },
      );
    }

    return Response.json({ status: 'ok', result }, { status: 200, headers: CORS });

  } catch {
    return Response.json({ error: 'Server error' }, { status: 500, headers: CORS });
  }
}
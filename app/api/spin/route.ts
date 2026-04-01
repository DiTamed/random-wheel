const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, branch } = body;

    if (!name || !phone || !branch) {
      return new Response(
        JSON.stringify({ error: "Thiếu thông tin" }),
        { status: 400, headers }
      );
    }

    const prizes = [
      { name: "10%", weight: 50 },
      { name: "20%", weight: 30 },
      { name: "Tẩy trắng", weight: 15 },
      { name: "Chúc bạn may mắn", weight: 5 },
    ];

    function weightedRandom() {
      const total = prizes.reduce((s, p) => s + p.weight, 0);
      let rand = Math.random() * total;

      for (const p of prizes) {
        if (rand < p.weight) return p.name;
        rand -= p.weight;
      }
    }

    const result = weightedRandom();

    return new Response(
      JSON.stringify({
        status: "ok",
        result,
      }),
      { status: 200, headers }
    );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers }
    );
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, branch } = body;

    if (!name || !phone || !branch) {
      return Response.json(
        { error: "Thiếu thông tin" },
        { status: 400 }
      );
    }

    // 🎯 danh sách quà
    const prizes = [
      { name: "10%", weight: 50 },
      { name: "20%", weight: 30 },
      { name: "Tẩy trắng", weight: 15 },
      { name: "Chúc bạn may mắn", weight: 5 },
    ];

    // 🎯 random có trọng số
    function weightedRandom() {
      const total = prizes.reduce((sum, p) => sum + p.weight, 0);
      let rand = Math.random() * total;

      for (const p of prizes) {
        if (rand < p.weight) return p.name;
        rand -= p.weight;
      }
    }

    const result = weightedRandom();

    // 👉 gửi sang Google Sheet
    const sheetRes = await fetch(process.env.SHEET_API!, {
      method: "POST",
      body: JSON.stringify({
        name,
        phone,
        branch,
        result,
      }),
    });

    const sheetData = await sheetRes.json();

    // ❌ đã quay
    if (sheetData.status === "exists") {
      return Response.json({
        status: "exists",
        message: "Bạn đã quay rồi",
      });
    }

    // ✅ OK
    return Response.json({
      status: "ok",
      result,
    });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
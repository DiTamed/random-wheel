import type { NextApiRequest, NextApiResponse } from "next";

const prizes = [
  { name: "10%", weight: 50 },
  { name: "20%", weight: 30 },
  { name: "Tẩy trắng", weight: 15 },
  { name: "Chúc bạn may mắn", weight: 5 },
];

function weightedRandom() {
  const total = prizes.reduce((sum, p) => sum + p.weight, 0);
  let rand = Math.random() * total;

  for (const p of prizes) {
    if (rand < p.weight) return p.name;
    rand -= p.weight;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name, phone, branch } = req.body;

  if (!name || !phone || !branch) {
    return res.status(400).json({ error: "Thiếu thông tin" });
  }

  const result = weightedRandom();

  const response = await fetch(process.env.SHEET_API!, {
    method: "POST",
    body: JSON.stringify({
      name,
      phone,
      branch,
      result,
    }),
  });

  const data = await response.json();

  if (data.status === "exists") {
    return res.status(200).json({
      status: "exists",
      message: "Bạn đã quay rồi",
    });
  }

  return res.status(200).json({
    status: "ok",
    result,
  });
}
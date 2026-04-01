"use client";

import { useRef, useEffect, useState, useCallback } from "react";

/* ─── Constants ──────────────────────────────────────────── */
const PRIZES = [
  { name: "Giảm 10%", color: "#FF6B6B", textColor: "#fff"},
  { name: "Giảm 20%", color: "#FFD93D", textColor: "#1a1a1a"},
  { name: "Tẩy Trắng", color: "#4ECDC4", textColor: "#fff" },
  { name: "May Mắn Lần Sau", color: "#C77DFF", textColor: "#fff" },
];

const BRANCHES = [
  "Chi Nhánh Biên Hòa 1 – Phạm Văn Thuận",
  "Chi Nhánh Biên Hòa 2 - Cách Mạng Tháng 8",
  "Chi Nhánh Thống Nhất",
  "Chi Nhánh Định Quán",
  "Chi Nhánh Bà Rịa - 75 Bạch Đằng",
];

const CONFETTI_COLORS = [
  "#FF6B6B",
  "#FFD93D",
  "#6BCB77",
  "#4D96FF",
  "#C77DFF",
  "#FF9F43",
  "#FF6EFF",
  "#fff",
];

function makeConfetti(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.8}s`,
    dur: `${2.2 + Math.random() * 1.8}s`,
    size: `${7 + Math.random() * 8}px`,
    borderRadius: Math.random() > 0.5 ? "50%" : "2px",
  }));
}

const CONFETTI_ITEMS = makeConfetti(70);

/* ─── Draw helpers ───────────────────────────────────────── */
function drawWheel(canvas: HTMLCanvasElement, rotation: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width,
    H = canvas.height;
  const cx = W / 2,
    cy = H / 2 + 18;
  const r = Math.min(W, H) / 2 - 30;
  const N = PRIZES.length;
  const seg = (2 * Math.PI) / N;

  ctx.clearRect(0, 0, W, H);

  // Outer glow
  const gGrad = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r + 20);
  gGrad.addColorStop(0, "rgba(255,215,0,0.25)");
  gGrad.addColorStop(1, "transparent");
  ctx.beginPath();
  ctx.arc(cx, cy, r + 18, 0, Math.PI * 2);
  ctx.fillStyle = gGrad;
  ctx.fill();

  // Segments
  for (let i = 0; i < N; i++) {
    const s = rotation + i * seg;
    const e = s + seg;
    const mid = s + seg / 2;

    // Fill
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, s, e);
    ctx.closePath();
    ctx.fillStyle = PRIZES[i].color;
    ctx.fill();

    // Divider
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, s, e);
    ctx.closePath();
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(mid);
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 4;
    ctx.textAlign = "right";
    ctx.fillStyle = PRIZES[i].textColor;
    ctx.font = `bold ${Math.max(13, r * 0.1)}px Inter, Arial, sans-serif`;
    ctx.fillText(PRIZES[i].name, r - 14, 5);
    ctx.font = `${Math.max(15, r * 0.11)}px Arial`;
    ctx.restore();
  }

  // Gold border ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,215,0,0.95)";
  ctx.lineWidth = 5;
  ctx.stroke();

  // Center disc
  const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.14);
  cGrad.addColorStop(0, "#fff");
  cGrad.addColorStop(1, "#e0e0e0");
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.14, 0, Math.PI * 2);
  ctx.fillStyle = cGrad;
  ctx.fill();
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.055, 0, Math.PI * 2);
  ctx.fillStyle = "#FFD700";
  ctx.fill();

  // Pointer (triangle at top, pointing down)
  const px = cx,
    py = cy - r - 10,
    ps = 22;
  const pGrad = ctx.createLinearGradient(px, py - ps * 0.5, px, py + ps);
  pGrad.addColorStop(0, "#FFD700");
  pGrad.addColorStop(1, "#FF6B00");
  ctx.beginPath();
  ctx.moveTo(px, py + ps);
  ctx.lineTo(px - ps / 2, py);
  ctx.lineTo(px + ps / 2, py);
  ctx.closePath();
  ctx.fillStyle = pGrad;
  ctx.shadowColor = "rgba(255,140,0,0.9)";
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;
}

/* ─── Main Component ─────────────────────────────────────── */
export default function SpinWheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotRef = useRef(-Math.PI / 2 - Math.PI / PRIZES.length);
  const animRef = useRef<number>(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ prize: string; emoji: string } | null>(
    null,
  );
  const [modal, setModal] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [error, setError] = useState("");

  const redraw = useCallback(() => {
    if (canvasRef.current) drawWheel(canvasRef.current, rotRef.current);
  }, []);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const validate = () => {
    if (!name.trim()) return "Vui lòng nhập họ và tên!";
    if (!phone.trim()) return "Vui lòng nhập số điện thoại!";
    if (!/^(0|\+84)[0-9]{8,10}$/.test(phone.trim()))
      return "Số điện thoại không hợp lệ!";
    if (!branch) return "Vui lòng chọn chi nhánh!";
    return null;
  };

  const handleSpin = useCallback(async () => {
    if (spinning || loading) return;
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          branch,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi máy chủ");

      const wi = PRIZES.findIndex((p) => p.name === data.result);
      if (wi < 0) throw new Error("Kết quả không hợp lệ");

      setLoading(false);
      setSpinning(true);

      const N = PRIZES.length;
      const seg = (2 * Math.PI) / N;

      // Target: segment[wi] center aligned with top (−π/2)
      const targetBase = -Math.PI / 2 - (wi + 0.5) * seg;
      const targetNorm =
        ((targetBase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const curNorm =
        ((rotRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      let diff = targetNorm - curNorm;
      if (diff <= 0) diff += 2 * Math.PI;

      const startRot = rotRef.current;
      const endRot = startRot + 6 * 2 * Math.PI + diff;
      const dur = 5500;
      const t0 = performance.now();

      const animate = (now: number) => {
        const t = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        rotRef.current = startRot + (endRot - startRot) * eased;
        if (canvasRef.current) drawWheel(canvasRef.current, rotRef.current);
        if (t < 1) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          rotRef.current = endRot;
          if (canvasRef.current) drawWheel(canvasRef.current, endRot);
          setSpinning(false);
          setResult({ prize: PRIZES[wi].name, emoji: "" });
          setModal(true);
          setConfetti(true);
          setTimeout(() => setConfetti(false), 4200);
        }
      };
      animRef.current = requestAnimationFrame(animate);
    } catch (e) {
      setLoading(false);
      setSpinning(false);
      setError(
        e instanceof Error ? e.message : "Có lỗi xảy ra, vui lòng thử lại!",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, phone, branch, spinning, loading]);

  const handleClose = () => {
    setModal(false);
    setResult(null);
    setName("");
    setPhone("");
    setBranch("");
  };

  const isBusy = spinning || loading;

  return (
    <>
      {/* ── Background blobs ── */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden
      >
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            background:
              "radial-gradient(circle, rgba(124,58,237,0.18), transparent)",
            borderRadius: "50%",
            top: -150,
            left: -150,
            animation: "float 9s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle, rgba(29,78,216,0.18), transparent)",
            borderRadius: "50%",
            bottom: -120,
            right: -100,
            animation: "float 11s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* ── Confetti ── */}
      {confetti &&
        CONFETTI_ITEMS.map((c) => (
          <div
            key={c.id}
            className="confetti-piece"
            style={{
              left: c.left,
              width: c.size,
              height: c.size,
              backgroundColor: c.color,
              borderRadius: c.borderRadius,
              animationDuration: c.dur,
              animationDelay: c.delay,
            }}
          />
        ))}

      {/* ── Main layout ── */}
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
          gap: 32,
          position: "relative",
        }}
      >
        {/* Header */}
        <header className="animate-slide-up" style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 13,
              letterSpacing: 3,
              color: "rgba(255,215,0,0.7)",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Chương Trình Khuyến Mãi
          </div>
          <h1
            style={{
              fontSize: "clamp(28px,5vw,48px)",
              fontWeight: 900,
              lineHeight: 1.1,
              background: "linear-gradient(135deg, #FFD700, #FF8C00, #FFD700)",
              backgroundSize: "200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Vòng Quay May Mắn
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              marginTop: 8,
              fontSize: 15,
            }}
          >
            Nhập thông tin &amp; quay ngay để nhận ưu đãi!
          </p>
        </header>

        {/* Content Row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 32,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 900,
          }}
        >
          {/* Wheel */}
          <div
            className="animate-slide-up delay-100"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              className="wheel-halo animate-float"
              style={{ borderRadius: "50%" }}
            >
              <canvas
                ref={canvasRef}
                width={410}
                height={410}
                style={{ display: "block", maxWidth: "100%" }}
              />
            </div>
          </div>

          {/* Form */}
          <div
            className="glass animate-slide-up delay-200"
            style={{
              padding: 32,
              width: "100%",
              maxWidth: 380,
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 24,
                color: "#FFD700",
              }}
            >
              📋 Thông Tin Đăng Ký
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Name */}
              <div>
                <label
                  className="form-label"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    color: "rgba(255,255,255,0.6)",
                    textTransform: "uppercase",
                    marginBottom: 7,
                  }}
                >
                  Họ và Tên *
                </label>
                <input
                  id="field-name"
                  className="field-input"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isBusy}
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  className="form-label"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    color: "rgba(255,255,255,0.6)",
                    textTransform: "uppercase",
                    marginBottom: 7,
                  }}
                >
                  Số Điện Thoại *
                </label>
                <input
                  id="field-phone"
                  className="field-input"
                  type="tel"
                  placeholder="0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isBusy}
                />
              </div>

              {/* Branch */}
              <div>
                <label
                  className="form-label"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    color: "rgba(255,255,255,0.6)",
                    textTransform: "uppercase",
                    marginBottom: 7,
                  }}
                >
                  Chi Nhánh *
                </label>
                <select
                  id="field-branch"
                  className="field-select"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  disabled={isBusy}
                >
                  <option value="">-- Chọn chi nhánh --</option>
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error */}
              {error && (
                <div
                  style={{
                    background: "rgba(255,80,80,0.15)",
                    border: "1px solid rgba(255,80,80,0.4)",
                    color: "#ff8888",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 14,
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

              {/* Button */}
              <button
                id="btn-spin"
                className="btn-spin"
                onClick={handleSpin}
                disabled={isBusy}
              >
                {loading
                  ? "Đang xử lý..."
                  : spinning
                    ? " Đang quay..."
                    : " Quay Ngay!"}
              </button>
            </div>

            {/* Prizes legend */}
            <div
              style={{
                marginTop: 24,
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: 20,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: 12,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Phần thưởng
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PRIZES.map((p) => (
                  <div
                    key={p.name}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 3,
                        backgroundColor: p.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}
                    >
                   {p.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Result Modal ── */}
      {modal && result && (
        <div className="modal-overlay" onClick={handleClose}>
          <div
            className="glass animate-scale"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: "48px 40px",
              textAlign: "center",
              maxWidth: 420,
              width: "90%",
              position: "relative",
            }}
          >
            {/* Close */}
            <button
              onClick={handleClose}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                fontSize: 22,
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              ✕
            </button>

            {/* Emoji big */}
            <div
              style={{
                fontSize: 72,
                marginBottom: 12,
                animation: "star-pop 0.6s ease forwards",
              }}
            >
              {result.emoji}
            </div>

            <div
              style={{
                fontSize: 13,
                letterSpacing: 2,
                color: "rgba(255,215,0,0.7)",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
               Chúc Mừng!
            </div>

            <h2
              style={{
                fontSize: 32,
                fontWeight: 900,
                marginBottom: 6,
                background: "linear-gradient(135deg,#FFD700,#FF8C00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {result.prize}
            </h2>

            <p
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: 15,
                lineHeight: 1.6,
                marginTop: 12,
              }}
            >
              Bạn đã nhận được phần thưởng{" "}
              <strong style={{ color: "#FFD700" }}>{result.prize}</strong>.
              <br />
              Vui lòng liên hệ nhân viên chi nhánh để nhận thưởng.
            </p>

            {/* Stars */}
            <div
              style={{
                marginTop: 20,
                color: "#FFD700",
                fontSize: 26,
                letterSpacing: 4,
              }}
            >
              ★ ★ ★ ★ ★
            </div>

            <button
              id="btn-close-modal"
              className="btn-spin"
              onClick={handleClose}
              style={{ marginTop: 28 }}
            >
              Tuyệt Vời!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

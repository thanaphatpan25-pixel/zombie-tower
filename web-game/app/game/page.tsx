
"use client";

import dynamic from "next/dynamic";

const ZombieGame = dynamic(
  () => import("@/components/ZombieGame"),
  {
    ssr: false,
    loading: () => (
      <p style={{ textAlign: "center", color: "#94a3b8" }}>
        Loading game...
      </p>
    ),
  }
);

export default function GamePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080d16",
        color: "white",
        padding: "20px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#f87171",
          fontSize: "clamp(22px, 4vw, 36px)",
          fontWeight: "bold",
        }}
      >
        ZOMBIE TOWER: LAST ASCENT
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#cbd5e1",
          letterSpacing: "2px",
          marginBottom: "20px",
        }}
      >
        SURVIVE • CLIMB • ESCAPE
      </p>

      <ZombieGame />

      <p
        style={{
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "13px",
          marginTop: "16px",
        }}
      >
        ใช้ปุ่ม ← → เพื่อเดิน, Space เพื่อกระโดด และ J หรือ X เพื่อโจมตี
      </p>
    </main>
  );
}

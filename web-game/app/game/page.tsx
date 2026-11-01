"use client";

import dynamic from "next/dynamic";

const ZombieGame = dynamic(
  () => import("../../src/components/ZombieGame"),
  { ssr: false }
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
<h1 style={{ textAlign: "center", color: "#f87171" }}>
ZOMBIE TOWER: LAST ASCENT
</h1>

  <p style={{ textAlign: "center" }}>
      SURVIVE • CLIMB • ESCAPE
        </p>

          <ZombieGame />

            <p style={{ textAlign: "center", color: "#94a3b8" }}>
                ใช้ปุ่มลูกศรเพื่อเดิน และ Space หรือปุ่ม JUMP เพื่อกระโดด
                  </p>
                  </main>

                  );
                  }
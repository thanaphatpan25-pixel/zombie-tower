import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ZOMBIE TOWER: LAST ASCENT",
    template: "%s | ZOMBIE TOWER",
  },
  description:
    "A 2D zombie survival platformer. Climb the tower, fight the infected, and stay ahead of the rising horde.",
  applicationName: "ZOMBIE TOWER: LAST ASCENT",
  keywords: [
    "Zombie Tower",
    "2D platformer",
    "zombie survival game",
    "educational game",
    "Phaser",
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

"use client";

import { useState } from "react";
import Menu from "@/components/Menu";
import Trainer from "@/components/Trainer";

export default function Home() {
  const [n, setN] = useState<number | null>(null);

  if (n === null) {
    return (
      <div className="layout">
        <Menu onSelect={setN} />
      </div>
    );
  }

  return (
    <div className="layout">
      <button onClick={() => setN(null)}>← До списку вправ</button>
      <Trainer n={n} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export default function LiveTime() {
  const [time, setTime] = useState(() => fmt.format(new Date()));

  useEffect(() => {
    const id = setInterval(() => setTime(fmt.format(new Date())), 30_000);
    return () => clearInterval(id);
  }, []);

  return <span suppressHydrationWarning>{time}</span>;
}

import { useState, useEffect } from "react";
import { useInView } from "@/hooks/useInView";

interface CountUpProps {
  to: number;
  suffix?: string;
}

export function CountUp({ to, suffix = "" }: CountUpProps) {
  const [val, setVal] = useState(0);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= to) {
        setVal(to);
        clearInterval(timer);
      } else {
        setVal(Math.floor(start));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

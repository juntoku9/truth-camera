"use client";

import mermaid from "mermaid";
import { useEffect, useId } from "react";

type MermaidProps = {
  chart: string;
  className?: string;
};

export default function Mermaid({ chart, className }: MermaidProps) {
  const id = useId().replace(/[:]/g, "");

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
      flowchart: { htmlLabels: true },
    });
    try {
      // Validate before rendering to surface helpful errors
      if (typeof (mermaid as unknown as { parse?: (s: string) => void }).parse === "function") {
        (mermaid as unknown as { parse: (s: string) => void }).parse(chart);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Mermaid parse error", error, chart);
    }
    try {
      mermaid.run({ querySelector: `#m-${id}` });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Mermaid render error", error);
    }
  }, [chart, id]);

  return (
    <div id={`m-${id}`} className={className} suppressHydrationWarning>
      <pre className="mermaid whitespace-pre-wrap">
{chart}
      </pre>
    </div>
  );
}



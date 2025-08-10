'use client';

import { useEffect, useRef } from 'react';
import { useStock } from '../StockProvider';

export default function TopStories() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentSymbol } = useStock();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      displayMode: "regular",
      feedMode: "symbol",
      colorTheme: "light",
      symbol: `NASDAQ:${currentSymbol}`,
      isTransparent: true,
      locale: "en",
      width: "100%",
      height: "100%"
    });

    if (containerRef.current) {
      const widget = document.createElement('div');
      widget.className = 'tradingview-widget-container';
      const widgetInner = document.createElement('div');
      widgetInner.className = 'tradingview-widget-container__widget';
      widget.appendChild(widgetInner);
      widget.appendChild(script);
      containerRef.current.appendChild(widget);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [currentSymbol]);

  return (
    <section id="top-stories" className="top-stories widget-container span-full-grid" ref={containerRef}>
      {/* Top Stories Widget */}
    </section>
  );
}
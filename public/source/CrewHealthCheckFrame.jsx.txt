import { useEffect, useRef, useState } from 'react';

export default function CrewHealthCheckFrame() {
  const frameRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [height, setHeight] = useState(900);

  useEffect(() => {
    if (!loaded) return undefined;

    const frame = frameRef.current;
    const document = frame?.contentDocument;
    if (!frame || !document) return undefined;

    const updateHeight = () => {
      setHeight(Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0));
    };
    const observer = new ResizeObserver(updateHeight);
    observer.observe(document.documentElement);
    if (document.body) observer.observe(document.body);
    window.addEventListener('resize', updateHeight);
    updateHeight();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [loaded]);

  return (
    <iframe
      ref={frameRef}
      title="Crew health self-assessment"
      src="/crew-health-check.html"
      onLoad={() => setLoaded(true)}
      style={{ display: 'block', width: '100%', height: `${height}px`, border: 0, background: '#f3f6f9' }}
    />
  );
}

import { memo } from 'react';
import { byId } from '../content/sky';

// A tiny logo of a constellation, drawn from its own stars.
export const Icon = memo(function Icon({ id, w = 26, h = 18 }) {
  const s = byId[id];
  const xs = s.stars.map((t) => t[0]), ys = s.stars.map((t) => t[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const sc = Math.min((w - 4) / (x1 - x0 || 1), (h - 4) / (y1 - y0 || 1));
  const ox = (w - (x1 - x0) * sc) / 2, oy = (h - (y1 - y0) * sc) / 2;
  const P = (t) => [ox + (t[0] - x0) * sc, oy + (t[1] - y0) * sc];
  return (
    <svg className="ic" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      {s.edges.map(([a, b], j) => {
        const A = P(s.stars[a]), B = P(s.stars[b]);
        return <line key={j} x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke="currentColor" strokeWidth=".9" opacity=".55" />;
      })}
      {s.stars.map((t, j) => {
        const q = P(t);
        return <circle key={j} cx={q[0]} cy={q[1]} r={Math.min(2.3, 0.7 + t[3] * 0.25)} fill="currentColor" />;
      })}
    </svg>
  );
});

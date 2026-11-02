import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { EMAIL } from '../content/profile';
import { store, useStore } from '../store';

export function Legend() {
  const open = useStore((s) => s.legend);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="legend" role="dialog" aria-label="Keyboard shortcuts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
          <span className="eyebrow">Shortcuts</span>
          <dl>
            <dt>Hold mouse</dt><dd>Fly toward the cursor</dd>
            <dt><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></dt><dd>Fly freely, <kbd>Space</kbd> to boost</dd>
            <dt><kbd>1</kbd> to <kbd>7</kbd></dt><dd>Jump to a section</dd>
            <dt><kbd>Enter</kbd></dt><dd>Skip the reveal</dd>
            <dt><kbd>M</kbd></dt><dd>Whole map</dd>
            <dt><kbd>T</kbd></dt><dd>Guided tour</dd>
            <dt>Scroll, pinch</dt><dd>Zoom</dd>
            <dt><kbd>Esc</kbd></dt><dd>Close</dd>
          </dl>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Toast() {
  const t = useStore((s) => s.toast);
  useEffect(() => { if (!t) return; const id = setTimeout(() => store.set({ toast: null }), t.ms); return () => clearTimeout(id); }, [t]);
  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      <AnimatePresence>
        {t && (
          <motion.div key={t.key} className="toast" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}>
            <span className="sel">{t.text}</span>
            {t.mail && <a href={`mailto:${EMAIL}`}>Open mail app</a>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

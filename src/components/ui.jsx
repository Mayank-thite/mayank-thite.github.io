// Small shared icons.
const P = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
export const IcPlay = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" /></svg>;
export const IcClose = ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.7" {...P}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const IcPrev = ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.7" {...P}><path d="m14 6-6 6 6 6" /></svg>;
export const IcNext = ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.7" {...P}><path d="m10 6 6 6-6 6" /></svg>;
export const IcArrow = ({ s = 16, w = 1.8 }) => <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth={w} {...P}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const IcBack = ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.8" {...P}><path d="M19 12H5M11 18l-6-6 6-6" /></svg>;
export const IcMap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.6" {...P}>
    <circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="3.5" r="1.4" fill="currentColor" /><circle cx="19.5" cy="15" r="1.4" fill="currentColor" /><circle cx="5" cy="16.5" r="1.4" fill="currentColor" />
  </svg>
);

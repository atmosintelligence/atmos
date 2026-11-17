// Stand-in for a product screenshot. Drawn locally, so it still shows when the network is
// poor. Replace it with a real <Image> once the screenshots are ready.
export default function ShotPlaceholder({ label, ratio = '16 / 10' }) {
  return (
    <div
      role="img"
      aria-label={`Placeholder for ${label}`}
      className="relative grid w-full place-items-center overflow-hidden rounded-2xl border border-black/10 dark:border-white/10"
      style={{
        aspectRatio: ratio,
        background:
          'radial-gradient(60% 70% at 50% 0%, rgba(74,222,128,0.16), transparent), linear-gradient(#101311, #101311)',
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgba(74,222,128,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.07) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <span className="relative font-heading text-lg font-semibold tracking-tight" style={{ color: '#4ADE80' }}>{label}</span>
    </div>
  );
}

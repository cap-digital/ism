/** Text-based recreation of the ISM wordmark in brand styling. */
export function BrandMark({
  light = false,
  size = "md",
  showSub = true,
}: {
  light?: boolean;
  size?: "sm" | "md" | "lg";
  showSub?: boolean;
}) {
  const sizes = {
    sm: { ism: "text-2xl", sub: "text-[8px]" },
    md: { ism: "text-3xl", sub: "text-[9px]" },
    lg: { ism: "text-5xl", sub: "text-xs" },
  }[size];
  const ismColor = light ? "text-white" : "text-ism-green";

  return (
    <div className="flex flex-col leading-none">
      <div className="flex items-baseline gap-1">
        <span className={`font-black italic tracking-tight ${sizes.ism} ${ismColor}`}>
          ism
        </span>
      </div>
      {showSub && (
        <span
          className={`mt-0.5 font-semibold uppercase tracking-[0.18em] ${sizes.sub} ${
            light ? "text-white/70" : "text-ism-green-900/55"
          }`}
        >
          Indústrias São Miguel
        </span>
      )}
    </div>
  );
}

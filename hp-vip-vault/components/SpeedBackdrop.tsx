// Car-themed ambient background: slow orange glow blobs + diagonal speed-streak
// sweeps, evoking motion blur without a second WebGL scene (Hyperspeed stays
// exclusive to the landing page). Parent must be `relative overflow-hidden`.
export default function SpeedBackdrop({
  variant = "corner",
  intensity = "bold",
  className = "",
}: {
  variant?: "corner" | "center";
  intensity?: "subtle" | "bold";
  className?: string;
}) {
  const streakCount = intensity === "bold" ? 6 : 3;
  const streaks = Array.from({ length: streakCount });

  const blobPositions =
    variant === "center"
      ? ["top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", "top-1/2 left-1/2 -translate-x-1/3 -translate-y-2/3"]
      : ["-top-32 -right-32", "-bottom-32 -left-32"];

  return (
    <div
      aria-hidden
      className={`absolute inset-0 -z-10 pointer-events-none overflow-hidden motion-reduce:hidden ${className}`}
    >
      <div
        className={`absolute ${blobPositions[0]} w-[36rem] h-[36rem] rounded-full bg-orange-500/10 blur-3xl animate-ambient-drift`}
        style={{ animationDuration: "9s" }}
      />
      <div
        className={`absolute ${blobPositions[1]} w-[28rem] h-[28rem] rounded-full bg-orange-500/5 blur-3xl animate-ambient-drift`}
        style={{ animationDuration: "7s", animationDelay: "-4s" }}
      />
      {streaks.map((_, i) => (
        <div
          key={i}
          className="absolute top-0 h-full w-px bg-gradient-to-b from-transparent via-orange-400/40 to-transparent animate-speed-streak"
          style={{
            left: `${(i / streakCount) * 100}%`,
            animationDuration: `${2 + (i % 3) * 0.5}s`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

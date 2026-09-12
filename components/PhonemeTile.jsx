"use client";

export default function PhonemeTile({
  ipa,
  label,
  example,
  size = "3.6rem",
  state, // "correct" | "incorrect" | undefined
  onClick,
  as = "button",
  forceFlipped = false,
  showHint = true,
}) {
  const Tag = as === "button" ? "button" : "div";
  const classes = [
    "phoneme-tile",
    state === "correct" ? "phoneme-tile--correct" : "",
    state === "incorrect" ? "phoneme-tile--incorrect" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      className={classes}
      style={{ "--tile-size": size }}
      onClick={onClick}
      data-flipped={forceFlipped ? "true" : "false"}
      data-hints={showHint ? "true" : "false"}
      type={as === "button" ? "button" : undefined}
      tabIndex={as === "button" ? undefined : 0}
      aria-label={showHint ? `/${ipa}/ sounds like ${label}, as in ${example}` : `Phoneme /${ipa}/`}
    >
      <span className="phoneme-tile__inner">
        <span className="phoneme-tile__face font-mono text-lg text-ink">
          /{ipa}/
        </span>
        {showHint && (
          <span className="phoneme-tile__face phoneme-tile__face--back">
            <span className="font-display text-base font-semibold text-primary-dark">
              {label}
            </span>
            <span className="text-[0.65rem] text-ink-soft">as in {example}</span>
          </span>
        )}
      </span>
    </Tag>
  );
}

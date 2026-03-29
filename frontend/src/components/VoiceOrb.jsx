// VoiceOrb.jsx
// ─────────────────────────────────────────────────────────────────
// STYLING UPDATE ONLY — no logic changes.
// Props contract is unchanged:  { state, onStop }
// state: "listening" | "thinking" | "speaking" | "idle"
// ─────────────────────────────────────────────────────────────────

export default function VoiceOrb({ state, onStop }) {
  if (!state || state === "idle") return null;

  // ── LISTENING — rainbow bars bounce + wiggling ear emoji ──────────
  if (state === "listening") {
    return (
      <div className="flex items-center gap-2.5 animate-[fadeUp_.3s_ease_both]">
        {/* Bot avatar */}
        <div className="w-[30px] h-[30px] rounded-full bg-[#e6f5e9] flex items-center
          justify-center text-base flex-shrink-0">
          🎙️
        </div>

        <div className="flex items-center gap-3 bg-white border-[1.5px] border-[#ede5d8]
          rounded-[18px] px-4 py-3 flex-1">

          {/* Wiggling ear */}
          <span className="text-xl animate-[earWiggle_1s_ease-in-out_infinite]">👂</span>

          {/* Rainbow bouncing bars */}
          <div className="flex items-end gap-1 h-7">
            {[
              "#6db87a","#5aaddf","#9b8ec4",
              "#e8956d","#e07878","#6db87a","#5bbcb0",
            ].map((color, i) => (
              <div
                key={i}
                className="w-[5px] rounded-[3px] animate-[barBounce_.6s_ease-in-out_infinite]"
                style={{
                  background: color,
                  animationDelay: `${i * 0.1}s`,
                  height: "6px",         /* JS animation overrides this via keyframe */
                }}
              />
            ))}
          </div>

          <span className="text-[13px] font-black text-[#7a6550]">Listening… speak now!</span>

          <button
            onClick={onStop}
            className="ml-auto bg-[#fce9e9] border-none rounded-[10px] px-3 py-1.5
              text-xs font-black text-[#e07878] cursor-pointer transition-all
              hover:bg-[#e07878] hover:text-white font-nunito"
          >
            Stop
          </button>
        </div>
      </div>
    );
  }

  // ── THINKING — bouncy brain + coloured dots + shimmer text ───────
  if (state === "thinking") {
    return (
      <div className="flex items-center gap-2.5 animate-[fadeUp_.3s_ease_both]">
        <div className="w-[30px] h-[30px] rounded-full bg-[#e6f5e9] flex items-center
          justify-center text-base flex-shrink-0">
          🩺
        </div>

        <div className="flex items-center gap-2.5 bg-white border-[1.5px] border-[#ede5d8]
          rounded-[18px] rounded-bl-[5px] px-4 py-3">

          {/* Bouncing brain */}
          <span className="text-xl animate-[brainBounce_1.5s_ease-in-out_infinite]">🧠</span>

          {/* Coloured pop dots */}
          <div className="flex gap-1.5 items-center">
            {["#6db87a","#5aaddf","#9b8ec4"].map((color, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-[dotPop_1.2s_ease-in-out_infinite]"
                style={{ background: color, animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </div>

          {/* Shimmering label */}
          <span className="text-[12.5px] font-black text-[#7a6550] animate-[shimmer_2s_ease-in-out_infinite]">
            Thinking hard…
          </span>
        </div>
      </div>
    );
  }

  // ── SPEAKING — sage soundwave + stop button ───────────────────────
  if (state === "speaking") {
    return (
      <div className="flex items-center gap-2.5 animate-[fadeUp_.3s_ease_both]">
        <div className="w-[30px] h-[30px] rounded-full bg-[#e6f5e9] flex items-center
          justify-center text-base flex-shrink-0">
          🩺
        </div>

        <div className="flex items-center gap-2.5 bg-[#e6f5e9] border-[1.5px] border-[#4d9a5a]
          rounded-[18px] rounded-bl-[5px] px-4 py-3">

          {/* Wave bars */}
          <div className="flex items-center gap-1 h-6">
            {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((delay, i) => (
              <div
                key={i}
                className="w-1 rounded-sm bg-[#6db87a] animate-[waveBar_.8s_ease-in-out_infinite]"
                style={{ animationDelay: `${delay}s`, height: "4px" }}
              />
            ))}
          </div>

          <span className="text-[12.5px] font-black text-[#4d9a5a]">Speaking response…</span>

          <button
            onClick={onStop}
            className="ml-auto bg-transparent border-none cursor-pointer text-sm font-black
              text-[#4d9a5a] px-2 py-1 rounded-lg transition-all hover:bg-[#6db87a]/20 font-nunito"
          >
            ⏹ Stop
          </button>
        </div>
      </div>
    );
  }

  return null;
}

import type { Tone } from "@/types";

const tones: { value: Tone; emoji: string }[] = [
  { value: "Profesional", emoji: "👔" },
  { value: "Casual", emoji: "😎" },
  { value: "Persuasivo", emoji: "🎯" },
  { value: "Educativo", emoji: "📚" },
  { value: "Divertido", emoji: "😂" },
];

interface ToneSelectorProps {
  value: Tone;
  onChange: (tone: Tone) => void;
}

export default function ToneSelector({ value, onChange }: ToneSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-2">Tono</label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {tones.map(({ value: tone, emoji }) => (
          <button key={tone} type="button" onClick={() => onChange(tone)}
            className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              value === tone
                ? "glass border-indigo-500/50 text-indigo-300 shadow-lg shadow-indigo-500/10"
                : "glass border-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
            }`}>
            <span className="text-base">{emoji}</span>
            <span className="text-xs">{tone}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import { Mic, MicOff } from "lucide-react";
import { useSpeechInput } from "@/hooks/use-speech-input";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";

interface VoiceInputButtonProps {
  onResult: (text: string) => void;
  className?: string;
}

const langMap = { en: "en-IN", hi: "hi-IN", gu: "gu-IN" } as const;

export function VoiceInputButton({ onResult, className }: VoiceInputButtonProps) {
  const { lang, t } = useI18n();
  const { listening, supported, toggle } = useSpeechInput({
    lang: langMap[lang],
    onResult,
  });

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all active:scale-95",
        listening
          ? "bg-destructive/20 border-2 border-destructive text-destructive animate-pulse"
          : "glass text-muted-foreground hover:text-primary hover:border-primary/30",
        className
      )}
      title={listening ? t("common.listening") : t("common.voice")}
    >
      {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
    </button>
  );
}

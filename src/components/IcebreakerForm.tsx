import React, { useState } from "react";
import { Heart, Sparkles, MessageCircle, ArrowRight } from "lucide-react";
// If you have a Supabase client and a "drafts" table, keep this import.
// Otherwise you can safely remove it and the save-to-favorites handler.
import { supabase } from "@/integrations/supabase/client";

type Props = {
  onDraft?: (draft: string) => void;
};

const EDGE_FUNCTION_URL =
  "https://nkuoytecltlvoznlmxfp.functions.supabase.co/generate-icebreaker";

const IcebreakerForm: React.FC<Props> = ({ onDraft }) => {
  const [profileUrl, setProfileUrl] = useState("");
  const [tone, setTone] = useState<"Professional" | "Friendly" | "Warm" | "Casual">("Professional");
  const [goal, setGoal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!profileUrl.trim()) {
      setErrorMsg("Please enter a profile URL or keywords.");
      return;
    }
    setErrorMsg(null);
    setIsGenerating(true);
    try {
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileUrl: profileUrl.trim(),
          tone,
          goal: goal.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Generation failed");
      }

      const draft: string = data?.draft || "";
      setResult(draft);
      onDraft?.(draft);
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong while generating.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
    } catch {
      // silent fail is fine
    }
  };

  const handleSaveToFavorites = async () => {
    if (!result) return;
    try {
      await supabase.from("drafts").insert({
        profile_url: profileUrl,
        query: profileUrl,
        tone,
        goal,
        draft: result,
        metadata: {},
      });
    } catch {
      // ignore if you don't use Supabase client on the frontend
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Profile URL or Keywords *
          </label>
          <input
            type="text"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            placeholder="https://www.linkedin.com/in/username or keywords"
            className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 backdrop-blur-sm"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Tone *
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as any)}
            className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/20 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 backdrop-blur-sm"
          >
            <option>Professional</option>
            <option>Friendly</option>
            <option>Warm</option>
            <option>Casual</option>
          </select>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Your Goal (Optional)
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="I want to learn about their experience with..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 resize-none backdrop-blur-sm"
          />
        </div>

        {errorMsg && (
          <p className="text-sm text-red-400 -mt-2">{errorMsg}</p>
        )}

        <button
          onClick={handleGenerate}
          disabled={!profileUrl || !tone || isGenerating}
          className="cyber-button w-full py-4 px-6 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:from-cyan-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl group relative overflow-hidden"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Icebreaker
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </div>
          )}
        </button>
      </div>

      {result && (
        <div className="result-card mt-8 p-6 rounded-lg bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-400/30 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-400" />
            Your Icebreaker
          </h3>
          <p className="text-gray-200 leading-relaxed mb-4">{result}</p>
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="action-btn px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-300 hover:scale-105"
            >
              📋 Copy
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="action-btn px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              🔄 Regenerate
            </button>
            <button
              onClick={handleSaveToFavorites}
              className="action-btn px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-300 hover:scale-105"
            >
              ❤️ Save to Favorites
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IcebreakerForm;

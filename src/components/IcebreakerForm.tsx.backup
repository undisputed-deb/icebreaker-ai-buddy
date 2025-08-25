import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Heart, RefreshCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PROMPT_TEMPLATE = `Write a warm, specific 2–3 sentence icebreaker using the context.
Rules: mention 1–2 concrete details, avoid clichés and generic praise, match the requested tone, end with a gentle question.
Context:
{{CONTEXT}}
User goal:
{{GOAL}}
Tone:
{{TONE}}`;

interface GeneratedResult {
  draft: string;
  sources: Array<{
    id: string;
    content: string;
    title: string;
    similarity: number;
  }>;
}

export const IcebreakerForm = () => {
  const [profileUrl, setProfileUrl] = useState('');
  const [tone, setTone] = useState('');
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [expandedSources, setExpandedSources] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!profileUrl.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a profile URL or keywords",
        variant: "destructive"
      });
      return;
    }

    if (!tone) {
      toast({
        title: "Tone required", 
        description: "Please select a tone",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-icebreaker', {
        body: {
          profileUrl: profileUrl.trim(),
          tone,
          goal: goal.trim()
        }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Icebreaker generated!",
        description: "Your personalized conversation starter is ready"
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToFavorites = async () => {
    if (!result) return;

    try {
      const { error } = await supabase
        .from('drafts')
        .insert({
          profile_url: profileUrl,
          query: profileUrl,
          tone,
          goal,
          draft: result.draft,
          metadata: { sources: result.sources }
        });

      if (error) throw error;

      toast({
        title: "Saved to favorites!",
        description: "Your icebreaker has been saved"
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Save failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard"
    });
  };

  const handleClear = () => {
    setProfileUrl('');
    setTone('');
    setGoal('');
    setResult(null);
    setExpandedSources(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-background to-muted/20 border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="text-primary" />
            Generate Icebreaker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Profile URL or Keywords *
            </label>
            <Input
              placeholder="e.g., LinkedIn profile URL, name + company, or keywords..."
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Tone *
            </label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue placeholder="Select conversation tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="playful">Playful</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Your Goal (Optional)
            </label>
            <Textarea
              placeholder="What do you hope to achieve with this conversation?"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleGenerate} 
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Icebreaker
                </>
              )}
            </Button>
            {result && (
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Your Icebreaker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary-glow/5 border border-primary/20">
              <p className="text-lg leading-relaxed">{result.draft}</p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(result.draft)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSaveToFavorites}
              >
                <Heart className="w-4 h-4 mr-2" />
                Save to Favorites
              </Button>
            </div>

            {result.sources?.length > 0 && (
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedSources(!expandedSources)}
                  className="mb-3"
                >
                  {expandedSources ? (
                    <ChevronUp className="w-4 h-4 mr-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 mr-2" />
                  )}
                  {result.sources.length} source{result.sources.length !== 1 ? 's' : ''} used
                </Button>

                {expandedSources && (
                  <div className="space-y-3">
                    {result.sources.map((source, idx) => (
                      <div key={source.id} className="p-3 rounded bg-muted/50 border">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">{source.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(source.similarity * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{source.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
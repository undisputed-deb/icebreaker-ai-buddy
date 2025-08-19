import React from 'react';
import { IcebreakerForm } from '@/components/IcebreakerForm';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, Brain, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              IceBrAIker
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/favorites">
                <Heart className="w-4 h-4 mr-2" />
                Favorites
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="w-10 h-10 text-primary" />
            <Sparkles className="w-8 h-8 text-primary-glow animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            IceBrAIker
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            AI-powered conversation starters that help you connect meaningfully. 
            Just enter a profile URL or keywords, and get personalized icebreakers in seconds.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 rounded-lg bg-gradient-to-b from-card to-muted/20 border">
            <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Smart Context</h3>
            <p className="text-sm text-muted-foreground">
              Analyzes public info to find interesting conversation topics
            </p>
          </div>
          <div className="text-center p-6 rounded-lg bg-gradient-to-b from-card to-muted/20 border">
            <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Personalized</h3>
            <p className="text-sm text-muted-foreground">
              Generates warm, specific icebreakers matching your tone
            </p>
          </div>
          <div className="text-center p-6 rounded-lg bg-gradient-to-b from-card to-muted/20 border">
            <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Save & Reuse</h3>
            <p className="text-sm text-muted-foreground">
              Build your collection of effective conversation starters
            </p>
          </div>
        </div>

        {/* Main Form */}
        <div className="max-w-4xl mx-auto">
          <IcebreakerForm />
        </div>
      </main>
    </div>
  );
};

export default Index;

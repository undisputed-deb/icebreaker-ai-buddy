import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Copy, Search, Filter, Calendar, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Draft {
  id: string;
  profile_url: string;
  query: string;
  tone: string;
  goal: string;
  draft: string;
  metadata?: any;
  created_at: string;
}

const Favorites = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [filteredDrafts, setFilteredDrafts] = useState<Draft[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [toneFilter, setToneFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrafts();
  }, []);

  useEffect(() => {
    filterDrafts();
  }, [drafts, searchTerm, toneFilter]);

  const fetchDrafts = async () => {
    try {
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDrafts(data || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast({
        title: "Error loading favorites",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterDrafts = () => {
    let filtered = [...drafts];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(draft => 
        draft.draft.toLowerCase().includes(term) ||
        draft.profile_url.toLowerCase().includes(term) ||
        draft.query.toLowerCase().includes(term) ||
        (draft.goal && draft.goal.toLowerCase().includes(term))
      );
    }

    if (toneFilter) {
      filtered = filtered.filter(draft => draft.tone === toneFilter);
    }

    setFilteredDrafts(filtered);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Icebreaker copied to clipboard"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'friendly': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'professional': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'playful': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading your favorites...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Heart className="text-primary" />
          Your Favorites
        </h1>
        <p className="text-muted-foreground">
          {drafts.length} saved icebreaker{drafts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search icebreakers, URLs, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={toneFilter} onValueChange={setToneFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All tones</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="playful">Playful</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredDrafts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || toneFilter ? 'No matches found' : 'No favorites yet'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || toneFilter 
                ? 'Try adjusting your search or filters'
                : 'Start generating icebreakers to build your collection'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredDrafts.map((draft) => (
            <Card key={draft.id} className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-1">
                      {draft.profile_url}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {formatDate(draft.created_at)}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Badge className={getToneColor(draft.tone)} variant="secondary">
                      {draft.tone}
                    </Badge>
                    {draft.profile_url.startsWith('http') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(draft.profile_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary-glow/5 border border-primary/20">
                    <p className="text-base leading-relaxed">{draft.draft}</p>
                  </div>

                  {draft.goal && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Goal: </span>
                      <span>{draft.goal}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(draft.draft)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
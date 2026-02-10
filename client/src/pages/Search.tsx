import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowRight, FileText, Car, Users, Wrench, AlertCircle } from 'lucide-react';
import { globalSearch, addToSearchHistory, type GlobalSearchResult } from '@/lib/api';

export default function SearchPage() {
  const [location] = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract search query from URL
    const searchParams = new URLSearchParams(location.split('?')[1]);
    const q = searchParams.get('q') || '';
    setQuery(q);

    if (q.trim()) {
      performSearch(q);
    }
  }, [location]);

  const performSearch = async (searchQuery: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const searchResults = await globalSearch(searchQuery);
      setResults(searchResults);
      addToSearchHistory(searchQuery, searchResults.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'vehicle':
        return <Car className="w-5 h-5" />;
      case 'client':
        return <Users className="w-5 h-5" />;
      case 'job':
        return <Wrench className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'vehicle':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
      case 'client':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
      case 'job':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Search Header */}
        <div>
          <h1 className="text-3xl font-display font-bold">Search Results</h1>
          <p className="text-muted-foreground mt-1 uppercase text-[10px] font-bold tracking-widest">
            Find documents, vehicles, clients, jobs, and more
          </p>
        </div>

        {/* Search Box */}
        <Card className="industrial-border">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search again..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 h-10"
              />
              <Button type="submit" className="h-10" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Searching...</span>
          </div>
        )}

        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-destructive">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && results.length === 0 && query && (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-lg font-medium">No results found</p>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search terms or use different keywords
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && results.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">
                Found <span className="font-bold text-foreground">{results.length}</span> result
                {results.length !== 1 ? 's' : ''}
                {query && (
                  <span className="ml-2">
                    for <span className="font-bold text-primary">"{query}"</span>
                  </span>
                )}
              </p>
            </div>

            <div className="grid gap-4">
              {results.map((result) => (
                <Card key={`${result.type}-${result.id}`} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div
                          className={`p-3 rounded-lg ${getTypeColor(result.type)} flex-shrink-0`}
                        >
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-foreground truncate">
                            {result.title}
                          </h3>
                          {result.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {result.description}
                            </p>
                          )}
                          <div className="mt-3 flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="text-xs uppercase font-bold tracking-wider"
                            >
                              {result.type}
                            </Badge>
                            {result.relevance && (
                              <span className="text-[10px] text-muted-foreground">
                                Relevance: {Math.round(result.relevance * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!isLoading && results.length === 0 && !query && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Enter a search query to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

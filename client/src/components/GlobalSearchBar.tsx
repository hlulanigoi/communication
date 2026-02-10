import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, Clock, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  globalSearch,
  autocompleteSearch,
  getSearchHistory,
  addToSearchHistory,
  removeFromSearchHistory,
  clearSearchHistory,
  type GlobalSearchResult,
  type SearchHistoryItem,
} from '@/lib/api';
import { useLocation } from 'wouter';

export default function GlobalSearchBar() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load search history
  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHistory(getSearchHistory());
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const suggestions = await autocompleteSearch(query);
        setResults(suggestions.slice(0, 8)); // Show top 8 results
        setIsLoading(false);
      } catch (error) {
        console.error('Search failed:', error);
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      const searchResults = await globalSearch(searchQuery);
      addToSearchHistory(searchQuery, searchResults.length);
      // Navigate to search results page or open modal
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
      setQuery('');
      setIsOpen(false);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    handleSearch(historyQuery);
  };

  const handleHistoryDelete = (e: React.MouseEvent, historyQuery: string) => {
    e.stopPropagation();
    removeFromSearchHistory(historyQuery);
    setHistory(getSearchHistory());
  };

  const getResultIcon = (type: string) => {
    const icons: Record<string, string> = {
      document: '📄',
      vehicle: '🚗',
      client: '👥',
      job: '🔧',
      inventory: '📦',
      invoice: '💰',
      staff: '👔',
    };
    return icons[type] || '📌';
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <Input
          placeholder="Search documents, vehicles, clients, jobs..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query);
            }
          }}
          className="pl-10 pr-10 bg-background/80 backdrop-blur-sm border-border"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="p-4 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-primary mr-2" />
              <span className="text-sm text-muted-foreground">Searching...</span>
            </div>
          )}

          {!isLoading && query && results.length > 0 && (
            <div>
              <div className="p-2 border-b border-border/50">
                <p className="text-xs font-semibold text-muted-foreground px-2">RESULTS</p>
              </div>
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSearch(query)}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getResultIcon(result.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.title}</p>
                      {result.description && (
                        <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                      )}
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {result.type}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!isLoading && query && results.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          )}

          {!query && history.length > 0 && (
            <div>
              <div className="p-2 border-b border-border/50 flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground px-2">RECENT SEARCHES</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearSearchHistory();
                    setHistory([]);
                  }}
                  className="h-6 px-2 text-[10px]"
                >
                  Clear
                </Button>
              </div>
              {history.slice(0, 5).map((item) => (
                <button
                  key={item.timestamp}
                  onClick={() => handleHistoryClick(item.query)}
                  className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{item.query}</span>
                    {item.resultCount && (
                      <span className="text-[10px] text-muted-foreground">
                        {item.resultCount} results
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleHistoryDelete(e, item.query)}
                    className="opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </button>
              ))}
            </div>
          )}

          {!query && history.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">Start typing to search...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

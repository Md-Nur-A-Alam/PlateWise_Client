"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { RecipeCard } from '@/components/ui/RecipeCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { CUISINES } from '@/constants/cuisines';

const DIET_TYPES = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Cook Time (Fastest)', value: 'cookTime' },
];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read initial state from URL
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(search, 500);
  
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || '');
  
  // Multi-select for diet types
  const initialDietType = searchParams.get('dietType');
  const [selectedDiets, setSelectedDiets] = useState<string[]>(
    initialDietType ? initialDietType.split(',') : []
  );
  
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Update URL when filters change (sync state to URL)
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (selectedCuisine) params.set('cuisine', selectedCuisine);
    if (selectedDiets.length > 0) params.set('dietType', selectedDiets.join(','));
    if (sort !== 'newest') params.set('sort', sort);
    if (page > 1) params.set('page', page.toString());
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, selectedCuisine, selectedDiets, sort, page, pathname, router]);

  // Fetch function
  const fetchRecipes = async () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedCuisine) params.set('cuisine', selectedCuisine);
    if (selectedDiets.length > 0) params.set('dietType', selectedDiets.join(','));
    if (sort) params.set('sort', sort);
    params.set('page', page.toString());
    params.set('limit', '12');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recipes?${params.toString()}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data; // { recipes, page, totalPages, total }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['recipes', debouncedSearch, selectedCuisine, selectedDiets, sort, page],
    queryFn: fetchRecipes,
  });

  const toggleDiet = (diet: string) => {
    setPage(1); // Reset page on filter change
    setSelectedDiets(prev => 
      prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]
    );
  };

  const handleCuisineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPage(1);
    setSelectedCuisine(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPage(1);
    setSort(e.target.value);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCuisine('');
    setSelectedDiets([]);
    setSort('newest');
    setPage(1);
  };

  const hasActiveFilters = search || selectedCuisine || selectedDiets.length > 0 || sort !== 'newest';

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Explore Recipes</h1>
          <p className="text-neutral-foreground">Discover thousands of delicious recipes from our community.</p>
        </div>
        
        <div className="w-full md:w-auto flex items-center gap-2">
          <div className="relative flex-1 md:w-80">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-foreground">
              <Search className="w-4 h-4" />
            </div>
            <Input
              type="text"
              placeholder="Search recipes or ingredients..."
              className="pl-9 w-full"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Button 
            variant="outline" 
            className="md:hidden"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className={`lg:w-64 shrink-0 space-y-6 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'} animate-fade-in-up`}>
          <div className="glass p-5 rounded-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" /> Filters
              </h2>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-primary hover:text-accent transition-colors font-medium bg-primary/10 px-2 py-1 rounded-full">
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select 
                  value={sort} 
                  onChange={handleSortChange}
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Cuisine</label>
                <Select 
                  value={selectedCuisine} 
                  onChange={handleCuisineChange}
                >
                  <option value="">All Cuisines</option>
                  {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Dietary Preferences</label>
                <div className="flex flex-wrap gap-2">
                  {DIET_TYPES.map(diet => {
                    const isSelected = selectedDiets.includes(diet);
                    return (
                      <Badge
                        key={diet}
                        variant={isSelected ? 'default' : 'outline'}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-muted'}`}
                        onClick={() => toggleDiet(diet)}
                      >
                        {diet} {isSelected && <X className="w-3 h-3 ml-1 inline-block" />}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Grid */}
        <div className="flex-1 min-w-0">
          {isError ? (
            <div className="text-center py-20 bg-muted/20 rounded-xl border border-border">
              <p className="text-destructive font-semibold">Failed to load recipes.</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Try Again</Button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : data?.recipes.length === 0 ? (
            <div className="text-center py-24 bg-muted/10 rounded-xl border border-border border-dashed">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-neutral-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No recipes found</h3>
              <p className="text-neutral-foreground mb-6 max-w-md mx-auto">
                We couldn't find any recipes matching your current filters. Try adjusting your search or clearing some filters.
              </p>
              <Button onClick={clearFilters} variant="secondary">Clear All Filters</Button>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-neutral-foreground font-medium">
                Showing {data?.recipes.length} of {data?.total} recipes
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data?.recipes.map((recipe: any) => (
                  <RecipeCard key={recipe._id} recipe={recipe} />
                ))}
              </div>

              {/* Pagination */}
              {data?.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12 pt-6 border-t border-border">
                  <Button 
                    variant="outline" 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  
                  <div className="text-sm font-medium mx-4">
                    Page {page} of {data.totalPages}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    disabled={page >= data.totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <React.Suspense fallback={<div className="container mx-auto px-4 py-8"><Skeleton className="w-full h-screen" /></div>}>
      <ExploreContent />
    </React.Suspense>
  );
}

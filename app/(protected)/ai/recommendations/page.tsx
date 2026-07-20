"use client";

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Settings2, RefreshCcw, Info, Clock } from 'lucide-react';
import { getRecommendations } from '@/app/actions/ai';
import { RecipeCard } from '@/components/ui/RecipeCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DIET_TYPES } from '@/constants/dietTypes';
import { notify } from '@/lib/notify';

export default function RecommendationsPage() {
  const queryClient = useQueryClient();
  const [dietType, setDietType] = useState('');
  const [maxCookTime, setMaxCookTime] = useState<number | ''>('');

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['smart-recommendations', dietType, maxCookTime],
    queryFn: async () => {
      const res = await getRecommendations({ 
        dietType: dietType || undefined, 
        maxCookTime: maxCookTime ? Number(maxCookTime) : undefined 
      });
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['smart-recommendations'] });
    refetch();
    notify.success("Refreshing recommendations...");
  };

  const hasPreferences = data?.hasPreferences ?? true; // Default true so it doesn't flash

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" /> For You
          </h1>
          <p className="text-neutral-foreground mt-2">Smart recommendations based on your preferences, allergies, and recent activity.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isFetching}
            className="w-full md:w-auto gap-2 border-primary/20 hover:bg-primary/10 text-primary"
          >
            <RefreshCcw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {!hasPreferences && (
        <div className="mb-8 p-4 bg-accent/10 border border-accent/20 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="text-sm text-foreground">
            <p className="font-semibold text-accent mb-1">Boost Your Recommendations</p>
            <p className="opacity-90">We noticed you haven't set up your dietary preferences or allergies in your profile yet. While we're using your recent activity to find these recipes, updating your profile will make these recommendations much more accurate!</p>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="glass p-4 rounded-xl mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-foreground">
          <Settings2 className="w-4 h-4" /> Fine-tune:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-1/2">
          <Select value={dietType} onChange={(e) => setDietType(e.target.value)}>
            <option value="">Any Diet</option>
            {DIET_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Select value={maxCookTime.toString()} onChange={(e) => setMaxCookTime(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Any Cook Time</option>
            <option value="15">Under 15 mins</option>
            <option value="30">Under 30 mins</option>
            <option value="60">Under 1 hour</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full aspect-[4/3] rounded-xl" />
              <Skeleton className="h-6 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
              <Skeleton className="h-16 w-full rounded mt-2" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20 glass rounded-xl border border-destructive/20">
          <p className="text-destructive font-medium mb-4">We hit a snag generating your recommendations.</p>
          <Button onClick={() => refetch()} variant="primary">Try Again</Button>
        </div>
      ) : data?.recommendations?.length === 0 ? (
        <div className="text-center py-20 glass rounded-xl border border-border/50">
          <Sparkles className="w-12 h-12 text-primary/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No perfect matches right now</h3>
          <p className="text-neutral-foreground mb-6">Try adjusting your filters or browsing the Explore page to give us some hints!</p>
          <Button onClick={() => { setDietType(''); setMaxCookTime(''); }}>Clear Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.recommendations?.map((recipe: any) => (
            <div key={recipe._id} className="flex flex-col h-full relative group">
              <RecipeCard recipe={recipe} />
              
              {/* Rationale Tag */}
              <div className="mt-[-8px] pt-4 pb-3 px-4 bg-primary/5 border border-primary/20 rounded-b-xl border-t-0 shadow-sm relative z-0 flex-grow">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/90 font-medium leading-tight">
                    {recipe.rationale || 'A great match based on your preferences.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

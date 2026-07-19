"use client";

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRecipe } from '@/app/actions/recipe';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ExternalLink, Plus, ChefHat } from 'lucide-react';
import { notify } from '@/lib/notify';
import { Card } from '@/components/ui/Card';

interface Recipe {
  _id: string;
  title: string;
  cuisine: string;
  avgRating: number;
  createdAt: string;
  images: string[];
}

export default function ManageRecipesPage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const { data: recipes, isLoading, error } = useQuery<Recipe[]>({
    queryKey: ['my-recipes'],
    queryFn: async () => {
      const res = await fetch('/api/recipes/mine');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch recipes');
      return data.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: (res) => {
      if (res.success) {
        notify.success('Recipe deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['my-recipes'] });
        setDeleteId(null);
      } else {
        notify.error(res.error || 'Failed to delete recipe');
      }
    },
    onError: () => {
      notify.error('An unexpected error occurred while deleting');
    }
  });

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center glass rounded-3xl mt-8">
        <p className="text-red-500 mb-4">Failed to load your recipes.</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['my-recipes'] })}>Try Again</Button>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] glass rounded-3xl mt-8 p-8 text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <ChefHat className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Recipes Yet</h2>
        <p className="text-neutral-foreground max-w-md mb-8">
          You haven't created any recipes. Start sharing your culinary masterpieces with the PlateWise community!
        </p>
        <Link href="/recipes/add">
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Create Your First Recipe
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Recipes</h1>
          <p className="text-neutral-foreground mt-1">Manage, view, and delete your published recipes.</p>
        </div>
        <Link href="/recipes/add">
          <Button className="gap-2 shadow-md">
            <Plus className="w-4 h-4" />
            Add New Recipe
          </Button>
        </Link>
      </div>

      {/* Desktop Table Layout (md and up) */}
      <div className="hidden md:block glass rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-neutral-foreground border-b border-border/50">
            <tr>
              <th className="px-6 py-4 font-semibold">Recipe</th>
              <th className="px-6 py-4 font-semibold">Cuisine</th>
              <th className="px-6 py-4 font-semibold">Rating</th>
              <th className="px-6 py-4 font-semibold">Created</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {recipes.map((recipe) => (
              <tr key={recipe._id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {recipe.images?.[0] ? (
                        <Image src={recipe.images[0]} alt={recipe.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary"><ChefHat className="w-5 h-5"/></div>
                      )}
                    </div>
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{recipe.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4"><span className="inline-flex px-2 py-1 bg-background/50 border border-border/50 rounded-md text-xs font-medium">{recipe.cuisine}</span></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <span className="text-accent">★</span>
                    <span className="font-medium">{recipe.avgRating.toFixed(1)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-neutral-foreground">{new Date(recipe.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/recipes/${recipe._id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Recipe">
                        <ExternalLink className="w-4 h-4 text-primary" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteId(recipe._id)} title="Delete Recipe">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card Layout (below md) */}
      <div className="md:hidden space-y-4">
        {recipes.map((recipe) => (
          <Card key={recipe._id} className="p-4 flex flex-col gap-4 border border-border/50">
            <div className="flex gap-4 items-start">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                {recipe.images?.[0] ? (
                  <Image src={recipe.images[0]} alt={recipe.title} fill className="object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary"><ChefHat className="w-8 h-8"/></div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground line-clamp-2 leading-tight">{recipe.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex px-2 py-0.5 bg-background border border-border/50 rounded-md text-[10px] font-medium uppercase tracking-wider">{recipe.cuisine}</span>
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <span className="text-accent">★</span>
                    <span>{recipe.avgRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/50 mt-2">
               <Link href={`/recipes/${recipe._id}`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full gap-2">
                    <ExternalLink className="w-4 h-4" /> View
                  </Button>
               </Link>
               <Button variant="danger" size="sm" className="flex-1 gap-2" onClick={() => setDeleteId(recipe._id)}>
                 <Trash2 className="w-4 h-4" /> Delete
               </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)}
        title="Delete Recipe"
      >
        <div className="space-y-6">
          <p className="text-neutral-foreground">
            Are you sure you want to delete this recipe? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-4">
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              Delete Recipe
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

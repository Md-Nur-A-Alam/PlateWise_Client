import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Star, ChefHat } from 'lucide-react';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';

interface RecipeCardProps {
  recipe: {
    _id: string;
    title: string;
    shortDescription?: string;
    cuisine: string;
    cookTimeMinutes: number;
    difficulty: string;
    avgRating?: number;
    images?: string[];
  };
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const imageUrl = recipe.images?.[0] || 'https://images.unsplash.com/photo-1495195134817-a165d42e6bc1?q=80&w=800&auto=format&fit=crop';
  
  return (
    <Link href={`/recipes/${recipe._id}`} className="block h-full group">
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/50">
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={recipe.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm shadow-sm font-semibold text-xs">
              {recipe.cuisine}
            </Badge>
          </div>
        </div>
        
        <CardContent className="flex flex-col flex-1 p-5">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {recipe.title}
            </h3>
            {recipe.avgRating ? (
              <div className="flex items-center gap-1 text-yellow-500 shrink-0 bg-yellow-500/10 px-1.5 py-0.5 rounded text-xs font-bold">
                <Star className="w-3 h-3 fill-current" />
                <span>{recipe.avgRating.toFixed(1)}</span>
              </div>
            ) : null}
          </div>
          
          <p className="text-sm text-neutral-foreground line-clamp-2 mb-4 flex-1">
            {recipe.shortDescription || 'A delicious and easy-to-make recipe that you will absolutely love.'}
          </p>
          
          <div className="flex items-center gap-4 text-xs font-medium text-neutral-foreground pt-4 border-t border-border mt-auto">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{recipe.cookTimeMinutes} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-accent" />
              <span className="capitalize">{recipe.difficulty}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

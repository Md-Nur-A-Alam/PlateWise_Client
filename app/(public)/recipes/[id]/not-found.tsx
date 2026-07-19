import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ChefHat } from 'lucide-react';

export default function RecipeNotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <ChefHat className="w-12 h-12 text-neutral-foreground" />
      </div>
      <h1 className="text-4xl font-bold mb-4">Recipe Not Found</h1>
      <p className="text-xl text-neutral-foreground mb-8 max-w-md mx-auto">
        We couldn't find the recipe you're looking for. It may have been deleted or the URL is incorrect.
      </p>
      <Link href="/recipes">
        <Button size="lg">Explore Recipes</Button>
      </Link>
    </div>
  );
}

import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { Clock, ChefHat, Info } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { RecipeCard } from '@/components/ui/RecipeCard';
import { ImageGallery, ReviewsSection, ViewTracker } from './ClientComponents';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

async function getRecipeData(id: string) {
  try {
    const res = await fetch(`${SERVER_URL}/api/recipes/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch recipe');
    }
    const data = await res.json();
    return data.data; // { recipe, related, reviews }
  } catch (error) {
    throw error;
  }
}

export default async function RecipeDetailsPage({ params }: { params: { id: string } }) {
  const data = await getRecipeData(params.id);
  
  if (!data || !data.recipe) {
    notFound();
  }

  const { recipe, related, reviews } = data;
  
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.toString().includes('better-auth');

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* View Tracking (Fire & Forget, only if authenticated) */}
      {isAuthenticated && <ViewTracker recipeId={recipe._id} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Images */}
        <div>
          <ImageGallery images={recipe.images || []} title={recipe.title} />
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{recipe.title}</h1>
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="default" className="bg-primary hover:bg-primary/90 text-sm py-1 px-3">
                {recipe.cuisine}
              </Badge>
              
              <div className="flex items-center gap-1.5 text-neutral-foreground text-sm font-medium">
                <Clock className="w-4 h-4" />
                <span>{recipe.cookTimeMinutes} min</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-neutral-foreground text-sm font-medium capitalize">
                <ChefHat className="w-4 h-4" />
                <span>{recipe.difficulty}</span>
              </div>
            </div>

            <p className="text-lg text-neutral-foreground leading-relaxed mb-6">
              {recipe.fullDescription || recipe.shortDescription}
            </p>

            {recipe.dietType && recipe.dietType.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {recipe.dietType.map((diet: string) => (
                  <Badge key={diet} variant="outline" className="border-primary/30 text-primary">
                    {diet}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="bg-muted/30 rounded-2xl p-6 mb-8 border border-border">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" /> Ingredients
            </h3>
            <ul className="list-disc list-inside space-y-2 text-neutral-foreground">
              {recipe.ingredients?.map((ingredient: string, idx: number) => (
                <li key={idx} className="leading-relaxed">{ingredient}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Instructions Section */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold mb-8">Instructions</h3>
        {/* The instructions could be an array if it was modeled that way, but schema says it's inside fullDescription or we just don't have a distinct instructions array. Let's simulate an instruction list if it's missing, or assume fullDescription is the instructions if there is no separate field. The schema has fullDescription. Let's just render fullDescription as paragraphs. */}
        <div className="prose prose-neutral dark:prose-invert max-w-none text-neutral-foreground leading-relaxed">
          {recipe.fullDescription?.split('\n').map((para: string, idx: number) => (
            <p key={idx} className="mb-4">{para}</p>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewsSection 
        recipeId={recipe._id} 
        reviews={reviews || []} 
        isAuthenticated={isAuthenticated} 
      />

      {/* Related Recipes Section */}
      {related && related.length > 0 && (
        <div className="mt-20 pt-10 border-t border-border">
          <h3 className="text-2xl font-bold mb-8">You Might Also Like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((relRecipe: any) => (
              <RecipeCard key={relRecipe._id} recipe={relRecipe} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function RecipeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-24 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-12 h-12 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold mb-4">Something went wrong!</h1>
      <p className="text-lg text-neutral-foreground mb-8 max-w-md mx-auto">
        We encountered an error while trying to load this recipe.
      </p>
      <Button onClick={() => reset()} variant="primary" size="lg">
        Try Again
      </Button>
    </div>
  );
}

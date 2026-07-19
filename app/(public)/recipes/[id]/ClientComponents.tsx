"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { recordViewInteraction, submitReview } from '@/app/actions/recipe';
import { RatingStars } from '@/components/ui/RatingStars';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { notify } from '@/lib/notify';
import Link from 'next/link';

export function ViewTracker({ recipeId }: { recipeId: string }) {
  useEffect(() => {
    // Fire and forget
    recordViewInteraction(recipeId);
  }, [recipeId]);
  return null;
}

export function ImageGallery({ images, title }: { images: string[], title: string }) {
  const [activeImage, setActiveImage] = useState(images[0] || 'https://images.unsplash.com/photo-1495195134817-a165d42e6bc1?q=80&w=800&auto=format&fit=crop');

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
        <Image 
          src={activeImage} 
          alt={title} 
          fill 
          className="object-cover transition-opacity duration-500"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <button 
              key={idx} 
              onClick={() => setActiveImage(img)}
              className={`relative aspect-square rounded-xl overflow-hidden bg-muted transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary ${activeImage === img ? 'ring-2 ring-primary ring-offset-2 opacity-100 scale-105' : 'opacity-70 hover:opacity-100'}`}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" sizes="20vw" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReviewsSection({ 
  recipeId, 
  reviews, 
  isAuthenticated 
}: { 
  recipeId: string, 
  reviews: any[], 
  isAuthenticated: boolean 
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      notify.error("Please select a rating");
      return;
    }
    
    setIsSubmitting(true);
    const result = await submitReview(recipeId, rating, comment);
    setIsSubmitting(false);

    if (result.success) {
      notify.success("Review submitted successfully!");
      setRating(0);
      setComment('');
    } else {
      notify.error(result.error);
    }
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-8">Reviews ({reviews.length})</h3>
      
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-10 bg-muted/20 p-6 rounded-xl border border-border">
          <h4 className="font-semibold mb-4">Leave a Review</h4>
          <div className="mb-4">
            <RatingStars 
              value={rating} 
              onChange={setRating} 
              readonly={false} 
              size="lg" 
            />
          </div>
          <Textarea 
            placeholder="Share your thoughts about this recipe..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-4 bg-background"
            rows={4}
          />
          <Button type="submit" isLoading={isSubmitting}>Submit Review</Button>
        </form>
      ) : (
        <div className="mb-10 bg-muted/20 p-6 rounded-xl border border-border text-center">
          <p className="mb-4 text-neutral-foreground">You must be logged in to leave a review.</p>
          <Link href="/login">
            <Button variant="outline">Log in to review</Button>
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-neutral-foreground italic">No reviews yet. Be the first to try this recipe!</p>
        ) : (
          reviews.map((review, idx) => (
            <div key={idx} className="pb-6 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {(review.userId?.name || review.user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{review.userId?.name || review.user?.name || 'Unknown User'}</p>
                  <RatingStars value={review.rating} readonly size="sm" />
                </div>
                <span className="ml-auto text-xs text-neutral-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="text-neutral-foreground ml-13 mt-2">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

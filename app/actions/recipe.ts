"use server";

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function submitReview(recipeId: string, rating: number, comment: string) {
  try {
    const SERVER_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!SERVER_URL) throw new Error("NEXT_PUBLIC_API_URL is missing in environment variables");

    const cookieStore = await cookies();
    const token = cookieStore.get('better-auth.session_token')?.value || '';

    const res = await fetch(`${SERVER_URL}/api/recipes/${recipeId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, comment }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.message || 'Failed to submit review' };
    }

    revalidatePath(`/recipes/${recipeId}`);
    return { success: true, data: data.data };
  } catch (error: any) {
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

export async function recordViewInteraction(recipeId: string) {
  try {
    const SERVER_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!SERVER_URL) throw new Error("NEXT_PUBLIC_API_URL is missing in environment variables");

    const cookieStore = await cookies();
    const token = cookieStore.get('better-auth.session_token')?.value || '';

    // The API might reject this if there's no auth cookie, so we can just fire-and-forget.
    await fetch(`${SERVER_URL}/api/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ recipeId, type: 'view' }),
    });
    
    // We don't need to revalidate path for just a view interaction.
  } catch (error) {
    console.error("Failed to record view interaction:", error);
  }
}

export async function createRecipe(recipeData: any) {
  try {
    const SERVER_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!SERVER_URL) throw new Error("NEXT_PUBLIC_API_URL is missing in environment variables");

    const cookieStore = await cookies();
    const token = cookieStore.get('better-auth.session_token')?.value || '';

    const res = await fetch(`${SERVER_URL}/api/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(recipeData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.message || 'Failed to create recipe' };
    }

    revalidatePath('/recipes');
    revalidatePath('/recipes/manage');
    return { success: true, data: data.data };
  } catch (error: any) {
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

export async function deleteRecipe(recipeId: string) {
  try {
    const SERVER_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!SERVER_URL) throw new Error("NEXT_PUBLIC_API_URL is missing in environment variables");

    const cookieStore = await cookies();
    const token = cookieStore.get('better-auth.session_token')?.value || '';

    const res = await fetch(`${SERVER_URL}/api/recipes/${recipeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.message || 'Failed to delete recipe' };
    }

    revalidatePath('/recipes');
    revalidatePath('/recipes/manage');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

"use server";

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

export async function submitReview(recipeId: string, rating: number, comment: string) {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const res = await fetch(`${SERVER_URL}/api/recipes/${recipeId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
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
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    // The API might reject this if there's no auth cookie, so we can just fire-and-forget.
    await fetch(`${SERVER_URL}/api/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
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
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const res = await fetch(`${SERVER_URL}/api/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
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
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const res = await fetch(`${SERVER_URL}/api/recipes/${recipeId}`, {
      method: 'DELETE',
      headers: {
        'Cookie': cookieHeader,
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

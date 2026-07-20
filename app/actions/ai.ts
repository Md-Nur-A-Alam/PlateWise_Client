"use server";

import { cookies } from 'next/headers';

export async function generateRecipe(input: {
  ingredients: string[];
  cuisine: string;
  servings: number;
  length: 'short' | 'detailed';
}) {
  try {
    const SERVER_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!SERVER_URL) throw new Error("NEXT_PUBLIC_API_URL is missing in environment variables");

    const cookieStore = await cookies();
    const token = cookieStore.get('better-auth.session_token')?.value || '';

    const res = await fetch(`${SERVER_URL}/api/ai/generate-recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.message || 'Failed to generate recipe from AI' };
    }

    return { success: true, data: data.data };
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return { success: false, error: 'An unexpected error occurred while communicating with the AI service' };
  }
}

export async function getRecommendations(filters: { dietType?: string, maxCookTime?: number } = {}) {
  try {
    const SERVER_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!SERVER_URL) throw new Error("NEXT_PUBLIC_API_URL is missing in environment variables");

    const cookieStore = await cookies();
    const token = cookieStore.get('better-auth.session_token')?.value || '';

    const queryParams = new URLSearchParams();
    if (filters.dietType) queryParams.append('dietType', filters.dietType);
    if (filters.maxCookTime) queryParams.append('maxCookTime', filters.maxCookTime.toString());

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const res = await fetch(`${SERVER_URL}/api/ai/recommendations${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      // Recommendation queries can take a few seconds due to batched Gemini call
      // No explicit timeout needed here as fetch defaults are usually long enough, but keep it in mind
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.message || 'Failed to fetch recommendations' };
    }

    return { success: true, data: data.data };
  } catch (error: any) {
    console.error("AI Recommendations Error:", error);
    return { success: false, error: 'An unexpected error occurred while fetching recommendations' };
  }
}

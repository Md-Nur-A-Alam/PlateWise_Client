"use server";

import { cookies } from 'next/headers';

export async function uploadImageAction(formData: FormData) {
  try {
    const SERVER_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!SERVER_URL) throw new Error("NEXT_PUBLIC_API_URL is missing in environment variables");

    const cookieStore = await cookies();
    const token = cookieStore.get('better-auth.session_token')?.value || '';

    // FormData comes directly from the client with the file appended as 'image'
    // Forward it directly to Express
    const res = await fetch(`${SERVER_URL}/api/uploads/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Do not set Content-Type here, let fetch automatically set it to multipart/form-data with the correct boundary
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.message || 'Failed to upload image' };
    }

    return { success: true, url: data.data.url };
  } catch (error: any) {
    console.error("Upload Error:", error);
    return { success: false, error: error.message || 'An unexpected error occurred during upload' };
  }
}

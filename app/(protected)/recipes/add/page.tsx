"use client";

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Trash2, UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';

import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CUISINES } from '@/constants/cuisines';
import { DIET_TYPES } from '@/constants/dietTypes';
import { notify } from '@/lib/notify';
import { uploadImageAction } from '@/app/actions/upload';
import { createRecipe } from '@/app/actions/recipe';

const recipeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters'),
  fullDescription: z.string().min(20, 'Full description/instructions must be at least 20 characters'),
  cuisine: z.string().min(1, 'Please select a cuisine'),
  dietType: z.array(z.string()).min(1, 'Select at least one diet type'),
  cookTimeMinutes: z.number({ message: 'Cook time is required' }).min(1, 'Cook time must be at least 1 minute'),
  difficulty: z.enum(['easy', 'medium', 'hard'] as const, { message: 'Please select difficulty' }),
  ingredients: z.array(z.object({
    value: z.string().min(2, 'Ingredient cannot be empty')
  })).min(1, 'Add at least one ingredient'),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  status: 'uploading' | 'success' | 'error';
}

export default function AddRecipePage() {
  const router = useRouter();
  const [images, setImages] = React.useState<UploadedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      ingredients: [{ value: '' }],
      dietType: [],
    }
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: "ingredients"
  });

  const selectedDietTypes = watch('dietType');
  const isUploading = images.some(img => img.status === 'uploading');

  const toggleDietType = (type: string) => {
    const current = selectedDietTypes || [];
    if (current.includes(type)) {
      setValue('dietType', current.filter(t => t !== type), { shouldValidate: true });
    } else {
      setValue('dietType', [...current, type], { shouldValidate: true });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Add to state as uploading immediately
    const newImages = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file), // Temp URL for preview if we want, but we show loading
      file,
      status: 'uploading' as const
    }));
    
    setImages(prev => [...prev, ...newImages]);

    // Upload each file
    for (const img of newImages) {
      await uploadSingleImage(img);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const [imageUrlInput, setImageUrlInput] = React.useState('');

  const uploadSingleImage = async (img: UploadedImage) => {
    if (!img.file) return;
    const formData = new FormData();
    formData.append('image', img.file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/uploads/image`, {
        method: 'POST',
        body: formData,
        credentials: 'include' // Sends the session cookie directly
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setImages(prev => prev.map(p => p.id === img.id ? { ...p, status: 'success', url: data.data.url } : p));
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (err: any) {
      notify.error(`Failed to upload ${img.file.name}: ${err.message}`);
      setImages(prev => prev.map(p => p.id === img.id ? { ...p, status: 'error' } : p));
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      url: imageUrlInput.trim(),
      status: 'success'
    }]);
    setImageUrlInput('');
  };

  const retryUpload = (id: string) => {
    const img = images.find(i => i.id === id);
    if (img && img.file) {
      setImages(prev => prev.map(p => p.id === id ? { ...p, status: 'uploading' } : p));
      uploadSingleImage(img);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(i => i.id !== id));
  };

  const onSubmit = async (data: RecipeFormValues) => {
    const validImages = images.filter(i => i.status === 'success').map(i => i.url);
    if (validImages.length === 0) {
      notify.error("Please upload at least one image.");
      return;
    }

    if (isUploading) {
      notify.error("Please wait for all images to finish uploading.");
      return;
    }

    setIsSubmitting(true);
    
    const recipeData = {
      ...data,
      ingredients: data.ingredients.map(i => i.value),
      images: validImages
    };

    const res = await createRecipe(recipeData);
    
    if (res.success) {
      notify.success("Recipe published successfully!");
      router.push('/recipes/manage');
    } else {
      notify.error(res.error || "Failed to publish recipe");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create New Recipe</h1>
        <p className="text-neutral-foreground mt-2">Share your delicious creations with the PlateWise community.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Basic Info Card */}
        <Card className="p-6 md:p-8 glass space-y-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-border/50 pb-2">
            <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span> 
            Basic Information
          </h2>
          
          <Input 
            label="Recipe Title" 
            placeholder="e.g. Grandma's Famous Lasagna" 
            {...register('title')} 
            error={errors.title?.message}
          />
          
          <Textarea 
            label="Short Description" 
            placeholder="A brief summary of what makes this recipe special..." 
            rows={2}
            {...register('shortDescription')} 
            error={errors.shortDescription?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Select label="Cuisine" {...register('cuisine')} error={errors.cuisine?.message}>
              <option value="">Select Cuisine...</option>
              {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            
            <Input 
              type="number" 
              label="Cook Time (Minutes)" 
              placeholder="45" 
              {...register('cookTimeMinutes', { valueAsNumber: true })} 
              error={errors.cookTimeMinutes?.message}
            />

            <Select label="Difficulty" {...register('difficulty')} error={errors.difficulty?.message}>
              <option value="">Select Difficulty...</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Dietary Types</label>
            <div className="flex flex-wrap gap-2">
              {DIET_TYPES.map(type => {
                const isActive = selectedDietTypes?.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleDietType(type)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                      isActive 
                        ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]' 
                        : 'bg-background/50 border-border/50 text-neutral-foreground hover:border-primary/50'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
            {errors.dietType && <p className="text-sm text-red-500 mt-2 animate-fade-in-up">{errors.dietType.message}</p>}
          </div>
        </Card>

        {/* Ingredients & Instructions Card */}
        <Card className="p-6 md:p-8 glass space-y-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-border/50 pb-2">
             <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span> 
             Ingredients & Instructions
          </h2>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-foreground">Ingredients</label>
            </div>
            <div className="space-y-3">
              {ingredientFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="flex-1">
                    <Input 
                      placeholder={`e.g. 2 cups of flour`}
                      {...register(`ingredients.${index}.value` as const)}
                      error={errors.ingredients?.[index]?.value?.message}
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-11 w-11 p-0 shrink-0 border border-border/50 bg-background/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredientFields.length === 1}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="mt-3 gap-2"
              onClick={() => appendIngredient({ value: '' })}
            >
              <Plus className="w-4 h-4" /> Add Ingredient
            </Button>
            {errors.ingredients?.root && <p className="text-sm text-red-500 mt-2">{errors.ingredients.root.message}</p>}
          </div>

          <Textarea 
            label="Cooking Instructions" 
            placeholder="Step 1: Preheat oven to 350°F..." 
            rows={6}
            {...register('fullDescription')} 
            error={errors.fullDescription?.message}
          />
        </Card>

        {/* Images Card */}
        <Card className="p-6 md:p-8 glass space-y-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-border/50 pb-2">
             <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span> 
             Media
          </h2>
          
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Recipe Images <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {images.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border/50 group">
                  {img.status === 'uploading' && (
                    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                      <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
                      <span className="text-xs font-medium">Uploading...</span>
                    </div>
                  )}
                  {img.status === 'error' && (
                    <div className="absolute inset-0 bg-destructive/10 flex flex-col items-center justify-center z-10 p-2 text-center">
                      <span className="text-xs text-destructive font-bold mb-2">Upload Failed</span>
                      <Button type="button" size="sm" variant="danger" className="text-[10px] h-6 px-2" onClick={() => retryUpload(img.id)}>Retry</Button>
                    </div>
                  )}
                  {img.status === 'success' && (
                    <Image src={img.url} alt="Recipe preview" fill className="object-cover" />
                  )}
                  <button 
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer text-primary"
              >
                <ImageIcon className="w-8 h-8 mb-2 opacity-80" />
                <span className="text-xs font-semibold">Add Image</span>
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              multiple 
              onChange={handleFileChange} 
            />
            
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm font-medium text-neutral-foreground">OR</span>
              <div className="flex-1 flex gap-2">
                <Input 
                  placeholder="Paste image URL here..." 
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImageUrl())}
                />
                <Button type="button" variant="secondary" onClick={handleAddImageUrl}>
                  Add URL
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-neutral-foreground mt-4">Upload at least one high-quality image or provide a direct link to an image.</p>
          </div>
        </Card>

        <div className="flex justify-end pt-4 border-t border-border/50">
          <Button 
            type="submit" 
            size="lg" 
            disabled={isSubmitting || isUploading}
            isLoading={isSubmitting}
            className="w-full sm:w-auto min-w-[200px]"
          >
            {isUploading ? 'Images Uploading...' : 'Publish Recipe'}
          </Button>
        </div>
      </form>
    </div>
  );
}

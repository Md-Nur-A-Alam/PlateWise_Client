"use client";

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Sparkles, Plus, Trash2, Loader2, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { CUISINES } from '@/constants/cuisines';
import { DIET_TYPES } from '@/constants/dietTypes';
import { notify } from '@/lib/notify';
import { generateRecipe } from '@/app/actions/ai';
import { createRecipe } from '@/app/actions/recipe';
import { uploadImageAction } from '@/app/actions/upload';

// 1. Prompt Phase Schema
const promptSchema = z.object({
  ingredients: z.array(z.object({ value: z.string().min(2, 'Ingredient cannot be empty') })).min(1, 'Add at least one ingredient'),
  cuisine: z.string().min(1, 'Please select a cuisine'),
  servings: z.number().min(1, 'Servings must be at least 1'),
  length: z.enum(['short', 'detailed']),
});
type PromptFormValues = z.infer<typeof promptSchema>;

// 2. Draft Editing Phase Schema (similar to Add Recipe)
const draftSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  shortDescription: z.string().min(10, 'Description is required'),
  fullDescription: z.string().min(20, 'Instructions are required'),
  cuisine: z.string().min(1, 'Cuisine is required'),
  dietType: z.array(z.string()).min(1, 'Select at least one diet type'),
  cookTimeMinutes: z.number({ message: 'Cook time is required' }).min(1),
  difficulty: z.enum(['easy', 'medium', 'hard'] as const),
  ingredients: z.array(z.object({ value: z.string().min(2) })).min(1),
});
type DraftFormValues = z.infer<typeof draftSchema>;

interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  status: 'uploading' | 'success' | 'error';
}

export default function AIGeneratePage() {
  const router = useRouter();

  const [phase, setPhase] = React.useState<'prompt' | 'draft'>('prompt');
  const [aiError, setAiError] = React.useState<string | null>(null);
  
  // Modal for regeneration warning
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = React.useState(false);
  const [hasEditedDraft, setHasEditedDraft] = React.useState(false);

  // Images state
  const [images, setImages] = React.useState<UploadedImage[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isUploading = images.some(img => img.status === 'uploading');

  // PROMPT FORM
  const promptForm = useForm<PromptFormValues>({
    resolver: zodResolver(promptSchema),
    defaultValues: { ingredients: [{ value: '' }], servings: 2, length: 'detailed', cuisine: '' }
  });
  const { fields: promptIngredients, append: appendPromptIngredient, remove: removePromptIngredient } = useFieldArray({
    control: promptForm.control,
    name: "ingredients"
  });

  // DRAFT FORM
  const draftForm = useForm<DraftFormValues>({
    resolver: zodResolver(draftSchema),
    defaultValues: { dietType: [] }
  });
  const { fields: draftIngredients, append: appendDraftIngredient, remove: removeDraftIngredient } = useFieldArray({
    control: draftForm.control,
    name: "ingredients"
  });
  const selectedDietTypes = draftForm.watch('dietType') || [];

  // Track edits
  React.useEffect(() => {
    const subscription = draftForm.watch(() => setHasEditedDraft(true));
    return () => subscription.unsubscribe();
  }, [draftForm.watch]);

  // GENERATE ACTION
  const handleGenerate = async (data: PromptFormValues) => {
    setAiError(null);
    const res = await generateRecipe({
      ingredients: data.ingredients.map(i => i.value),
      cuisine: data.cuisine,
      servings: data.servings,
      length: data.length
    });

    if (res.success && res.data) {
      // Map AI output to draft form
      draftForm.reset({
        title: res.data.title,
        shortDescription: res.data.description,
        fullDescription: res.data.instructions?.join('\n\n') || '',
        ingredients: res.data.ingredients?.map((i: string) => ({ value: i })) || [{ value: '' }],
        cuisine: data.cuisine, // carry over
        dietType: [], // needs user input
        cookTimeMinutes: 30, // placeholder
        difficulty: 'medium'
      });
      setHasEditedDraft(false);
      setPhase('draft');
      setIsRegenerateModalOpen(false);
    } else {
      setAiError(res.error || 'Failed to generate recipe. Please try again.');
    }
  };

  const confirmRegenerate = () => {
    if (hasEditedDraft) {
      setIsRegenerateModalOpen(true);
    } else {
      promptForm.handleSubmit(handleGenerate)();
    }
  };

  // SAVE AS RECIPE ACTION
  const handleSaveDraft = async (data: DraftFormValues) => {
    const validImages = images.filter(i => i.status === 'success').map(i => i.url);
    if (validImages.length === 0) {
      notify.error("Please upload at least one image before saving.");
      return;
    }
    if (isUploading) {
      notify.error("Please wait for all images to finish uploading.");
      return;
    }

    const recipeData = {
      ...data,
      ingredients: data.ingredients.map(i => i.value),
      images: validImages
    };

    const res = await createRecipe(recipeData);
    
    if (res.success) {
      notify.success("AI Recipe published successfully!");
      router.push('/recipes/manage');
    } else {
      notify.error(res.error || "Failed to publish recipe");
    }
  };

  // Image Upload Handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const newFiles = Array.from(e.target.files);
    const newImages = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      file,
      status: 'uploading' as const
    }));
    setImages(prev => [...prev, ...newImages]);
    for (const img of newImages) { await uploadSingleImage(img); }
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
        credentials: 'include'
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

  const removeImage = (id: string) => setImages(prev => prev.filter(i => i.id !== id));
  const retryUpload = (id: string) => {
    const img = images.find(i => i.id === id);
    if (img && img.file) {
      setImages(prev => prev.map(p => p.id === id ? { ...p, status: 'uploading' } : p));
      uploadSingleImage(img);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" /> AI Recipe Generator
        </h1>
        <p className="text-neutral-foreground mt-2">Let our AI chef draft a unique recipe based on what's in your fridge.</p>
      </div>

      {phase === 'prompt' && (
        <Card className="p-6 md:p-8 glass space-y-6 animate-fade-in-up">
          <form onSubmit={promptForm.handleSubmit(handleGenerate)} className="space-y-6">
            
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Ingredients you have</label>
              <div className="space-y-3">
                {promptIngredients.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <Input 
                      placeholder={`e.g. Chicken breast, tomatoes...`}
                      {...promptForm.register(`ingredients.${index}.value` as const)}
                      error={promptForm.formState.errors.ingredients?.[index]?.value?.message}
                    />
                    <Button 
                      type="button" variant="ghost" size="sm" 
                      className="h-11 w-11 p-0 shrink-0 text-destructive hover:bg-destructive/10"
                      onClick={() => removePromptIngredient(index)}
                      disabled={promptIngredients.length === 1}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-3 gap-2" onClick={() => appendPromptIngredient({ value: '' })}>
                <Plus className="w-4 h-4" /> Add Ingredient
              </Button>
              {promptForm.formState.errors.ingredients?.root && <p className="text-sm text-red-500 mt-2">{promptForm.formState.errors.ingredients.root.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select label="Cuisine Style" {...promptForm.register('cuisine')} error={promptForm.formState.errors.cuisine?.message}>
                <option value="">Any Cuisine...</option>
                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              
              <Input 
                type="number" label="Servings" placeholder="2" 
                {...promptForm.register('servings', { valueAsNumber: true })} 
                error={promptForm.formState.errors.servings?.message}
              />

              <Select label="Detail Level" {...promptForm.register('length')} error={promptForm.formState.errors.length?.message}>
                <option value="detailed">Detailed Instructions</option>
                <option value="short">Quick / Short</option>
              </Select>
            </div>

            {aiError && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-start gap-3 border border-destructive/20 animate-fade-in-up">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{aiError}</p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-border/50">
              <Button 
                type="submit" size="lg" className="gap-2 shadow-lg shadow-primary/20"
                isLoading={promptForm.formState.isSubmitting}
              >
                <Sparkles className="w-5 h-5" />
                Generate Recipe
              </Button>
            </div>
          </form>
        </Card>
      )}

      {phase === 'draft' && (
        <div className="space-y-8 animate-fade-in-up">
          <div className="flex justify-between items-center bg-primary/10 border border-primary/20 p-4 rounded-xl">
            <div>
              <h2 className="font-bold text-primary flex items-center gap-2"><Sparkles className="w-4 h-4" /> Draft Ready</h2>
              <p className="text-sm text-neutral-foreground">Review and edit the AI-generated recipe, add images, and save!</p>
            </div>
            <Button 
              variant="outline" size="sm" className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
              onClick={confirmRegenerate}
              isLoading={promptForm.formState.isSubmitting}
            >
              <Sparkles className="w-4 h-4" /> Regenerate
            </Button>
          </div>

          <form onSubmit={draftForm.handleSubmit(handleSaveDraft)} className="space-y-8">
            <Card className="p-6 md:p-8 glass space-y-6">
              <Input label="Recipe Title" {...draftForm.register('title')} error={draftForm.formState.errors.title?.message} />
              <Textarea label="Short Description" rows={2} {...draftForm.register('shortDescription')} error={draftForm.formState.errors.shortDescription?.message} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Select label="Cuisine" {...draftForm.register('cuisine')} error={draftForm.formState.errors.cuisine?.message}>
                  {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
                <Input type="number" label="Cook Time (Mins)" {...draftForm.register('cookTimeMinutes', { valueAsNumber: true })} error={draftForm.formState.errors.cookTimeMinutes?.message} />
                <Select label="Difficulty" {...draftForm.register('difficulty')} error={draftForm.formState.errors.difficulty?.message}>
                  <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Dietary Types</label>
                <div className="flex flex-wrap gap-2">
                  {DIET_TYPES.map(type => {
                    const isActive = selectedDietTypes.includes(type);
                    return (
                      <button
                        key={type} type="button"
                        onClick={() => {
                          const current = selectedDietTypes;
                          if (current.includes(type)) draftForm.setValue('dietType', current.filter(t => t !== type), { shouldValidate: true });
                          else draftForm.setValue('dietType', [...current, type], { shouldValidate: true });
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border ${isActive ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'bg-background/50 border-border/50 text-neutral-foreground hover:border-primary/50'}`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
                {draftForm.formState.errors.dietType && <p className="text-sm text-red-500 mt-2">{draftForm.formState.errors.dietType.message}</p>}
              </div>
            </Card>

            <Card className="p-6 md:p-8 glass space-y-6">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Ingredients</label>
                <div className="space-y-3">
                  {draftIngredients.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                      <Input {...draftForm.register(`ingredients.${index}.value` as const)} error={draftForm.formState.errors.ingredients?.[index]?.value?.message} />
                      <Button type="button" variant="ghost" size="sm" className="h-11 w-11 p-0 shrink-0 text-destructive hover:bg-destructive/10" onClick={() => removeDraftIngredient(index)} disabled={draftIngredients.length === 1}>
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-3 gap-2" onClick={() => appendDraftIngredient({ value: '' })}><Plus className="w-4 h-4" /> Add Ingredient</Button>
              </div>
              <Textarea label="Instructions" rows={8} {...draftForm.register('fullDescription')} error={draftForm.formState.errors.fullDescription?.message} />
            </Card>

            <Card className="p-6 md:p-8 glass space-y-6">
               <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-border/50 pb-2">Recipe Images <span className="text-red-500">*</span></h2>
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
                      {img.status === 'success' && <Image src={img.url} alt="Recipe preview" fill className="object-cover" />}
                      <button type="button" onClick={() => removeImage(img.id)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-destructive">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer text-primary">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-80" />
                    <span className="text-xs font-semibold">Add Image</span>
                  </button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                
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

                <p className="text-xs text-neutral-foreground mt-4">Upload at least one image or provide a direct link before saving.</p>
            </Card>

            <div className="flex justify-end pt-4 border-t border-border/50 gap-4">
              <Button type="button" variant="ghost" onClick={() => setPhase('prompt')}>Discard Draft</Button>
              <Button type="submit" size="lg" disabled={draftForm.formState.isSubmitting || isUploading} isLoading={draftForm.formState.isSubmitting}>
                {isUploading ? 'Uploading Images...' : 'Save as Recipe'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Regenerate Warning Modal */}
      <Modal isOpen={isRegenerateModalOpen} onClose={() => setIsRegenerateModalOpen(false)} title="Discard Edits?">
        <div className="space-y-6">
          <p className="text-neutral-foreground">You have made edits to the current draft. Generating a new recipe will overwrite all your changes. Are you sure you want to proceed?</p>
          <div className="flex justify-end gap-4">
            <Button variant="ghost" onClick={() => setIsRegenerateModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => promptForm.handleSubmit(handleGenerate)()}>Yes, Overwrite</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

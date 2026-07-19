"use client";

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Utensils, Star, CheckCircle, Plus, BookOpen, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { RecipeCard } from '@/components/ui/RecipeCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { notify } from '@/lib/notify';
import { CUISINES } from '../../constants/cuisines';

// Recharts components
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [recipes, setRecipes] = React.useState<any[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = React.useState(true);
  
  const [stats, setStats] = React.useState<{ totalRecipes: number; totalReviews: number; totalCuisines: number } | null>(null);
  const [reviews, setReviews] = React.useState<any[]>([]);
  
  const [email, setEmail] = React.useState('');
  const [isSubscribing, setIsSubscribing] = React.useState(false);

  // FAQ State
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Fetch Featured Recipes
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/recipes?sort=rating&limit=4`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setRecipes(data.data.recipes);
        setIsLoadingRecipes(false);
      })
      .catch(() => setIsLoadingRecipes(false));

    // Fetch Stats
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/stats`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.data);
      })
      .catch(console.error);

    // Fetch Reviews (using recipes endpoint to get top rated recipes then simulating reviews for them, or fetching directly if we had a /api/reviews endpoint. Wait, I should fetch real reviews. I didn't add GET /api/reviews in misc. I'll just fetch recipes and use their mock reviews, or let me add a quick GET /api/reviews in misc.routes.ts later. For now, let's fetch recipes and assume we can pull some data)
    // Actually, I'll add a quick GET /api/reviews endpoint in the next step, for now I'll prepare the fetch.
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/reviews/recent`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setReviews(data.data);
      })
      .catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/recipes?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubscribing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        notify.success('Subscribed successfully!');
        setEmail('');
      } else {
        notify.error(data.message || 'Failed to subscribe');
      }
    } catch (err) {
      notify.error('An error occurred while subscribing');
    } finally {
      setIsSubscribing(false);
    }
  };

  const pieData = stats ? [
    { name: 'Recipes', value: stats.totalRecipes },
    { name: 'Reviews', value: stats.totalReviews },
    { name: 'Cuisines', value: stats.totalCuisines * 10 }, // scaled for visibility
  ] : [];
  const COLORS = ['#2563eb', '#16a34a', '#d97706'];

  const faqs = [
    { q: "Is PlateWise free to use?", a: "Yes! PlateWise is completely free. You can browse, save, and even generate AI recipes without a paid subscription." },
    { q: "How does the AI recipe generator work?", a: "We use Google's advanced Gemini AI to create custom recipes based on ingredients you already have in your kitchen." },
    { q: "Can I save my own family recipes?", a: "Absolutely. You can manually add your own recipes, upload images, and organize them into your personal collection." }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden pt-20 pb-16">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="container px-4 mx-auto text-center z-10 animate-fade-in-up">
          <Badge className="mb-6 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors animate-float">
            AI-Powered Culinary Assistant
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 max-w-4xl mx-auto leading-tight drop-shadow-sm">
            Discover & Create the Perfect <br className="hidden md:block"/>
            <span className="text-gradient">Recipe Every Time</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-foreground mb-10 max-w-2xl mx-auto font-medium">
            Join thousands of food lovers using PlateWise to organize their recipes, explore new cuisines, and generate personalized dishes with AI.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-xl mx-auto relative mb-12 flex items-center group">
            <div className="absolute left-4 text-neutral-foreground group-focus-within:text-primary transition-colors z-10">
              <Search className="w-5 h-5" />
            </div>
            <Input 
              type="text" 
              placeholder="Search recipes, cuisines, or ingredients..."
              className="pl-12 pr-32 py-7 text-lg rounded-2xl shadow-xl shadow-primary/5 border-border/50 focus:border-primary focus:ring-primary/20 transition-all glass hover:shadow-2xl hover:shadow-primary/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" className="absolute right-2 rounded-xl px-6 h-11 shadow-sm">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium opacity-90 hover:opacity-100 transition-opacity">
            <span className="text-neutral-foreground">Popular:</span>
            {CUISINES.slice(0, 3).map(c => (
              <Link key={c} href={`/recipes?cuisine=${c}`} className="text-primary hover:underline hover:text-accent transition-colors">{c}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Featured Recipes */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Recipes</h2>
              <p className="text-neutral-foreground">The highest-rated dishes from our community.</p>
            </div>
            <Link href="/recipes?sort=rating">
              <Button variant="outline" className="group">
                View all <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingRecipes ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : recipes.length > 0 ? (
              recipes.map(recipe => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-neutral-foreground">
                No featured recipes found. Check back later!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Cuisine Categories */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Explore by Cuisine</h2>
            <p className="text-neutral-foreground">Travel the world from your kitchen.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {CUISINES.map((cuisine) => (
              <Link key={cuisine} href={`/recipes?cuisine=${cuisine}`}>
                <Card className="group hover:border-primary/50 transition-colors cursor-pointer bg-background overflow-hidden relative h-32 flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <h3 className="font-bold text-lg group-hover:scale-110 transition-transform duration-300 text-foreground">{cuisine}</h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-2">How PlateWise Works</h2>
            <p className="text-neutral-foreground">Your journey to better cooking in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-border z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-sm border border-primary/20">
                <Search className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Browse & Discover</h3>
              <p className="text-neutral-foreground">
                Search through our extensive collection of real, community-rated recipes spanning dozens of cuisines and dietary preferences.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-sm border border-primary/20">
                <Plus className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Save & Generate</h3>
              <p className="text-neutral-foreground">
                Save your favorites to your personal cookbook, or use our Gemini AI to instantly generate unique recipes based on ingredients you already have.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-sm border border-primary/20">
                <Utensils className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Cook & Enjoy</h3>
              <p className="text-neutral-foreground">
                Follow simple, step-by-step instructions. Leave reviews and share your culinary successes with the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Platform Stats */}
      <section className="py-20 bg-muted/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">A Growing Community of Food Lovers</h2>
              <p className="text-lg text-neutral-foreground mb-8">
                PlateWise is constantly expanding with new recipes, cuisines, and genuine reviews from home chefs just like you. Our platform thrives on community interaction and AI-powered creativity.
              </p>
              
              {stats && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-background p-4 rounded-xl border border-border text-center shadow-sm">
                    <p className="text-3xl font-black text-primary mb-1">{stats.totalRecipes}</p>
                    <p className="text-xs font-semibold text-neutral-foreground uppercase tracking-wider">Recipes</p>
                  </div>
                  <div className="bg-background p-4 rounded-xl border border-border text-center shadow-sm">
                    <p className="text-3xl font-black text-green-600 mb-1">{stats.totalReviews}</p>
                    <p className="text-xs font-semibold text-neutral-foreground uppercase tracking-wider">Reviews</p>
                  </div>
                  <div className="bg-background p-4 rounded-xl border border-border text-center shadow-sm">
                    <p className="text-3xl font-black text-amber-600 mb-1">{stats.totalCuisines}</p>
                    <p className="text-xs font-semibold text-neutral-foreground uppercase tracking-wider">Cuisines</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-[350px] w-full bg-background rounded-2xl p-4 border border-border shadow-sm flex items-center justify-center">
              {stats ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center text-neutral-foreground space-y-4">
                  <Skeleton className="w-48 h-48 rounded-full" />
                  <Skeleton className="w-32 h-4" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. What People Are Cooking (Reviews) */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-2">What People Are Cooking</h2>
            <p className="text-neutral-foreground">Real feedback from our community.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.length > 0 ? reviews.slice(0, 3).map((review, i) => (
              <Card key={i} className="h-full flex flex-col p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-1 text-yellow-500 mb-4">
                  {Array(5).fill(0).map((_, j) => (
                    <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'fill-current' : 'text-neutral-muted'}`} />
                  ))}
                </div>
                <p className="italic text-foreground mb-6 flex-1">"{review.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {(review.user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{review.user?.name || 'Unknown User'}</p>
                    <p className="text-xs text-neutral-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            )) : (
              // Fallback skeleton if no reviews yet
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="w-24 h-4 mb-4" />
                  <Skeleton className="w-full h-16 mb-6" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div>
                      <Skeleton className="w-20 h-4 mb-1" />
                      <Skeleton className="w-16 h-3" />
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 7. Newsletter Signup & 8. FAQ combined in a grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* FAQ */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div 
                    key={index} 
                    className="border border-border bg-background rounded-lg overflow-hidden transition-all duration-300"
                  >
                    <button 
                      className="w-full px-6 py-4 text-left flex justify-between items-center font-semibold focus:outline-none focus:bg-muted/50 hover:bg-muted/30 transition-colors"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    >
                      {faq.q}
                      {openFaq === index ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-neutral-foreground" />}
                    </button>
                    <div 
                      className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 py-4 border-t border-border' : 'max-h-0'}`}
                    >
                      <p className="text-neutral-foreground text-sm">{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20 flex flex-col justify-center text-center lg:text-left">
              <h2 className="text-2xl font-bold mb-3">Stay Inspired</h2>
              <p className="text-neutral-foreground mb-6">
                Subscribe to our newsletter for weekly recipe recommendations, cooking tips, and AI generated culinary experiments!
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                <Input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="flex-1 bg-background"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" isLoading={isSubscribing} className="whitespace-nowrap">
                  Subscribe <Send className="w-4 h-4 ml-2" />
                </Button>
              </form>
              <p className="text-xs text-neutral-foreground mt-4">We respect your privacy. No spam ever.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to transform your cooking?</h2>
          <p className="text-lg md:text-xl opacity-90 mb-10">
            Join PlateWise today and start building your personal, AI-powered recipe collection.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto font-bold px-8">
                Create Free Account
              </Button>
            </Link>
            <Link href="/recipes">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                Explore Recipes
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Badge component inline for Hero (since I might not have imported it properly if it's not in index.tsx)
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </span>
  )
}

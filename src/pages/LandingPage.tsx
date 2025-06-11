import React from 'react';
import CountUp from 'react-countup';
import { Link } from 'react-router-dom';
import { QrCode, BarChart2, Zap, Check, ArrowRight, Star, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { getAssetUrl, getLogoUrl } from '@/lib/utils';
import logoUrl from '../assets/djr.png'
const features = [
  {
    icon: QrCode,
    title: 'Smart QR Codes',
    description: 'Generate dynamic QR codes that let your audience request songs instantly from their phones',
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'Watch song requests roll in live and keep your finger on the pulse of the crowd',
  },
  {
    icon: BarChart2,
    title: 'Request Analytics',
    description: 'Track popular songs, analyze trends, and make data-driven decisions about your setlist',
  },
  {
    icon: Users,
    title: 'Crowd Engagement',
    description: 'Let your audience vote on songs and shape the vibe of your event together',
  },
];

const testimonials = [
  {
    quote: "WheresMySong has completely transformed how I handle song requests. No more paper slips or shouted requests - it's all organized and digital now.",
    author: "DJ Mike Thompson",
    role: "Club DJ",
    rating: 5,
  },
  {
    quote: "The real-time voting system is genius. I can instantly see what songs are trending with the crowd.",
    author: "DJ Sarah Rodriguez",
    role: "Wedding DJ",
    rating: 5,
  },
  {
    quote: "Finally, an app that understands what DJs actually need. The analytics help me prepare better for each event.",
    author: "DJ Chris Parker",
    role: "Event DJ",
    rating: 5,
  },
];

export default function LandingPage() {
  const heroImageUrl = supabase.storage
    .from('assets')
    .getPublicUrl('hero-pic.png')
    .data.publicUrl;
  
  const logoUrl = getAssetUrl('mascot.png');

  return (
    <div className="min-h-screen bg-gradient-welcome">
      {/* Navigation */}
      <nav className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <img src={logoUrl} alt="WheresMySong" className="sm:h-8 sm:w-8 h-7 w-7" />
              <span className=" text-md lg:text-2xl font-bold">WheresMySong</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </a>
              <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Log in
            </Link>
            <Link to="/login" >
            <button className='bg-purple-700 p-2 sm:p-2 rounded-lg text-xs sm:text-sm'>Get Started</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 mt-5">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Your Crowd, Your Playlist
          </h1>

          {/* Hero Image */}
          <div className="relative w-full max-w-sm mx-auto mb-2 md:mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-full filter blur-3xl"></div>
            <img
              src="/logo.png"
              alt="DJ Platform"
              className="relative w-4/5 h-auto rounded-lg shadow-xl mx-auto"
            />
          </div>

          <p className="text-xl md:text-2xl text-muted-foreground mb-6 md:mb-8">
            Transform how you handle song requests with our smart DJ platform. 
            Let your audience engage through QR codes and watch the magic happen in real-time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                See How It Works
              </Button>
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="gradient-bg-card p-6 rounded-xl shadow-card">
            <div className="text-4xl font-bold text-primary mb-2">
              <CountUp start={5000} end={10000} duration={3} delay={2} className='text-4xl font-bold text-primary mb-2'/>+</div>
            <div  className="text-slate-800 text-xl font-bold">Events Powered</div>
          </div>
          <div className="gradient-bg-card p-6 rounded-xl shadow-card">
            <div className="text-4xl font-bold text-primary mb-2">1M+</div>
            <div className="text-slate-800 text-xl font-bold">Song Requests</div>
          </div>
          <div className="gradient-bg-card p-6 rounded-xl shadow-card">
            <div className="text-4xl font-bold text-primary mb-2">98%</div>
            <div className="text-slate-800 text-xl font-bold">Happy DJs</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Everything You Need to Rock the Party
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <div 
              key={feature.title} 
              className={`gradient-bg-card p-8 rounded-xl shadow-card hover-lift ${
                index % 2 === 0 ? '' : ''
              }`}
            >
              <div className="flex items-start gap-6">
                <feature.icon className="sm:h-12 sm:w-12 text-primary flex-shrink-0" />
                <div>
                  <h3 className="text-xl text-slate-900 font-rajdhani font-bold mb-4">{feature.title}</h3>
                  <p className="text-slate-800 text-xl font-semibold">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Loved by DJs Worldwide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div  key={index} className="gradient-bg-card p-8 rounded-xl shadow-card">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <blockquote className="text-lg mb-6 text-slate-800 font-semibold">{testimonial.quote}</blockquote>
              <div>
                <div className="font-semibold text-slate-900">{testimonial.author}</div>
                <div className="text-sm text-slate-900">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-24">
        <div className="bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IHgxPSI4MS4yNyUiIHkxPSI4MS4yNyUiIHgyPSIwJSIgeTI9IjAlIiBpZD0iYSI+PHN0b3Agc3RvcC1jb2xvcj0iI0ZGRiIgc3RvcC1vcGFjaXR5PSIwIiBvZmZzZXQ9IjAlIi8+PHN0b3Agc3RvcC1jb2xvcj0iI0ZGRiIgc3RvcC1vcGFjaXR5PSIuMDUiIG9mZnNldD0iMTAwJSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik0wIDBoMjB2MjBIMHoiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')] opacity-50"></div>
          <div className="relative">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your DJ Experience?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of DJs who are already using WheresMySong to create unforgettable events.
              Start your free trial today.
            </p>
            <Link to="/login">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="WheresMySong" className="h-6 w-6" />
            <span className="text-xl font-bold">WheresMySong</span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} WheresMySong. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
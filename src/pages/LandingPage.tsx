import { useState } from 'react';
import CountUp from 'react-countup';
import { Link } from 'react-router-dom';
import { QrCode, BarChart2, Zap, ArrowRight, Star, Users, Sparkles, Check, CreditCard,} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAssetUrl,  } from '@/lib/utils';


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
    quote: "I used this app for a wedding gig last weekend. A game changer. ",
    author: "Mike Toney.",
    role: "Club & Wedding DJ",
    rating: 5,
    image: "/images/djs/dj3.jpg"
  },
 {
    quote: "I like that it doesn’t just collect requests, it shows trends. I played a corporate event and could tell what genre the crowd leaned into. Super helpful for adapting the setlist.",
    author: "Chris P.",
    role: "Event DJ",
    rating: 5,
    image: "/images/djs/dj2.jpeg"
  }, {
    quote: "Honestly, I wasn’t sure at first. But after trying it out at a birthday party, the live voting was a hit. People enjoyed it too.",
    author: "Jenna Lee.",
    role: "Private Events DJ",
    rating: 5,
    image: "/images/djs/dj1.jpg"
   
  },
];

const plan = {
  name: 'Pro',
  priceMonthly: '$9.99',
  priceYearly: '$99.99',
  savePercent: 17,
  description: 'Everything you need for regular gigs',
  features: [
    'Unlimited events',
    'Pre-event song requests',
    'Basic analytics',
    'Priority support',
    'Custom event URLs',
  ],
 
};

export default function LandingPage() {
  const logoUrl = getAssetUrl('wheresmysong3d.png');
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-welcome">
      {/* Navigation */}
      <nav className="container mx-auto px-2 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <img src={logoUrl} alt="WheresMySong" className="sm:h-8 sm:w-8 h-7 w-7" />
              <span className=" text-md lg:text-xl font-bold">WheresMySong</span>
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
      <section className="container mx-auto px-4 sm:px-6 md:px-0 mt-5">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-300">
            Your Crowd, Your Playlist 
          </h1>

          {/* Hero Image */}
          <div className="relative w-full max-w-sm mx-auto mb-2 md:mb-8 md:mt-3 lg:mt-12">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-full filter blur-3xl"></div>
            <img
              src='/logo.png'
              alt="DJ Platform"
              className="relative w-4/5 h-auto rounded-lg shadow-xl mx-auto "
            />
          </div>
           
          <p className="text-xl md:text-2xl text-muted-foreground mb-6 md:mb-8">
            Transform how you handle song requests with our smart DJ platform. 
            Let your audience engage through QR codes and watch the magic happen in real-time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-8 lg:mt-3">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24  lg:px-20 ">
          <div className="bg-gradient-to-b from-slate-200 to-purple-200 p-6 rounded-xl shadow-card">
            <div className="text-4xl font-bold text-primary mb-2">
              <CountUp start={964} end={1426} duration={3} delay={2} className='text-4xl font-bold text-primary mb-2'/>+</div>
            <div  className="text-slate-900 text-xl font-bold">Events Powered</div>
          </div>
          <div className="bg-gradient-to-b from-slate-200 to-purple-200 p-6 rounded-xl shadow-card">
            <div className="text-4xl font-bold text-primary mb-2">23K+</div>
            <div className="text-slate-900 text-xl font-bold">Song Requests</div>
          </div>
          <div className="bg-gradient-to-b from-slate-200 to-purple-200 p-6 rounded-xl shadow-card">
            <div className="text-4xl font-bold text-primary mb-2">98%</div>
            <div className="text-slate-900 text-xl font-bold">Happy DJs</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-20 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Everything You Need to Rock the Party
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <div 
              key={feature.title} 
              className={`bg-gradient-to-b from-slate-200 to-purple-200 p-8 rounded-xl shadow-card hover-lift ${
                index % 2 === 0 ? '' : ''
              }`}
            >
              <div className="flex items-start gap-6">
                <feature.icon className="sm:h-12 sm:w-12 text-primary flex-shrink-0" />
                <div>
                  <h3 className="text-xl text-slate-900  font-bold mb-4">{feature.title}</h3>
                  <p className="text-slate-800 text-lg sm:text-xl font-semibold">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 sm:px-6  lg:px-20 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Loved by DJs Worldwide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col justify-between bg-gradient-to-b from-slate-200 to-purple-200 p-8 rounded-xl shadow-card h-full"
            >
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <blockquote className="text-lg mb-6 text-slate-800 font-semibold">
                  {testimonial.quote}
                </blockquote>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.author}</div>
                  <div className="text-sm text-slate-900">{testimonial.role}</div>
                </div>
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 py-16 text-center space-y-8 ">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold">Simple Pricing</h2>
        <p className="text-muted-foreground my-2 mt-4 text-lg sm:text-xl">
        One plan. All features. Start with a 7-day free trial — no credit card required.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-white/5 rounded-full p-1 flex gap-1">
          <button
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              !isYearly ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setIsYearly(false)}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              isYearly ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setIsYearly(true)}
          >
            Yearly
          </button>
        </div>
      </div>

        {/* Plan Card */}
        <div className="mx-auto max-w-xl border border-border rounded-xl py-12  space-y-6 bg-gradient-to-b from-slate-200 to-purple-200 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
            Most Popular
          </div>

          <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>

          <div className="mt-2 flex items-baseline justify-center">
            <span className="text-3xl font-bold text-gray-900">
              {isYearly ? plan.priceYearly : plan.priceMonthly}
            </span>
            <span className="text-lg text-gray-900 ml-1 font-semibold">
              /{isYearly ? 'year' : 'month'}
            </span>
          </div>

          {isYearly && (
            <div className="text-md text-green-800 text-center font-semibold">
              Save {plan.savePercent}% with yearly billing
            </div>
          )}

          <p className="text-xl sm:text-2xl text-gray-950 font-semibold text-center">{plan.description}</p>

          <ul className="space-y-3 text-left max-w-xs mx-auto ">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-lg text-gray-950">
                <Check className="h-6 w-6 text-green-800 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Sparkles className="absolute -top-4 -right-4 h-6 w-6 text-primary" />
        </div>
      </section>
      

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-24">
        <div className="bg-slate-800 sm:bg-slate-900 rounded-2xl p-6 py-9 sm:py-12 sm:p-12 text-center relative overflow-hidden shadow-md shadow-black">
          <div className="absolute inset-0 "></div>
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
      <footer className="container mx-auto px-4 sm:px-6 py-12 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="WheresMySong" className="h-6 w-6" />
            <span className="text-xl font-bold">WheresMySong</span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
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
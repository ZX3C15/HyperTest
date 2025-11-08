import { useState } from 'react';
import { Camera, Activity, Shield, Zap, Clock, Users, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Zap,
      title: 'Instant OCR Scanning',
      description: 'Upload nutrition labels and get instant text extraction using advanced OCR technology',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'AI Health Analysis',
      description: 'Get personalized risk assessment for diabetes and hypertension management',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Clock,
      title: 'Scan History',
      description: 'Track your food choices over time with comprehensive scan history',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      icon: Users,
      title: 'Health Community',
      description: 'Connect with others managing similar health conditions',
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Diabetes Type 2',
      content: 'HyperDiaScan has transformed how I make food choices. The instant analysis helps me stay on track.',
      rating: 5
    },
    {
      name: 'Michael R.',
      role: 'Hypertension Management',
      content: 'The sodium tracking feature is incredibly helpful. I can quickly check if foods fit my dietary needs.',
      rating: 5
    }
  ];

  const stats = [
    { value: '50K+', label: 'Foods Analyzed' },
    { value: '95%', label: 'Accuracy Rate' },
    { value: '10K+', label: 'Active Users' },
    { value: '4.9', label: 'App Rating' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo and Brand */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                HyperDiaScense
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Smart Food Analysis</p>
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Your Smart Food Analyzer for
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Healthier Living</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Quick-scan nutrition labels and get instant AI-powered health analysis for diabetes and hypertension management. 
              Make informed food choices with confidence.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6"
            >
              Get Started Free
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>4.9/5 rating from 10,000+ users</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Key Features</Badge>
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need for Smart Food Analysis
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive suite of tools helps you make better food choices and manage your health conditions effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                onMouseEnter={() => setCurrentFeature(index)}
              >
                <CardContent className="p-6">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-4 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">How It Works</Badge>
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Three Simple Steps to Healthier Eating
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { step: '01', title: 'Scan or Upload', description: 'Take a photo of nutrition labels or upload existing images', icon: Camera },
            { step: '02', title: 'AI Analysis', description: 'Our AI instantly analyzes nutrition data for your health conditions', icon: Zap },
            { step: '03', title: 'Get Results', description: 'Receive personalized recommendations and risk assessments', icon: Shield }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full text-white font-bold text-xl shadow-lg">
                    {item.step}
                  </div>
                  <div className="absolute -top-2 -right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-3">{item.title}</h4>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">What Our Users Say</Badge>
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trusted by Thousands of Health-Conscious Users
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-foreground italic mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground">
            Ready to Transform Your Food Choices?
          </h3>
          <p className="text-xl text-muted-foreground">
            Join thousands of users who are already making smarter, healthier food decisions with HyperDiaScan.
          </p>
          <Button 
            size="lg" 
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6"
          >
            Start Your Health Journey
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
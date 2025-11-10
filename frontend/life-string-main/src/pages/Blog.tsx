import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Blog = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background" role="navigation" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-8 lg:px-12">
          <div className="flex justify-between items-center py-4">
            <div className="flex-shrink-0 ml-8">
              <button onClick={handleBackToHome} className="cursor-pointer">
                <img 
                  src="/lifestring-header-logo.png" 
                  alt="LifeString Logo"
                  className="h-32 w-auto object-cover object-[50%_52%] scale-[1.75] overflow-hidden"
                />
              </button>
            </div>
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="font-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Blog Content */}
      <section className="bg-background py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-8 lg:px-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-sans text-foreground mb-8">
              LifeString Blog
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/news/article-1" className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="aspect-[16/9] w-full overflow-hidden">
                <img src="/lovable-uploads/efa6f2b2-9b8b-48cd-afda-f77d7acc1b28.png" alt="A lone figure walks in the light" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold font-sans text-foreground mb-3 group-hover:text-primary transition-colors">
                   How Lifestring will tackle the lonliness epidemic
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                 The need for connection and the future of connection in a AI world 
                </p>
              </div>
            </Link>
            <Link to="/news/article-2" className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="aspect-[16/9] w-full overflow-hidden">
                <img src="/lovable-uploads/fa83413b-56a2-44ff-9d4a-1ad67bb80db6.png" alt="People walk on a sidewalk" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold font-sans text-foreground mb-3 group-hover:text-primary transition-colors">
                  How Lifestring will tackle the lonliness epidemic
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  The need for connection and the future of connection in a AI world 
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NewsArticle1 = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-8 lg:px-12 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        
        <article>
          <div className="mb-8">
            <img 
              src="/lovable-uploads/efa6f2b2-9b8b-48cd-afda-f77d7acc1b28.png"
              alt="Lifestring community around a beach bonfire at sunset"
              className="w-full aspect-video object-cover rounded-xl"
              loading="eager"
              decoding="async"
            />
          </div>
          
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-sans text-foreground mb-4">
              How lifestring tackles the lonliness epidemic
            </h1>
            <div className="text-muted-foreground">
              <time dateTime="2024-03-15">March 15, 2024</time>
            </div>
          </header>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Scientists at the SEMG Research Institute have achieved a monumental breakthrough in neural interface technology, 
              developing a system that can interpret human thoughts with unprecedented accuracy and translate them into digital commands.
            </p>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              The new technology, dubbed "NeuroLink Pro," uses advanced surface electromyography (SEMG) sensors combined with 
              machine learning algorithms to detect minute electrical signals from muscle contractions that correspond to intended movements, 
              even when those movements are only imagined.
            </p>
            
            <h2 className="text-2xl font-bold font-sans text-foreground mt-8 mb-4">
              How It Works
            </h2>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              The system works by placing non-invasive sensors on the skin that can detect electrical activity from muscles. 
              When a person thinks about moving their hand to click a mouse, for example, their brain sends signals to the 
              muscles even if no actual movement occurs. The NeuroLink Pro system can detect these "phantom" signals and 
              translate them into precise digital commands.
            </p>
            
            <h2 className="text-2xl font-bold font-sans text-foreground mt-8 mb-4">
              Implications for the Future
            </h2>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              This breakthrough could revolutionize how we interact with computers, smartphones, and other digital devices. 
              For people with mobility impairments, this technology could provide unprecedented freedom and independence. 
              The research team believes this could also enhance productivity for able-bodied users by allowing thought-speed 
              interaction with digital interfaces.
            </p>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              Dr. Sarah Chen, lead researcher on the project, stated: "We're not just talking about controlling a cursor 
              with your thoughts - we're talking about full integration between human intention and digital response. 
              This could change everything from how we work to how we play games to how we communicate."
            </p>
            
            <h2 className="text-2xl font-bold font-sans text-foreground mt-8 mb-4">
              Next Steps
            </h2>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              The research team plans to begin human trials later this year, with hopes of bringing a commercial version 
              to market within the next three years. They are currently seeking partnerships with major technology companies 
              to help accelerate development and ensure widespread accessibility.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
};

export default NewsArticle1;
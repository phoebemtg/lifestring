import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NewsArticle2 = () => {
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
              src="/lovable-uploads/fa83413b-56a2-44ff-9d4a-1ad67bb80db6.png"
              alt="Lifestring city community gathering at an outdoor café with yellow umbrellas"
              className="w-full aspect-video object-cover rounded-xl"
              loading="eager"
              decoding="async"
            />
          </div>
          
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-sans text-foreground mb-4">
              Meta Partners with Oakley for Next-Gen Smart Glasses
            </h1>
            <div className="text-muted-foreground">
              <time dateTime="2024-03-12">March 12, 2024</time>
            </div>
          </header>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Meta has announced a groundbreaking partnership with Oakley to develop the next generation of smart glasses, 
              combining Meta's advanced augmented reality technology with Oakley's iconic eyewear design and sports performance expertise.
            </p>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              The collaboration aims to create smart glasses that seamlessly blend cutting-edge AR capabilities with the 
              durability and style that Oakley is known for, targeting both everyday consumers and professional athletes.
            </p>
            
            <h2 className="text-2xl font-bold font-sans text-foreground mt-8 mb-4">
              Revolutionary Features
            </h2>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              The new smart glasses will feature Meta's latest AR processing chip, capable of overlaying digital information 
              directly onto the user's field of view. Key features include real-time navigation, fitness tracking, 
              social media integration, and hands-free communication capabilities.
            </p>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              For athletes, the glasses will provide performance metrics, route optimization for runners and cyclists, 
              and real-time coaching feedback. The partnership leverages Oakley's decades of experience in creating 
              eyewear for professional sports, ensuring the smart glasses can withstand extreme conditions while 
              maintaining peak performance.
            </p>
            
            <h2 className="text-2xl font-bold font-sans text-foreground mt-8 mb-4">
              Design Innovation
            </h2>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              Unlike previous smart glasses that often looked bulky and technological, the Meta-Oakley collaboration 
              focuses on creating frames that look and feel like premium traditional eyewear. The glasses will be 
              available in multiple styles, from sporty wraparounds to classic aviators.
            </p>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              "Our goal is to make technology invisible," said Mark Johnson, Oakley's Chief Design Officer. 
              "These glasses should enhance your life without announcing to the world that you're wearing a computer on your face."
            </p>
            
            <h2 className="text-2xl font-bold font-sans text-foreground mt-8 mb-4">
              Privacy and Ethics
            </h2>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              Meta has emphasized its commitment to privacy in this new venture, implementing advanced encryption 
              and giving users complete control over their data. The glasses will feature visible indicators when 
              recording or taking photos, addressing concerns about covert surveillance.
            </p>
            
            <h2 className="text-2xl font-bold font-sans text-foreground mt-8 mb-4">
              Availability and Pricing
            </h2>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              The Meta-Oakley smart glasses are expected to launch in late 2024, with a starting price point of $499. 
              Pre-orders will begin this summer, with exclusive early access for Meta and Oakley loyalty program members.
            </p>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              This partnership represents a significant step forward in making AR technology mainstream, 
              combining the best of both companies' expertise to create a product that could redefine how we 
              interact with digital information in our daily lives.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
};

export default NewsArticle2;
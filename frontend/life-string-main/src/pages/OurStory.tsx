
import { Button } from "@/components/ui/button";
import { ArrowLeft, House } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OurStoryProps {
  onStartJourney?: () => void;
  onBackToLanding?: () => void;
}

const OurStory = ({ onStartJourney, onBackToLanding }: OurStoryProps) => {
  const navigate = useNavigate();

  const handleFindYourHouse = () => {
    if (onStartJourney) {
      onStartJourney();
    } else {
      navigate('/?startJourney=true');
    }
  };

  const handleBackToHome = () => {
    if (onBackToLanding) {
      onBackToLanding();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-blue-300/15 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-100/25 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-md border-b border-gray-200/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
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
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="relative z-10 pt-64 pb-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-light font-sans text-gray-900 mb-8 text-center">
            Our Story
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-8">
            <p className="text-xl text-center mb-12 font-light">
              LifeString was born from a simple truth: we all crave genuine connection with people who truly understand us.
            </p>
            
            <div className="grid md:grid-cols-2 gap-12 items-stretch mb-16">
              <div className="bg-white/70 p-8 rounded-lg shadow-sm">
                <h2 className="text-3xl font-light font-sans text-gray-900 mb-6">The Beginning</h2>
                <p className="mb-4">
                  In a world where social media promises connection but often delivers isolation, 
                  we recognized that people were struggling to find their tribe. Despite being more 
                  "connected" than ever, genuine friendships and meaningful communities seemed increasingly rare.
                </p>
                <p>
                  We believed there had to be a better way to bring together people who shared not just 
                  interests, but fundamental ways of seeing and experiencing the world.
                </p>
              </div>
              <div className="bg-white/70 p-8 rounded-lg shadow-sm">
                <h3 className="text-3xl font-light font-sans text-gray-900 mb-6">Our Mission</h3>
                <p className="text-gray-700">
                  To create authentic communities where people can find their house - a place where 
                  they belong, are understood, and can thrive alongside others who share their core values and perspectives.
                </p>
              </div>
            </div>

            <div className="bg-white/70 p-12 rounded-lg shadow-sm mb-20">
              <h2 className="text-3xl font-light font-sans text-gray-900 mb-8 text-center">The Nine Houses Philosophy</h2>
              <p className="text-center mb-8">
                Drawing inspiration from personality psychology and ancient wisdom traditions, 
                we developed nine distinct houses, each representing a unique way of being in the world.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h4 className="font-medium font-sans text-gray-900 mb-2">Authentic Identity</h4>
                  <p className="text-sm text-gray-600">Each house represents core motivations and values that drive human behavior.</p>
                </div>
                <div className="text-center">
                  <h4 className="font-medium font-sans text-gray-900 mb-2">Real Community</h4>
                  <p className="text-sm text-gray-600">Members connect over deep similarities, not just surface-level interests.</p>
                </div>
                <div className="text-center">
                  <h4 className="font-medium font-sans text-gray-900 mb-2">Personal Growth</h4>
                  <p className="text-sm text-gray-600">Understanding your house helps you grow while accepting others' different paths.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-light font-sans text-gray-900 mb-6 text-center">Join Your House Today</h2>
              <p className="text-center mb-8">
                Whether you're seeking your first real community or looking to deepen existing connections, 
                your house is waiting for you. Take the journey to discover where you truly belong.
              </p>
              <div className="text-center">
                <Button
                  onClick={handleFindYourHouse}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-sm font-medium"
                >
                  <House className="mr-2 h-4 w-4" />
                  Find Your House
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurStory;

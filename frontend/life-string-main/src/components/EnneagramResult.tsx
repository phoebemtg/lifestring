import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface EnneagramResultProps {
  enneagramType: number;
  onEnterPlatform: () => void;
}

const EnneagramResult = ({ enneagramType, onEnterPlatform }: EnneagramResultProps) => {
  const [showResult, setShowResult] = useState(false);
  const { userProfile } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowResult(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const getEnneagramInfo = (type: number) => {
    const enneagramTypes = {
      1: {
        name: "The Perfectionist",
        description: "You are principled, purposeful, self-controlled, and perfectionistic. You strive to be good and right, to improve everything, and to be consistent with your ideals.",
        traits: ["Principled", "Purposeful", "Self-controlled", "Perfectionistic"]
      },
      2: {
        name: "The Helper",
        description: "You are caring, interpersonal, demonstrative, generous, and people-pleasing. You want to be loved and valued, to express your feelings for others, and to be appreciated.",
        traits: ["Caring", "Generous", "People-pleasing", "Supportive"]
      },
      3: {
        name: "The Achiever", 
        description: "You are self-assured, attractive, charming, ambitious, competent, and energetic. You want to be affirmed, distinguished, and admired, and to impress others.",
        traits: ["Ambitious", "Competent", "Energetic", "Success-oriented"]
      },
      4: {
        name: "The Individualist",
        description: "You are self-aware, sensitive, reserved, and creative. You want to find yourself and their significance, to create an identity, and to surround yourself with beauty.",
        traits: ["Creative", "Sensitive", "Expressive", "Individualistic"]
      },
      5: {
        name: "The Investigator",
        description: "You are intense, cerebral, perceptive, innovative, and secretive. You want to possess knowledge, understand the environment, and have everything figured out.",
        traits: ["Perceptive", "Innovative", "Independent", "Cerebral"]
      },
      6: {
        name: "The Loyalist",
        description: "You are engaging, responsible, anxious, and suspicious. You want to have security, support, and guidance, and to test the attitudes of others toward them.",
        traits: ["Loyal", "Responsible", "Anxious", "Committed"]
      },
      7: {
        name: "The Enthusiast",
        description: "You are spontaneous, versatile, acquisitive, and scattered. You want to maintain their freedom and happiness, avoid missing out, and keep themselves excited.",
        traits: ["Spontaneous", "Versatile", "Optimistic", "Adventurous"]
      },
      8: {
        name: "The Challenger",
        description: "You are self-confident, decisive, willful, and confrontational. You want to be self-reliant and in control of their own life and destiny.",
        traits: ["Confident", "Decisive", "Protective", "Confrontational"]
      },
      9: {
        name: "The Peacemaker",
        description: "You are receptive, reassuring, complacent, and resigned. You want to maintain their inner and outer peace, to keep things going as they are.",
        traits: ["Peaceful", "Reassuring", "Receptive", "Harmonious"]
      }
    };

    return enneagramTypes[type as keyof typeof enneagramTypes] || enneagramTypes[1];
  };

  const enneagramInfo = getEnneagramInfo(enneagramType);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl text-center">
        {!showResult ? (
          <div className="animate-pulse">
            <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-8 animate-spin" />
            <h1 className="text-4xl font-light text-gray-900 mb-4">
              Discovering your personality type...
            </h1>
            <p className="text-lg text-gray-600 font-light">
              Analyzing your responses
            </p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="mb-12">
              <div className="flex items-center justify-center mb-8">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {enneagramType}
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
                Hi {userProfile?.full_name || 'there'}!
              </h1>
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-2">
                You are Type {enneagramType}
              </h2>
              <h3 className="text-3xl md:text-4xl font-medium mb-6 text-primary">
                {enneagramInfo.name}
              </h3>
            </div>

            <Card className="bg-white border border-gray-200 shadow-sm mb-12 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <p className="text-gray-700 text-lg leading-relaxed mb-6 font-light">
                  {enneagramInfo.description}
                </p>
                
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Core Traits:</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {enneagramInfo.traits.map((trait, index) => (
                      <span 
                        key={index}
                        className="px-4 py-2 rounded-full bg-primary text-white font-light"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={onEnterPlatform}
              className="text-lg px-12 py-4 font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            >
              Enter the Platform <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnneagramResult;
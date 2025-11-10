import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
interface SortingQuizProps {
  onComplete: (answers: number[]) => void;
  onBack: () => void;
  userName?: string;
}

// Types of questions we'll support
type QuestionType =
  | "text" // free-text (we still map to a numeric code for the algorithm)
  | "options" // multi-choice options (2-10)
  | "image" // 3x3 image grid selection
  | "ranking" // rank a small list (we encode top choice index)
  | "either" // two large buttons
  | "countdownText"; // text with auto-advance after countdown if unanswered

interface BaseQuestion {
  id: number;
  type: QuestionType;
  prompt: string;
}

interface TextQuestion extends BaseQuestion {
  type: "text" | "countdownText";
  placeholder?: string;
  wordLimit?: number; // for display-only
  countdownSeconds?: number; // only for countdownText
}

interface OptionsQuestion extends BaseQuestion {
  type: "options" | "either";
  options: string[]; // for 'either' provide two options
}

interface ImageItem {
  src: string;
  label: string;
}

interface ImageQuestion extends BaseQuestion {
  type: "image";
  images: ImageItem[]; // up to 9
}

interface RankingQuestion extends BaseQuestion {
  type: "ranking";
  values: string[]; // small set e.g., 6 items
}

type Question = TextQuestion | OptionsQuestion | ImageQuestion | RankingQuestion;

// NOTE: We still produce a numeric array for onComplete to preserve existing logic.
const questions: Question[] = [
  {
    id: 1,
    type: "text",
    prompt: "Describe yourself within 50 words",
    placeholder: "I am...",
    wordLimit: 50,
  },
  {
    id: 2,
    type: "text",
    prompt: "What do you want to achieve most in your life?",
    placeholder: "My biggest life goal is...",
  },
  {
    id: 3,
    type: "image",
    prompt: "Pick the image that feels most like 'home' to you.",
    images: [
      { src: "/lovable-uploads/aa126767-1964-4a6c-a439-e97e743b8b99.png", label: "Cozy cabin" },
      { src: "/lovable-uploads/88a324b3-2a82-4d99-af19-7d3993952b97.png", label: "Busy city" },
      { src: "/lovable-uploads/939c2c85-003f-41f0-a4e1-2d6d109b3ee3.png", label: "Library" },
      { src: "/lovable-uploads/ae9b10f3-f936-4799-835a-4cab838a94fe.png", label: "Festival" },
      { src: "/lovable-uploads/ff102d9c-e9a4-4c44-b958-1f81fe51ba6f.png", label: "Mountains" },
      { src: "/lovable-uploads/77c6c738-9d84-4c86-89fa-30e20bbd71f1.png", label: "Beach" },
      { src: "/lovable-uploads/3a1db515-3476-466c-9a13-4d7dca4142a9.png", label: "Quiet garden" },
      { src: "/lovable-uploads/5ba9f6b1-439a-4300-b13c-23c379161f6e.png", label: "Workshop / studio" },
      { src: "/lovable-uploads/f1bacbe2-f22f-4da8-84d9-765e103545aa.png", label: "Seaside town" },
    ],
  },
  {
    id: 4,
    type: "text",
    prompt: "For one day you wake up as someone living a completely different life. What life would you most want to live?",
    placeholder: "I'd live as...",
  },
  {
    id: 5,
    type: "image",
    prompt: "Pick the weekend that feels most 'you'.",
    images: [
      { src: "/lovable-uploads/e988345f-fef7-498b-9d90-8c9c51d7d84d.png", label: "Camping trip" },
      { src: "/lovable-uploads/b33e359c-3ff5-494a-b9cc-b1cfc3ddf545.png", label: "Reading in a coffee shop" },
      { src: "/lovable-uploads/19f36af2-717c-4520-a6d4-831e989a36d5.png", label: "Nightclub" },
      { src: "/lovable-uploads/b32c66b1-a534-41d5-bae8-76114f813f9e.png", label: "Family dinner" },
      { src: "/lovable-uploads/bac888f5-c572-4b58-b099-5db11450edc0.png", label: "Museum" },
      { src: "/lovable-uploads/f647cf72-3a96-4a8a-bdaf-2d35b1172bf9.png", label: "Road trip" },
      { src: "/lovable-uploads/20ee93ee-6d9d-4d9f-bced-48357a165705.png", label: "Volunteering" },
      { src: "/lovable-uploads/dc2a9d29-79d7-4b1f-b11d-dee87ee51204.png", label: "Gaming marathon" },
      { src: "/lovable-uploads/458cc320-a3f9-4274-97c0-daf436b8620c.png", label: "Sports match" },
    ],
  },
  {
    id: 6,
    type: "text",
    prompt: "The world needs more ________.",
    placeholder: "Compassion / Creativity / Courage / ...",
  },
  {
    id: 7,
    type: "image",
    prompt: "Pick the image that makes you feel most at peace.",
    images: [
      { src: "/lovable-uploads/c64e7dd1-7d93-41bb-925a-0efa7870345e.png", label: "City skyline" },
      { src: "/lovable-uploads/c195f776-ba71-4ce8-9c38-eb51358bbbdb.png", label: "Cozy room" },
      { src: "/lovable-uploads/e123ac12-6770-49c4-a411-6139e9765bb8.png", label: "Creative studio" },
      { src: "/lovable-uploads/f36e7209-b124-4db6-8e09-87dbc11ee566.png", label: "Forest" },
      { src: "/lovable-uploads/a73c1e73-0273-438c-a81e-3faa5c326e8f.png", label: "Garden" },
      { src: "/lovable-uploads/b09af2ac-e73c-4eea-80c5-9dc01630b685.png", label: "Mountains" },
      { src: "/lovable-uploads/e8c68f57-97b0-45b3-a0d6-590bcae9f27e.png", label: "Meadow" },
      { src: "/lovable-uploads/315ac128-1431-4236-ae90-e938793b7d39.png", label: "Ocean" },
      { src: "/lovable-uploads/ea00ff81-5ba9-4dfd-9ffe-960b93d84bf8.png", label: "Party" },
    ],
  },
  {
    id: 8,
    type: "text",
    prompt: "When you think of one word about a dream friend, what would it be?",
    placeholder: "Loyal / Fun / Driven / Honest / ...",
  },
  {
    id: 9,
    type: "text",
    prompt: "If you could live a day in a different time which would it be?",
    placeholder: "Ancient Egypt, Medieval times, Renaissance, Future...",
  },
  {
    id: 10,
    type: "text",
    prompt: "In 10 years, if everything goes as you want, you want to be ________.",
    placeholder: "I want to be...",
  },
];

// Cloudy background identical to the LandingPage hero style
const CLOUDY_COLORS: string[] = [
  "#3b82f6", // Blue
  "#8b5cf6", // Purple  
  "#22c55e", // Green
  "#fbbf24", // Amber
];

const getCloudyQuizBackground = () => {
  const allColors = CLOUDY_COLORS;
  const cloudOrbs = [] as JSX.Element[];
  for (let i = 0; i < 12; i++) {
    const color = allColors[i % allColors.length];
    const size = Math.random() * 200 + 100; // 100-300px
    const opacity = Math.random() * 0.2 + 0.15; // 0.15-0.35
    const blur = Math.random() * 60 + 60; // 60-120px
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const animationDelay = Math.random() * 30; // 0-30s delay
    const animationDuration = Math.random() * 25 + 20; // 20-45s
    const animationType = ['cloud-float-1', 'cloud-float-2', 'cloud-float-3', 'cloud-float-4', 'cloud-float-5'][i % 5];

    cloudOrbs.push(
      <div
        key={i}
        className={`absolute rounded-full animate-${animationType}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          opacity: opacity,
          filter: `blur(${blur}px)`,
          left: `${left}%`,
          top: `${top}%`,
          animationDelay: `${animationDelay}s`,
          animationDuration: `${animationDuration}s`,
        }}
      />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {cloudOrbs}
    </div>
  );
};

const SortingQuiz = ({ onComplete, onBack, userName }: SortingQuizProps) => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // for options/image/either
  const [textValue, setTextValue] = useState<string>("");
  const [rankingOrder, setRankingOrder] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const q = questions[currentQuestion];

  // Initialize ranking order when needed
  useEffect(() => {
    if (q.type === "ranking") {
      setRankingOrder((q as RankingQuestion).values);
      setSelectedIndex(0); // encode top choice initially
    } else {
      setRankingOrder([]);
    }
  }, [currentQuestion]);

  // Initialize countdown when needed
  useEffect(() => {
    if (q.type === "countdownText") {
      const secs = (q as TextQuestion).countdownSeconds ?? 10;
      setCountdown(secs);
      const i = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null) return prev;
          if (prev <= 1) {
            clearInterval(i);
            // Auto-advance if still unanswered
            if (!textValue.trim()) {
              handleNext(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(i);
    } else {
      setCountdown(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion]);

  // Word count helper
  const wordCount = useMemo(() => {
    if (q.type !== "text" && q.type !== "countdownText") return 0;
    return textValue.trim() ? textValue.trim().split(/\s+/).length : 0;
  }, [q.type, textValue]);

  const isAnswered = (): boolean => {
    switch (q.type) {
      case "options":
      case "either":
      case "image":
        return selectedIndex !== null;
      case "ranking":
        return rankingOrder.length > 0; // allow default order
      case "text":
      case "countdownText":
        return textValue.trim().length > 0;
      default:
        return false;
    }
  };

  const encodeAnswer = (): number => {
    // Map the current response to a number to preserve onComplete signature
    if (q.type === "ranking") {
      const rq = q as RankingQuestion;
      const top = rankingOrder[0];
      return Math.max(0, rq.values.findIndex((v) => v === top));
    }
    if (q.type === "text" || q.type === "countdownText") {
      // Use a simple hash of the text for variety, fallback to 0
      if (!textValue.trim()) return 0;
      let hash = 0;
      for (let i = 0; i < textValue.length; i++) {
        hash = (hash * 31 + textValue.charCodeAt(i)) % 9; // keep in range
      }
      return hash;
    }
    // options/either/image
    return selectedIndex ?? 0;
  };

  const handleNext = (auto = false) => {
    // If auto is true (countdown), proceed even if empty
    const nextValue = auto ? 0 : encodeAnswer();

    if (!auto && !isAnswered()) return;

    const newAnswers = [...answers, nextValue];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      // reset states for next question
      setSelectedIndex(null);
      setTextValue("");
      setRankingOrder([]);
    } else {
      onComplete(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion === 0) return;
    // go back one question, remove last answer
    setCurrentQuestion(currentQuestion - 1);
    setAnswers(answers.slice(0, -1));
    // reset UI states
    setSelectedIndex(null);
    setTextValue("");
    setRankingOrder([]);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Ranking move helpers
  const moveItem = (idx: number, dir: -1 | 1) => {
    setRankingOrder((prev) => {
      const next = [...prev];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return prev;
      const t = next[idx];
      next[idx] = next[to];
      next[to] = t;
      // update encoded top index for enabling Next
      const rq = q as RankingQuestion;
      const top = next[0];
      setSelectedIndex(Math.max(0, rq.values.findIndex((v) => v === top)));
      return next;
    });
  };

  // Selected image label for generation
  const selectedImageLabel = useMemo(() => {
    if (q.type !== "image" || selectedIndex === null) return null;
    const imgs = (q as ImageQuestion).images;
    return imgs[selectedIndex]?.label ?? null;
  }, [q, selectedIndex]);

  // Generate image via Supabase Edge Function (Hugging Face) when selecting an image option
  useEffect(() => {
    const run = async () => {
      if (q.type !== "image" || !selectedImageLabel) return;
      if (generatedImages[selectedImageLabel]) return; // cached
      try {
        setIsGenerating(true);
        const prompt = `Photorealistic, high-quality image of ${selectedImageLabel}, detailed, vibrant colors, square composition`;
        const { data, error } = await supabase.functions.invoke("generate-image", {
          body: { prompt },
        });
        if (error) throw error;
        if (data?.image) {
          setGeneratedImages((prev) => ({ ...prev, [selectedImageLabel]: data.image as string }));
        } else {
          throw new Error("No image returned");
        }
      } catch (err) {
        console.error(err);
        toast({
          title: "Image generation failed",
          description: "Please try again or pick a different option.",
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImageLabel, q.type]);

  // Per-question style accents (subtle differences)
  const cardAccent = useMemo(() => {
    switch (q.type) {
      case "image":
        return "bg-background/70 backdrop-blur border-border";
      case "ranking":
        return "bg-gradient-to-b from-background to-muted/40 border-border";
      case "either":
        return "bg-background border-border shadow-sm";
      case "countdownText":
        return "bg-gradient-to-br from-background via-background to-muted/30 border-border";
      default:
        return "bg-background border-border";
    }
  }, [q.type]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-6 overflow-hidden">
      {getCloudyQuizBackground()}
      <div className="w-full max-w-5xl">
        <Card className={`${cardAccent}`}>
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-light text-foreground mb-4">
              {userName ? `${userName}'s Sorting Ceremony` : "Sorting Ceremony"}
            </CardTitle>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </p>
              <Progress value={progress} className="w-full h-2" />
              {q.type === "countdownText" && countdown !== null && (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4" /> Auto-advance in {countdown}s
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-medium text-foreground mb-6 text-center leading-relaxed">
              {q.prompt}
            </h2>

            {/* Render per-type UI */}
            {q.type === "text" || q.type === "countdownText" ? (
              <div className="space-y-3 mb-8 max-w-3xl mx-auto">
                {(q as TextQuestion).wordLimit ? (
                  <p className="text-sm text-muted-foreground text-center">
                    Up to {(q as TextQuestion).wordLimit} words • {wordCount} used
                  </p>
                ) : null}
                <Textarea
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder={(q as TextQuestion).placeholder || "Type your answer..."}
                  className="min-h-[140px]"
                />
              </div>
            ) : null}

            {q.type === "either" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-4xl mx-auto">
                {(q as OptionsQuestion).options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`rounded-lg p-6 border transition-all text-left md:text-center hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      selectedIndex === idx ? "bg-primary/10 border-primary" : "bg-card border-border"
                    }`}
                  >
                    <span className="text-base md:text-lg text-foreground">{opt}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {q.type === "options" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {(q as OptionsQuestion).options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`rounded-lg p-4 border text-left transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      selectedIndex === idx ? "bg-primary/10 border-primary" : "bg-card border-border"
                    }`}
                  >
                    <span className="text-sm md:text-base text-foreground">{opt}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {q.type === "image" ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                  {(q as ImageQuestion).images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={`group relative overflow-hidden rounded-lg border aspect-square focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        selectedIndex === idx ? "border-primary ring-2 ring-primary/40" : "border-border"
                      }`}
                      aria-label={img.label}
                    >
                      <img
                        src={img.src}
                        alt={img.label}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-background/80 backdrop-blur px-2 py-1 text-center">
                        <span className="text-xs md:text-sm text-foreground">{img.label}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedImageLabel ? (
                  <div className="mb-8 rounded-lg border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Preview for "{selectedImageLabel}"
                    </p>
                    {isGenerating && !generatedImages[selectedImageLabel] ? (
                      <p className="text-sm text-muted-foreground">Generating image...</p>
                    ) : generatedImages[selectedImageLabel] ? (
                      <img
                        src={generatedImages[selectedImageLabel]}
                        alt={`Generated image of ${selectedImageLabel}`}
                        className="w-full rounded-md object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : null}

            {q.type === "ranking" ? (
              <div className="max-w-xl mx-auto mb-8">
                <ul className="space-y-2">
                  {rankingOrder.map((v, idx) => (
                    <li
                      key={v}
                      className="flex items-center justify-between rounded-md border bg-card border-border px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground w-6 text-right">{idx + 1}.</span>
                        <span className="text-foreground">{v}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => moveItem(idx, -1)}
                          aria-label={`Move ${v} up`}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => moveItem(idx, 1)}
                          aria-label={`Move ${v} down`}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground text-center">
                  Tip: Move your top value to the first position.
                </p>
              </div>
            ) : null}

            <div className="flex justify-between">
              <Button onClick={currentQuestion === 0 ? onBack : handlePrevious} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {currentQuestion === 0 ? "Back" : "Previous"}
              </Button>

              <Button onClick={() => handleNext(false)} disabled={!isAnswered() && q.type !== "countdownText"}>
                {currentQuestion === questions.length - 1 ? "Discover Your House" : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SortingQuiz;
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Save, Users, Lightbulb, Target, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileQuestionsProps {
  onBack: () => void;
  userName: string;
  embedded?: boolean;
}

interface QuestionAnswers {
  [key: string]: string;
}

const ProfileQuestions: React.FC<ProfileQuestionsProps> = ({ onBack, userName, embedded = false }) => {
  const [answers, setAnswers] = useState<QuestionAnswers>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Friend Preferences Questions (20)
  const friendPreferencesQuestions = [
    "What qualities do you value most in people?",
    "Are you looking for friends nearby, long distance or both?",
    "How important is shared interest?",
    "What kind of humor do you appreciate most?",
    "How important is it that friends share your values or beliefs?",
    "How do you usually start new friendships?",
    "Do you prefer spontaneous hangouts or planned activities?",
    "How would you prefer to spend time with friends?",
    "Would you say you are an introvert or extrovert?",
    "Do you have a lot of friends now?",
    "Do physical looks matter to you in a friend?",
    "What kind of experiences would you like to share with new friends?",
    "Would you like to meet friends who can work with you on creative and professional projects?",
    "Would you mind having friends from completely different backgrounds?",
    "If you could describe your ideal friend, what would they be like?",
    "What's a passion or hobby you could talk about for hours?",
    "Would you rather have a small circle of close friends or a large, varied network?",
    "What kind of activities make you feel closer to others?",
    "Would you like to meet friends who you can do 'big' things with? like travelling abroad, starting a company or something else",
    "Do you want to be friends with people from both Genders"
  ];

  // Fun Questions (20)
  const funQuestions = [
    "What's your favorite movie of all time?",
    "What's your favorite book?",
    "What's your favorite song?",
    "What's your favorite food?",
    "What's your favorite thing to do to relax?",
    "What's your favorite color?",
    "What's your favorite holiday?",
    "The country you most want to visit?",
    "Sunny or RAINY day?",
    "Morning bird or Night Owl",
    "favorite smell or scent?",
    "Best memory",
    "Best feeling in the world?",
    "What place makes you feel the most at happy?",
    "What's something small that always improves your day?",
    "What's a feeling you wish you could experience more often?",
    "What does a perfect weekend look like for you?",
    "What's your Harry Potter House",
    "What's your favorite city you've ever visited?",
    "What is the superpower you would want most?"
  ];

  // Goals + Ideas Questions (20)
  const goalsIdeasQuestions = [
    "What's a personal dream you are currently working toward?",
    "What's a big life goal you want to achieve in the next 5 years?",
    "Do your goals focus more on career, creativity, relationships, or experiences?",
    "What's an idea you've had for a long time but never started?",
    "What motivates you to pursue your dreams?",
    "What's a life dream you are always thinking about?",
    "Is legacy something you think about?",
    "Are you more driven by passion, security, impact, or recognition?",
    "What skills or talents do you want to develop in the next year?",
    "How do you define success in your own terms?",
    "What is one risk you're willing to take for your dreams?",
    "What kind of lifestyle are you ultimately working toward?",
    "What problem in the world would you like to help solve?",
    "If you achieved your ultimate dream, what would life look like?",
    "Would you prefer to pursue dreams alone or with others?",
    "What would you do if you knew you could not fail?",
    "What is one thing holding you back from your next big step?",
    "If you could start any project tomorrow, what would it be?",
    "What's a childhood dream you still think about?",
    "If you could leave a legacy, what would it be?"
  ];

  // Personal Questions (20)
  const personalQuestions = [
    "What's something you're currently trying to improve about yourself?",
    "What's a passion or hobby you could talk about for hours?",
    "Who has influenced your life perspective the most?",
    "What's one thing people often misunderstand about you?",
    "What makes you feel truly understood by someone?",
    "How often do you want to meet or interact with new friends?",
    "What is one trait that instantly makes you feel closer to someone?",
    "My favorite way to connect is through:",
    "What is something that is a big red flag in a friendship for you?",
    "Your friendship 'green flag'?",
    "Which experiences in life have shaped you the most?",
    "If someone described you in three words, what would they be?",
    "What are three values you live your life by?",
    "What's a fact about you that is interesting?",
    "Which fictional character do you relate to most and why?",
    "Are you a logical person?",
    "Are you a creative person?",
    "What kind of environments bring out your best self?",
    "Does shyness often stop you from making friends?",
    "What's a small joy that makes your life feel meaningful?"
  ];

  const questionCategories = [
    {
      id: 'friend-preferences',
      title: 'Friend Preferences',
      icon: Users,
      questions: friendPreferencesQuestions,
      color: 'blue'
    },
    {
      id: 'fun-questions',
      title: 'Fun Questions',
      icon: Lightbulb,
      questions: funQuestions,
      color: 'yellow'
    },
    {
      id: 'goals-ideas',
      title: 'Goals + Ideas',
      icon: Target,
      questions: goalsIdeasQuestions,
      color: 'green'
    },
    {
      id: 'personal-questions',
      title: 'Personal Questions',
      icon: Heart,
      questions: personalQuestions,
      color: 'red'
    }
  ];

  const fetchAnswers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Try to get from user_profiles.attributes.profile_questions first
      const { data, error } = await supabase
        .from('user_profiles')
        .select('attributes')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile questions:', error);
        return;
      }

      if (data?.attributes?.profile_questions) {
        setAnswers(data.attributes.profile_questions);
      }
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  };

  const saveAnswers = async () => {
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current user_profiles attributes
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('attributes')
        .eq('user_id', user.id)
        .single();

      // Update the attributes with profile_questions
      const updatedAttributes = {
        ...currentProfile?.attributes,
        profile_questions: answers
      };

      // Save to user_profiles.attributes
      const { error } = await supabase
        .from('user_profiles')
        .update({
          attributes: updatedAttributes
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving answers:', error);
        toast({
          title: "Error",
          description: "Failed to save your answers. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Answers Saved!",
        description: "Your profile questions have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving answers:', error);
      toast({
        title: "Error",
        description: "Failed to save your answers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const getProgress = (categoryId: string, questions: string[]) => {
    const answeredCount = questions.filter(q => {
      const questionId = `${categoryId}-${questions.indexOf(q)}`;
      return answers[questionId]?.trim();
    }).length;
    return (answeredCount / questions.length) * 100;
  };

  useEffect(() => {
    setIsLoading(true);
    fetchAnswers().finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className={embedded ? "flex items-center justify-center p-6" : "min-h-screen flex items-center justify-center"}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile questions...</p>
        </div>
      </div>
    );
  }

  if (embedded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Profile Questions
            <Button
              onClick={saveAnswers}
              disabled={isSaving}
              className="flex items-center space-x-2"
              size="sm"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save All'}</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm mb-6">
            Answer these questions to help us connect you with like-minded people and improve AI recommendations.
          </p>
          <Accordion type="multiple" className="space-y-4">
            {questionCategories.map((category) => {
              const Icon = category.icon;
              const progress = getProgress(category.id, category.questions);
              return (
                <AccordionItem key={category.id} value={category.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{category.title}</span>
                        <span className="text-sm text-gray-500">
                          ({Math.round(progress)}% complete)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full bg-${category.color}-500`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 pt-4">
                      {category.questions.map((question, index) => {
                        const questionId = `${category.id}-${index}`;
                        return (
                          <div key={questionId} className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              {index + 1}. {question}
                            </label>
                            <Textarea
                              value={answers[questionId] || ''}
                              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                              placeholder="Your answer..."
                              className="min-h-[80px]"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            onClick={onBack}
            variant="ghost"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Profile</span>
          </Button>
          <h1 className="text-xl font-medium text-gray-900">Profile Questions</h1>
          <Button 
            onClick={saveAnswers}
            disabled={isSaving}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save All'}</span>
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell Us About Yourself</h2>
          <p className="text-gray-600">Answer these questions to help us connect you with like-minded people. You can skip any questions and come back later.</p>
        </div>

        <Tabs defaultValue="friend-preferences" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            {questionCategories.map((category) => {
              const Icon = category.icon;
              const progress = getProgress(category.id, category.questions);
              return (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex flex-col items-center space-y-1 p-3"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{category.title}</span>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full bg-${category.color}-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {questionCategories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <category.icon className={`h-5 w-5 text-${category.color}-500`} />
                    <span>{category.title}</span>
                    <span className="text-sm text-gray-500">
                      ({category.questions.filter(q => {
                        const questionId = `${category.id}-${category.questions.indexOf(q)}`;
                        return answers[questionId]?.trim();
                      }).length}/{category.questions.length} answered)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {category.questions.map((question, index) => {
                    const questionId = `${category.id}-${index}`;
                    return (
                      <div key={questionId} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          {index + 1}. {question}
                        </label>
                        <Textarea
                          value={answers[questionId] || ''}
                          onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                          placeholder="Your answer..."
                          className="min-h-[80px]"
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileQuestions;

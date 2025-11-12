import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ArrowUp, Plus, Paperclip, Image, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import CreateJoinModal from './CreateJoinModal';
import lifestringLogo from '@/assets/lifestring-header-logo.png';


interface StringsInterfaceProps {
  selectedOrbColor?: string;
  onStringCreated?: (stringData: any) => void;
  recentStrings: Array<{
    id: string;
    content: string;
    timestamp: Date;
  }>;
  setRecentStrings: React.Dispatch<React.SetStateAction<Array<{
    id: string;
    content: string;
    timestamp: Date;
  }>>>;
  loadConversation?: {
    id: string;
    content: string;
    timestamp: Date;
  } | null;
  onConversationLoaded?: () => void;
}

interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const StringsInterface: React.FC<StringsInterfaceProps> = ({
  selectedOrbColor = '#4169E1',
  onStringCreated,
  recentStrings,
  setRecentStrings,
  loadConversation,
  onConversationLoaded
}) => {
  const [inputValue, setInputValue] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInChatMode, setIsInChatMode] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userName, setUserName] = useState<string>('User');
  const [activeTab, setActiveTab] = useState('connected');
  const [detailedProfile, setDetailedProfile] = useState<any>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isCreateJoinModalOpen, setIsCreateJoinModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Function to save conversation to database
  const saveConversationToDatabase = async (conversationId: string, content: string) => {
    if (!user) return; // Only save if user is authenticated

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Note: Conversations with Strings (AI) are not saved to database
      // They are ephemeral chat sessions
    } catch (error) {
      console.error('Error saving conversation to database:', error);
    }
  };

  // Fetch user profile data when user is available
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          console.log('🔍 Fetching profile for user:', user.id);

          // Get user's name from user_profiles using raw query to avoid TypeScript issues
          const { data: userProfileData, error: userProfileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          console.log('📋 Raw user_profiles data:', userProfileData);
          console.log('❌ User profile error:', userProfileError);

          // Debug: Log the full structure of userProfileData
          if (userProfileData) {
            console.log('🔍 DEBUGGING userProfileData structure:');
            console.log('- Full object:', userProfileData);
            console.log('- Object keys:', Object.keys(userProfileData));
            console.log('- attributes:', (userProfileData as any).attributes);
            console.log('- biography:', (userProfileData as any).biography);
            console.log('- contact_info:', (userProfileData as any).contact_info);
            console.log('- social_links:', (userProfileData as any).social_links);
          }

          // Try multiple sources for the name
          let extractedUserName = 'User';
          if (userProfileData && !userProfileError) {
            // Cast to any to bypass TypeScript issues with JSONB fields
            const profileData = userProfileData as any;

            // Try full_name field first (direct column)
            if (profileData.full_name) {
              extractedUserName = profileData.full_name;
              console.log('✅ Name found in full_name:', extractedUserName);
            }
            // Try contact_info.name (JSONB field)
            else if (profileData.contact_info && typeof profileData.contact_info === 'object' && profileData.contact_info.name) {
              extractedUserName = profileData.contact_info.name;
              console.log('✅ Name found in contact_info:', extractedUserName);
            }
            // Try meta.name as backup (JSONB field)
            else if (profileData.meta && typeof profileData.meta === 'object' && profileData.meta.name) {
              extractedUserName = profileData.meta.name;
              console.log('✅ Name found in meta:', extractedUserName);
            }
            // Try user metadata from auth
            else if (user.user_metadata?.name) {
              extractedUserName = user.user_metadata.name;
              console.log('✅ Name found in user_metadata:', extractedUserName);
            } else if (user.user_metadata?.full_name) {
              extractedUserName = user.user_metadata.full_name;
              console.log('✅ Name found in user_metadata.full_name:', extractedUserName);
            } else {
              console.log('⚠️ No name found in any location, using fallback');
            }
          } else {
            console.log('⚠️ Could not fetch user_profiles, trying user metadata');
            if (user.user_metadata?.name) {
              extractedUserName = user.user_metadata.name;
              console.log('✅ Name found in user_metadata (fallback):', extractedUserName);
            } else if (user.user_metadata?.full_name) {
              extractedUserName = user.user_metadata.full_name;
              console.log('✅ Name found in user_metadata.full_name (fallback):', extractedUserName);
            }
          }

          // Set the userName state
          setUserName(extractedUserName);
          console.log('🎯 Final userName set to:', extractedUserName);

          // Also update the userProfile with the extracted name
          if (userProfileData) {
            const updatedProfile = {
              ...userProfileData,
              name: extractedUserName
            };
            setUserProfile(updatedProfile);
            console.log('🔧 Updated userProfile with name:', updatedProfile.name);
          }

          // Get detailed profile data
          const { data, error } = await supabase
            .from('detailed_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          console.log('📋 Detailed profile data:', data);
          console.log('❌ Detailed profile error:', error);

          // Debug: Log detailed_profiles data structure
          if (data) {
            console.log('🔍 DETAILED_PROFILES inspection:', {
              interests_in_detailed: data.interests,
              passions_in_detailed: data.passions,
              hobbies_in_detailed: data.hobbies,
              skills_in_detailed: data.skills,
              bio_in_detailed: data.bio,
              interests_type: typeof data.interests,
              passions_type: typeof data.passions,
              interests_length: data.interests?.length,
              passions_length: data.passions?.length
            });
          }

          // Get profile questions from user_profiles.attributes
          let profileQuestions = {};
          if (userProfileData && !userProfileError) {
            const profileData = userProfileData as any;
            if (profileData.attributes && profileData.attributes.profile_questions) {
              profileQuestions = profileData.attributes.profile_questions;
              console.log('✅ Profile questions found:', Object.keys(profileQuestions).length, 'answers');
            }
          }

          // Extract data from user_profiles.attributes as fallback
          let interests = [];
          let passions = [];
          let hobbies = [];
          let skills = [];
          let bio = '';

          if (userProfileData && !userProfileError) {
            const profileData = userProfileData as any;

            // Extract data from attributes JSONB field
            if (profileData.attributes) {
              console.log('🔍 DETAILED attributes inspection:', {
                raw_attributes: profileData.attributes,
                interests_raw: profileData.attributes.interests,
                passions_raw: profileData.attributes.passions,
                hobbies_raw: profileData.attributes.hobbies,
                skills_raw: profileData.attributes.skills,
                interests_type: typeof profileData.attributes.interests,
                passions_type: typeof profileData.attributes.passions
              });

              interests = profileData.attributes.interests || [];
              passions = profileData.attributes.passions || [];
              hobbies = profileData.attributes.hobbies || [];
              skills = profileData.attributes.skills || [];

              console.log('✅ Extracted from user_profiles.attributes:', {
                interests: interests.length,
                passions: passions.length,
                hobbies: hobbies.length,
                skills: skills.length
              });

              console.log('🎯 ACTUAL EXTRACTED ARRAYS:', {
                interests_array: interests,
                passions_array: passions,
                hobbies_array: hobbies,
                skills_array: skills
              });
            } else {
              console.log('❌ No attributes field found in profileData');
            }

            // Extract bio from biography JSONB field
            if (profileData.biography && profileData.biography.bio) {
              bio = profileData.biography.bio;
              console.log('✅ Bio found in user_profiles.biography:', bio.substring(0, 50) + '...');
            }
          }

          if (data && !error) {
            // Combine detailed_profiles data with user_profiles.attributes data
            // ALWAYS use detailed_profiles data as primary source
            const enhancedProfile = {
              ...data,
              name: extractedUserName,
              // Use detailed_profiles data as primary, fallback to user_profiles.attributes if detailed is empty
              interests: (data.interests && data.interests.length > 0) ? data.interests : interests,
              passions: (data.passions && data.passions.length > 0) ? data.passions : passions,
              hobbies: (data.hobbies && data.hobbies.length > 0) ? data.hobbies : hobbies,
              skills: (data.skills && data.skills.length > 0) ? data.skills : skills,
              bio: data.bio || bio || '',
              profile_questions: profileQuestions
            };

            console.log('🔧 FIXED PROFILE EXTRACTION:', {
              detailed_interests: data.interests?.length || 0,
              detailed_passions: data.passions?.length || 0,
              detailed_hobbies: data.hobbies?.length || 0,
              final_interests: enhancedProfile.interests?.length || 0,
              final_passions: enhancedProfile.passions?.length || 0,
              final_hobbies: enhancedProfile.hobbies?.length || 0
            });
            console.log('✅ Enhanced profile created for AI:', {
              name: enhancedProfile.name,
              bio: enhancedProfile.bio ? 'present' : 'empty',
              interests: enhancedProfile.interests.length,
              passions: enhancedProfile.passions.length,
              hobbies: enhancedProfile.hobbies.length,
              skills: enhancedProfile.skills.length
            });
            setUserProfile(enhancedProfile);
            setDetailedProfile(enhancedProfile);
          } else {
            console.log('⚠️ No detailed profile found, using user_profiles.attributes data');
            const basicProfile = {
              name: userName,
              email: user.email,
              bio: bio,
              interests: interests,
              hobbies: hobbies,
              passions: passions,
              skills: skills,
              profile_questions: profileQuestions
            };
            console.log('✅ Basic profile created from user_profiles.attributes:', {
              name: basicProfile.name,
              bio: basicProfile.bio ? 'present' : 'empty',
              interests: basicProfile.interests.length,
              passions: basicProfile.passions.length,
              hobbies: basicProfile.hobbies.length,
              skills: basicProfile.skills.length
            });
            setUserProfile(basicProfile);
            setDetailedProfile(basicProfile);
          }
        } catch (error) {
          console.error('💥 Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Load conversation when loadConversation prop changes
  useEffect(() => {
    if (loadConversation) {
      // Parse the conversation content to recreate chat messages
      const conversationParts = loadConversation.content.split('\n\n');
      const messages: ChatMessage[] = [];

      conversationParts.forEach((part, index) => {
        if (part.startsWith('User: ')) {
          messages.push({
            type: 'user',
            content: part.substring(6), // Remove "User: " prefix
            timestamp: new Date(loadConversation.timestamp.getTime() + (index * 1000))
          });
        } else if (part.startsWith('AI: ')) {
          messages.push({
            type: 'ai',
            content: part.substring(4), // Remove "AI: " prefix
            timestamp: new Date(loadConversation.timestamp.getTime() + (index * 1000))
          });
        }
      });

      setChatMessages(messages);
      setIsInChatMode(true);

      // Set the current conversation ID so we can continue updating this conversation
      setCurrentConversationId(loadConversation.id);

      // Call the callback to let parent know conversation was loaded
      if (onConversationLoaded) {
        onConversationLoaded();
      }
    }
  }, [loadConversation, onConversationLoaded]);

  // Save/update conversation to recent strings when chat messages change
  useEffect(() => {
    if (chatMessages.length > 0 && isInChatMode) {
      // Create a conversation summary that includes ALL messages with proper formatting
      const conversationSummary = chatMessages
        .map(msg => `${msg.type === 'user' ? 'User' : 'AI'}: ${msg.content}`)
        .join('\n\n');

      // If we don't have a conversation ID yet, create one (new conversation)
      if (!currentConversationId) {
        // Generate a proper UUID for the conversation
        const newConversationId = crypto.randomUUID();
        setCurrentConversationId(newConversationId);

        // Create a new conversation entry
        const conversationString = {
          id: newConversationId,
          content: conversationSummary,
          timestamp: new Date()
        };

        setRecentStrings(prev => [conversationString, ...prev.slice(0, 9)]);

        // Save to database if user is authenticated
        saveConversationToDatabase(newConversationId, conversationSummary);
      } else {
        // Update existing conversation
        setRecentStrings(prev =>
          prev.map(str =>
            str.id === currentConversationId
              ? { ...str, content: conversationSummary, timestamp: new Date() }
              : str
          )
        );

        // Update in database if user is authenticated
        saveConversationToDatabase(currentConversationId, conversationSummary);
      }
    }
  }, [chatMessages, isInChatMode, currentConversationId, setRecentStrings]);

  const handleCreateJoin = () => {
    setIsCreateJoinModalOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File selection triggered', event.target.files);
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') ||
                         file.type === 'application/pdf' ||
                         file.type.startsWith('text/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    console.log('Valid files selected:', validFiles);
    setSelectedFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileSelect = () => {
    console.log('Triggering file select, fileInputRef:', fileInputRef.current);
    fileInputRef.current?.click();
  };

  const handleJoinCreated = (join: any) => {
    // Add the created join to recent strings as a conversation starter
    const joinMessage = `I just created a Join: "${join.title}". ${join.description}`;

    // Start a conversation about the created join
    setInputValue(joinMessage);
    if (!isInChatMode) {
      handleSubmitWithMessage(joinMessage);
    }

    toast({
      title: "Join Created!",
      description: `"${join.title}" is now live and ready for people to discover!`,
    });
  };

  const handleSubmitWithMessage = async (message: string) => {
    if (!message.trim()) return;

    setInputValue('');
    setIsLoading(true);

    // If this is the first message in a new conversation, reset conversation ID
    if (chatMessages.length === 0) {
      setCurrentConversationId(null);
    }

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newUserMessage]);
    setIsInChatMode(true);

    // Continue with the rest of the submit logic...
    await processMessage(message);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    await handleSubmitWithMessage(inputValue.trim());
  };

  const processMessage = async (userMessage: string) => {
    // We'll add the AI message when we start getting the response

    try {
      // Get AI response using authenticated API if user is logged in
      let aiResponse;
      let useAuthenticatedAPI = false;

      if (user && userProfile) {
        try {
          // Get user's session token for authentication
          const { data: { session } } = await supabase.auth.getSession();

          console.log('🔐 Session check:', {
            hasSession: !!session,
            hasAccessToken: !!session?.access_token,
            tokenLength: session?.access_token?.length,
            expiresAt: session?.expires_at
          });

          if (session?.access_token) {
            // Build enhanced context with detailed profile data
            const context = {
              user_profile: {
                ...userProfile,
                name: userName || 'User', // Use the userName we extracted
                contact_info: {
                  name: userName || 'User'
                }
              },
              detailed_profile: {
                ...detailedProfile,
                name: userName || 'User', // Use the userName we extracted
                contact_info: {
                  name: userName || 'User'
                }
              },
              conversation_history: chatMessages.slice(-5) // Last 5 messages for context
            };

            console.log('Sending AI request with enhanced context:', {
              user_profile: userProfile ? 'loaded' : 'null',
              detailed_profile: detailedProfile ? 'loaded' : 'null',
              context_being_sent: {
                user_profile_name: context.user_profile?.name,
                detailed_profile_name: context.detailed_profile?.name,
                bio: context.detailed_profile?.bio,
                interests: context.detailed_profile?.interests,
                hobbies: context.detailed_profile?.hobbies,
                passions: context.detailed_profile?.passions,
                skills: context.detailed_profile?.skills,
                profile_questions: context.detailed_profile?.profile_questions ?
                  Object.keys(context.detailed_profile.profile_questions).length + ' answers' : 'none'
              }
            });

            // Debug: Log the actual arrays being sent
            console.log('🎯 ACTUAL PROFILE DATA BEING SENT:', {
              name: context.detailed_profile?.name || context.user_profile?.name || userName,
              contact_info: context.detailed_profile?.contact_info || context.user_profile?.contact_info,
              interests_array: context.detailed_profile?.interests,
              passions_array: context.detailed_profile?.passions,
              hobbies_array: context.detailed_profile?.hobbies,
              skills_array: context.detailed_profile?.skills,
              bio_text: context.detailed_profile?.bio
            });

            // Prepare profile data for the authenticated endpoint
            const profileData = {
              name: userName || 'User',
              contact_info: {
                name: userName || 'User'
              },
              interests: detailedProfile?.interests || userProfile?.interests || [],
              passions: detailedProfile?.passions || userProfile?.passions || [],
              hobbies: detailedProfile?.hobbies || userProfile?.hobbies || [],
              skills: detailedProfile?.skills || userProfile?.skills || [],
              bio: detailedProfile?.bio || userProfile?.bio || '',
              profile_questions: detailedProfile?.profile_questions || userProfile?.profile_questions || {},
              // Add age, location, and birthday for AI context
              age: detailedProfile?.age || userProfile?.age || null,
              location: detailedProfile?.location || userProfile?.location || null,
              birthday: detailedProfile?.birthday || userProfile?.birthday || null
            };

            console.log('🔍 DEBUG: Profile data being sent to backend:', {
              ...profileData,
              profile_questions_count: Object.keys(profileData.profile_questions).length
            });

            // Call authenticated endpoint directly with proper headers
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/lifestring-chat`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                message: userMessage,
                context,
                profile_data: profileData  // Add profile data to authenticated endpoint
              })
            });

            if (response.ok) {
              const data = await response.json();
              aiResponse = data.message;

              // Check if the authenticated API returned an error message (fallback response)
              const isErrorResponse = aiResponse && (
                aiResponse.includes("I'm having trouble connecting") ||
                aiResponse.includes("trouble connecting") ||
                data.intent === "error"
              );

              if (isErrorResponse) {
                console.warn('🔄 Authenticated API returned error response, falling back to public API:', aiResponse);
                useAuthenticatedAPI = false; // Force fallback to public API
              } else {
                useAuthenticatedAPI = true;
                console.log('✅ Authenticated API response received:', aiResponse);

                // Simulate streaming for authenticated response
                if (aiResponse) {
                  // Hide loading indicator as soon as we start streaming
                  setIsLoading(false);

                  // Add the AI message when we start streaming
                  let actualAiMessageIndex: number;
                  setChatMessages(prev => {
                    const newMessages = [...prev, { type: 'ai' as const, content: '', timestamp: new Date() }];
                    actualAiMessageIndex = newMessages.length - 1; // The AI message is the last one
                    return newMessages;
                  });

                  let currentText = '';

                  for (let i = 0; i < aiResponse.length; i++) {
                    currentText += aiResponse[i];
                    setChatMessages(prev => {
                      const newMessages = [...prev];
                      if (newMessages[actualAiMessageIndex]) {
                        newMessages[actualAiMessageIndex] = {
                          type: 'ai',
                          content: currentText,
                          timestamp: new Date()
                        };
                      }
                      return newMessages;
                    });

                    // Add delay between characters to simulate realistic typing
                    // Faster for spaces, slower for punctuation
                    let delay = 30;
                    if (aiResponse[i] === ' ') delay = 20;
                    else if (['.', '!', '?', ','].includes(aiResponse[i])) delay = 150;
                    else if (aiResponse[i] === '\n') delay = 100;

                    await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 20));
                  }
                }
              }
            } else {
              const errorText = await response.text();
              console.warn(`Authenticated API failed: ${response.status} - ${errorText}, falling back to public API`);

              // If it's a 401, try to refresh the session
              if (response.status === 401) {
                console.log('🔄 Attempting to refresh session...');
                const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
                if (refreshedSession && !refreshError) {
                  console.log('✅ Session refreshed successfully');
                  // Could retry the request here, but for now just fall back to public API
                } else {
                  console.warn('❌ Session refresh failed:', refreshError);
                }
              }
            }
          }
        } catch (authError) {
          console.warn('Authentication failed, falling back to public API:', authError);
        }
      }

      // Fallback to public endpoint if authentication failed or user not logged in
      if (!useAuthenticatedAPI) {
        // Prepare profile data for the public endpoint
        const profileData = {
          name: userName || 'User',
          contact_info: {
            name: userName || 'User'
          },
          interests: userProfile?.interests || ['hiking', 'boating', 'climbing'],
          passions: userProfile?.passions || ['hiking', 'boating', 'climbing'],
          hobbies: userProfile?.hobbies || ['hiking', 'boating', 'climbing'],
          skills: userProfile?.skills || [],
          bio: userProfile?.bio || 'I enjoy outdoor activities and connecting with like-minded people.',
          profile_questions: userProfile?.profile_questions || {},
          // Add age, location, and birthday for AI context
          age: detailedProfile?.age || userProfile?.age || null,
          location: detailedProfile?.location || userProfile?.location || null,
          birthday: detailedProfile?.birthday || userProfile?.birthday || null
        };

        console.log('🔄 FALLBACK: Using public endpoint with profile data:', profileData);
        console.log('🎯 userName value being sent:', userName);
        console.log('🎯 userProfile?.name value:', userProfile?.name);
        console.log('🎯 FINAL PROFILE DATA NAME:', profileData.name);
        console.log('🎯 FINAL PROFILE DATA CONTACT_INFO.NAME:', profileData.contact_info.name);
        console.log('🚀 GPT-5 Backend URL:', import.meta.env.VITE_BACKEND_URL);

        const fallbackResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/lifestring-chat-public`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            context: {},
            profile_data: profileData  // Add profile data to public endpoint
          })
        });

        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          aiResponse = data.message;
          console.log('✅ Public API response received:', aiResponse);

          // Simulate streaming for public response
          if (aiResponse) {
            // Hide loading indicator as soon as we start streaming
            setIsLoading(false);

            // Add the AI message when we start streaming
            let actualAiMessageIndex: number;
            setChatMessages(prev => {
              const newMessages = [...prev, { type: 'ai' as const, content: '', timestamp: new Date() }];
              actualAiMessageIndex = newMessages.length - 1; // The AI message is the last one
              return newMessages;
            });

            let currentText = '';

            for (let i = 0; i < aiResponse.length; i++) {
              currentText += aiResponse[i];
              setChatMessages(prev => {
                const newMessages = [...prev];
                if (newMessages[actualAiMessageIndex]) {
                  newMessages[actualAiMessageIndex] = {
                    type: 'ai',
                    content: currentText,
                    timestamp: new Date()
                  };
                }
                return newMessages;
              });

              // Add delay between characters to simulate realistic typing
              // Faster for spaces, slower for punctuation
              let delay = 30;
              if (aiResponse[i] === ' ') delay = 20;
              else if (['.', '!', '?', ','].includes(aiResponse[i])) delay = 150;
              else if (aiResponse[i] === '\n') delay = 100;

              await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 20));
            }
          }
        } else {
          const errorText = await fallbackResponse.text();
          console.error('❌ Public API failed:', fallbackResponse.status, errorText);
          throw new Error(`Both authenticated and public APIs failed. Public API error: ${fallbackResponse.status} - ${errorText}`);
        }
      }

      // Note: Conversation will be automatically saved to recent strings via useEffect

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col px-4 pt-8">

        {!isInChatMode ? (
          /* Initial Mode Layout - Smaller Centered Design */
          <div className="w-full max-w-2xl mx-auto mt-16 px-8">
            <div className="text-center mb-8">
              {/* Replace "Strings" heading with Lifestring Logo */}
              <div className="mb-6">
                <img
                  src={lifestringLogo}
                  alt="Lifestring"
                  className="h-40 w-auto mx-auto object-contain"
                />
              </div>

            </div>

            {/* File Upload Preview for Initial Mode */}
            {selectedFiles.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center bg-gray-50 rounded-lg px-3 py-2 text-sm">
                      {file.type.startsWith('image/') ? (
                        <Image className="h-4 w-4 mr-2 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2 text-green-500" />
                      )}
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-2 text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat-like Single Line Input */}
            <div className="relative bg-white rounded-full border border-gray-200 shadow-sm mb-6 px-4 py-3 flex items-center space-x-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What are you looking for on LifeString?"
                className="border-0 focus-visible:ring-0 text-base bg-white flex-1 !text-black"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={triggerFileSelect}
                  className="text-gray-400 hover:text-gray-600 p-2 h-8 w-8"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim() && selectedFiles.length === 0}
                  className="rounded-full h-8 w-8 p-0 flex items-center justify-center text-black border border-gray-300"
                  style={{ backgroundColor: selectedOrbColor }}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mb-4 text-center text-sm text-gray-500">
                {selectedFiles.length} file(s) selected
              </div>
            )}

            {/* Create Join Button - Below Input */}
            <div className="flex justify-center mb-4">
              <Button
                onClick={handleCreateJoin}
                variant="outline"
                className="text-sm px-6 py-2 border-2 hover:bg-gray-50 rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Join
              </Button>
            </div>





          </div>
        ) : (
          /* Chat Mode Layout - Scrollable with Fixed Input */
          <div className="flex flex-col h-screen">
            {/* Top Section with Action Buttons */}
            <div className="w-full max-w-4xl ml-8 flex-shrink-0">
              <div className="flex justify-between items-center mb-4">
                <Button
                  onClick={handleCreateJoin}
                  variant="outline"
                  className="text-sm px-4 py-2 border-2 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Join
                </Button>

                <Button
                  onClick={() => {
                    setChatMessages([]);
                    setCurrentConversationId(null);
                    setIsInChatMode(false);
                  }}
                  variant="outline"
                  className="text-sm px-4 py-2"
                >
                  New Chat
                </Button>
              </div>
            </div>

            {/* Scrollable Messages Area */}
            <div className="flex-1 w-full max-w-4xl ml-8 overflow-hidden flex flex-col">
              <div
                ref={chatContainerRef}
                className="flex-1 space-y-4 overflow-y-auto pr-4"
              >
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 ${
                      message.type === 'user'
                        ? '!text-black rounded-2xl shadow-sm'
                        : '!text-black bg-transparent border-l-4 border-gray-200 pl-4 ml-2'
                    }`}
                    style={message.type === 'user' ? { backgroundColor: selectedOrbColor } : {}}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed !text-black">{message.content}</p>
                    </div>
                  </div>
                ))}

                {/* Single pulsing dot loading indicator */}
                {isLoading && (
                  <div className="flex justify-start mb-2">
                    <div className="max-w-[80%] p-4 !text-black bg-transparent border-l-4 border-gray-200 pl-4 ml-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                )}

              </div>

              {/* Fixed Input Section at Bottom */}
              <div className="flex-shrink-0 mt-4 border-t border-gray-100 pt-4">
                {/* File Upload Preview */}
                {selectedFiles.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center bg-gray-50 rounded-lg px-3 py-2 text-sm">
                          {file.type.startsWith('image/') ? (
                            <Image className="h-4 w-4 mr-2 text-blue-500" />
                          ) : (
                            <FileText className="h-4 w-4 mr-2 text-green-500" />
                          )}
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button
                            onClick={() => removeFile(index)}
                            className="ml-2 text-gray-400 hover:text-red-500"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Box - Same Style as Home Page */}
                <div className="relative bg-white rounded-full border border-gray-200 shadow-sm mb-6 px-4 py-3 flex items-center space-x-3">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Continue the conversation..."
                    className="border-0 focus-visible:ring-0 text-base bg-white flex-1 !text-black"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={triggerFileSelect}
                      className="text-gray-400 hover:text-gray-600 p-2 h-8 w-8"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>

                    <Button
                      onClick={handleSubmit}
                      disabled={(!inputValue.trim() && selectedFiles.length === 0) || isLoading}
                      className="rounded-full h-8 w-8 p-0 flex items-center justify-center text-black border border-gray-300"
                      style={{ backgroundColor: selectedOrbColor }}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mb-4 text-center text-sm text-gray-500">
                    {selectedFiles.length} file(s) selected
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Join Modal */}
      <CreateJoinModal
        isOpen={isCreateJoinModalOpen}
        onClose={() => setIsCreateJoinModalOpen(false)}
        onJoinCreated={handleJoinCreated}
      />

      {/* Global Hidden file input - works for both modes */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.txt,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default StringsInterface;

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, userId, houseId } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    console.log('Analyzing prompt:', prompt);

    // Use OpenAI to analyze the prompt and extract key information
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI that analyzes user prompts to extract key information for matching people. 
            Extract: 
            1. Intent/goal (what they want to do)
            2. Skills they need from others
            3. Skills they have to offer
            4. Interests involved
            5. Type of collaboration (business, social, creative, etc.)
            
            Return a JSON object with these fields:
            {
              "intent": "brief description",
              "skills_needed": ["skill1", "skill2"],
              "skills_offered": ["skill1", "skill2"],
              "interests": ["interest1", "interest2"],
              "collaboration_type": "type",
              "keywords": ["keyword1", "keyword2"]
            }`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    const analysisData = await analysisResponse.json();
    const analysis = JSON.parse(analysisData.choices[0].message.content);
    
    console.log('Extracted analysis:', analysis);

    // Search for compatible users in detailed_profiles
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('detailed_profiles')
      .select('*')
      .neq('user_id', userId);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} profiles to analyze`);

    // Calculate compatibility scores for each profile
    const recommendations = profiles?.map(profile => {
      let score = 0;
      const reasons = [];

      // Check for matching skills
      const userSkills = profile.skills || [];
      const userInterests = profile.interests || [];
      const userPassions = profile.passions || [];
      const userHobbies = profile.hobbies || [];

      // Skills matching
      analysis.skills_needed?.forEach(skill => {
        if (userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )) {
          score += 30;
          reasons.push(`Has ${skill} skills you need`);
        }
      });

      // Interest matching
      analysis.interests?.forEach(interest => {
        if ([...userInterests, ...userPassions, ...userHobbies].some(userInt => 
          userInt.toLowerCase().includes(interest.toLowerCase()) || 
          interest.toLowerCase().includes(userInt.toLowerCase())
        )) {
          score += 20;
          reasons.push(`Shares interest in ${interest}`);
        }
      });

      // Keyword matching in bio
      if (profile.bio) {
        analysis.keywords?.forEach(keyword => {
          if (profile.bio.toLowerCase().includes(keyword.toLowerCase())) {
            score += 10;
            reasons.push(`Bio mentions ${keyword}`);
          }
        });
      }

      // Goals and ambitions matching
      if (profile.goals || profile.ambitions) {
        const goalText = `${profile.goals || ''} ${profile.ambitions || ''}`.toLowerCase();
        analysis.keywords?.forEach(keyword => {
          if (goalText.includes(keyword.toLowerCase())) {
            score += 15;
            reasons.push(`Goals align with ${keyword}`);
          }
        });
      }

      return {
        user_id: profile.user_id,
        score,
        reasons: reasons.slice(0, 3), // Top 3 reasons
        profile
      };
    }).filter(rec => rec.score > 0) // Only include users with some compatibility
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10 matches

    console.log(`Generated ${recommendations?.length || 0} recommendations`);

    // Create the post first
    const { data: newPost, error: postError } = await supabaseClient
      .from('posts')
      .insert([{
        title: analysis.intent,
        content: prompt,
        category: 'string',
        user_id: userId,
        tags: analysis.keywords
      }])
      .select()
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      throw postError;
    }

    console.log('Created post:', newPost);

    // Save recommendations to post_recommendations table
    if (recommendations && recommendations.length > 0) {
      const recommendationInserts = recommendations.map(rec => ({
        post_id: newPost.id,
        user_id: rec.user_id,
        score: rec.score,
        reason: rec.reasons.join(', ')
      }));

      const { error: recError } = await supabaseClient
        .from('post_recommendations')
        .insert(recommendationInserts);

      if (recError) {
        console.error('Error saving recommendations:', recError);
        // Don't throw here, as the post was already created successfully
      } else {
        console.log(`Saved ${recommendationInserts.length} recommendations`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      post: newPost,
      analysis,
      recommendations_count: recommendations?.length || 0,
      top_matches: recommendations?.slice(0, 5).map(r => ({
        user_id: r.user_id,
        score: r.score,
        reasons: r.reasons
      })) || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-string-prompt function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
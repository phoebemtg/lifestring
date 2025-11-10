


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";






CREATE TYPE "public"."connection_status" AS ENUM (
    'pending',
    'accepted',
    'declined',
    'blocked'
);


ALTER TYPE "public"."connection_status" OWNER TO "postgres";


CREATE TYPE "public"."message_status" AS ENUM (
    'sent',
    'delivered',
    'read'
);


ALTER TYPE "public"."message_status" OWNER TO "postgres";


CREATE TYPE "public"."recommendation_status" AS ENUM (
    'generated',
    'viewed',
    'accepted',
    'dismissed'
);


ALTER TYPE "public"."recommendation_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_claim"("claim" "text") RETURNS "jsonb"
    LANGUAGE "sql" STABLE
    AS $$
  select nullif(current_setting('request.jwt.claims', true), '')::jsonb -> 'app_metadata' -> claim;
$$;


ALTER FUNCTION "public"."get_my_claim"("claim" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  insert into public.user_profiles (
    user_id,
    contact_info,
    social_links,
    attributes,
    biography
  )
  values (
    new.id,
    -- Builds the contact_info object
    jsonb_build_object(
      'name', new.raw_user_meta_data ->> 'name',
      'email', new.email,
      'phone', new.phone,
      'location', '',
      'birthday', null,
      'website', ''
    ),
    -- Builds the social_links object
    jsonb_build_object(
      'instagram', '',
      'twitter', '',
      'linkedin', ''
    ),
    -- Builds the profile_attributes object with empty arrays
    jsonb_build_object(
      'passions', '[]'::jsonb,
      'hobbies', '[]'::jsonb,
      'questions', '[]'::jsonb,
      'interests', '[]'::jsonb,
      'skills', '[]'::jsonb,
      'enneagram', ''
    ),
    -- Builds the biography object
    jsonb_build_object(
      'bio', '',
      'ambitions', '',
      'dreams', '',
      'goals', '',
      'education', '',
      'work', '',
      'relationship_status', '',
      'looking_for', ''
    )
  );
  return new;
end;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_user_update"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
 update public.user_profiles
 set
   contact_info = contact_info || jsonb_build_object(
     'name', new.raw_user_meta_data ->> 'name',
     'email', new.email,
     'phone', new.phone
   )
 where user_id = new.id;
 return new;
end;
$$;


ALTER FUNCTION "public"."handle_user_update"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cache" (
    "key" character varying(255) NOT NULL,
    "value" "text" NOT NULL,
    "expiration" integer NOT NULL
);


ALTER TABLE "public"."cache" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cache_locks" (
    "key" character varying(255) NOT NULL,
    "owner" character varying(255) NOT NULL,
    "expiration" integer NOT NULL
);


ALTER TABLE "public"."cache_locks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."enneagrams" (
    "id" integer NOT NULL,
    "type_number" smallint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "attributes" "jsonb",
    CONSTRAINT "enneagrams_type_number_check" CHECK ((("type_number" >= 1) AND ("type_number" <= 9)))
);


ALTER TABLE "public"."enneagrams" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."enneagrams_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."enneagrams_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."enneagrams_id_seq" OWNED BY "public"."enneagrams"."id";



CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone,
    "location" "text",
    "meta_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "custom_fields" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "room_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."room_participants" (
    "room_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."room_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rooms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."rooms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."string_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "string_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "parent_comment_id" "uuid",
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."string_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."string_embeddings" (
    "id" bigint NOT NULL,
    "string_id" "uuid" NOT NULL,
    "embedding" "extensions"."vector"(1536) NOT NULL,
    "content_hash" "text" NOT NULL,
    "model_version" "text" DEFAULT 'text-embedding-3-small'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."string_embeddings" OWNER TO "postgres";


ALTER TABLE "public"."string_embeddings" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."string_embeddings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."string_likes" (
    "string_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."string_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."strings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content_text" "text",
    "content_images" "jsonb",
    "stringable_id" "uuid",
    "stringable_type" "text",
    "likes_count" integer DEFAULT 0 NOT NULL,
    "comments_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."strings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_connections" (
    "requester_id" "uuid" NOT NULL,
    "receiver_id" "uuid" NOT NULL,
    "status" "public"."connection_status" DEFAULT 'pending'::"public"."connection_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "check_not_self" CHECK (("requester_id" <> "receiver_id"))
);


ALTER TABLE "public"."user_connections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_embeddings" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "embedding" "extensions"."vector"(1536) NOT NULL,
    "content_hash" "text" NOT NULL,
    "model_version" "text" DEFAULT 'text-embedding-3-small'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_embeddings" OWNER TO "postgres";


ALTER TABLE "public"."user_embeddings" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_embeddings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_enneagrams" (
    "user_id" "uuid" NOT NULL,
    "enneagram_id" integer NOT NULL
);


ALTER TABLE "public"."user_enneagrams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "contact_info" "jsonb",
    "social_links" "jsonb",
    "attributes" "jsonb",
    "biography" "jsonb",
    "meta" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "is_admin" boolean DEFAULT false,
    "is_mod" boolean DEFAULT false
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_recommendations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "recommended_user_id" "uuid" NOT NULL,
    "similarity_score" numeric(5,4) NOT NULL,
    "status" "public"."recommendation_status" DEFAULT 'generated'::"public"."recommendation_status" NOT NULL,
    "context" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "check_not_self" CHECK (("user_id" <> "recommended_user_id")),
    CONSTRAINT "score_range" CHECK ((("similarity_score" >= (0)::numeric) AND ("similarity_score" <= (1)::numeric)))
);


ALTER TABLE "public"."user_recommendations" OWNER TO "postgres";


ALTER TABLE ONLY "public"."enneagrams" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."enneagrams_id_seq"'::"regclass");


ALTER TABLE ONLY "public"."cache_locks"
    ADD CONSTRAINT "cache_locks_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."cache"
    ADD CONSTRAINT "cache_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."enneagrams"
    ADD CONSTRAINT "enneagrams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."enneagrams"
    ADD CONSTRAINT "enneagrams_type_number_key" UNIQUE ("type_number");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."room_participants"
    ADD CONSTRAINT "room_participants_pkey" PRIMARY KEY ("room_id", "user_id");



ALTER TABLE ONLY "public"."rooms"
    ADD CONSTRAINT "rooms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."string_comments"
    ADD CONSTRAINT "string_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."string_embeddings"
    ADD CONSTRAINT "string_embeddings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."string_embeddings"
    ADD CONSTRAINT "string_embeddings_string_id_unique" UNIQUE ("string_id");



ALTER TABLE ONLY "public"."string_likes"
    ADD CONSTRAINT "string_likes_pkey" PRIMARY KEY ("string_id", "user_id");



ALTER TABLE ONLY "public"."strings"
    ADD CONSTRAINT "strings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_pkey" PRIMARY KEY ("requester_id", "receiver_id");



ALTER TABLE ONLY "public"."user_embeddings"
    ADD CONSTRAINT "user_embeddings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_embeddings"
    ADD CONSTRAINT "user_embeddings_user_id_unique" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_enneagrams"
    ADD CONSTRAINT "user_enneagrams_pkey" PRIMARY KEY ("user_id", "enneagram_id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_recommendations"
    ADD CONSTRAINT "user_recommendations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_recommendations"
    ADD CONSTRAINT "user_recommendations_user_id_recommended_user_id_key" UNIQUE ("user_id", "recommended_user_id");



CREATE INDEX "messages_room_id_idx" ON "public"."messages" USING "btree" ("room_id");



CREATE INDEX "messages_user_id_idx" ON "public"."messages" USING "btree" ("user_id");



CREATE INDEX "room_participants_user_id_idx" ON "public"."room_participants" USING "btree" ("user_id");



CREATE INDEX "user_connections_receiver_id_idx" ON "public"."user_connections" USING "btree" ("receiver_id");



CREATE INDEX "user_connections_requester_id_idx" ON "public"."user_connections" USING "btree" ("requester_id");



CREATE INDEX "user_recommendations_recommended_user_id_idx" ON "public"."user_recommendations" USING "btree" ("recommended_user_id");



CREATE INDEX "user_recommendations_user_id_idx" ON "public"."user_recommendations" USING "btree" ("user_id");


ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."room_participants"
    ADD CONSTRAINT "room_participants_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."room_participants"
    ADD CONSTRAINT "room_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."string_comments"
    ADD CONSTRAINT "string_comments_parent_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."string_comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."string_comments"
    ADD CONSTRAINT "string_comments_string_id_fkey" FOREIGN KEY ("string_id") REFERENCES "public"."strings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."string_comments"
    ADD CONSTRAINT "string_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."string_embeddings"
    ADD CONSTRAINT "string_embeddings_string_id_fkey" FOREIGN KEY ("string_id") REFERENCES "public"."strings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."string_likes"
    ADD CONSTRAINT "string_likes_string_id_fkey" FOREIGN KEY ("string_id") REFERENCES "public"."strings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."string_likes"
    ADD CONSTRAINT "string_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."strings"
    ADD CONSTRAINT "strings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_embeddings"
    ADD CONSTRAINT "user_embeddings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_enneagrams"
    ADD CONSTRAINT "user_enneagrams_enneagram_id_fkey" FOREIGN KEY ("enneagram_id") REFERENCES "public"."enneagrams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_enneagrams"
    ADD CONSTRAINT "user_enneagrams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_recommendations"
    ADD CONSTRAINT "user_recommendations_recommended_user_id_fkey" FOREIGN KEY ("recommended_user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_recommendations"
    ADD CONSTRAINT "user_recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE CASCADE;



CREATE POLICY "Super admins can do anything to profiles." ON "public"."user_profiles" USING (("public"."get_my_claim"('roles'::"text") ? 'super admin'::"text"));



CREATE POLICY "Users can manage their own posts." ON "public"."strings" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view and edit their own profile." ON "public"."user_profiles" USING (("auth"."uid"() = "user_id"));


ALTER TABLE "public"."cache" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cache_locks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."enneagrams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."room_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rooms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."string_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."string_embeddings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."string_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."strings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_connections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_embeddings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_enneagrams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_recommendations" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";















































































































































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_user_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_user_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_user_update"() TO "service_role";




























GRANT ALL ON TABLE "public"."cache" TO "anon";
GRANT ALL ON TABLE "public"."cache" TO "authenticated";
GRANT ALL ON TABLE "public"."cache" TO "service_role";



GRANT ALL ON TABLE "public"."cache_locks" TO "anon";
GRANT ALL ON TABLE "public"."cache_locks" TO "authenticated";
GRANT ALL ON TABLE "public"."cache_locks" TO "service_role";



GRANT ALL ON TABLE "public"."enneagrams" TO "anon";
GRANT ALL ON TABLE "public"."enneagrams" TO "authenticated";
GRANT ALL ON TABLE "public"."enneagrams" TO "service_role";



GRANT ALL ON SEQUENCE "public"."enneagrams_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."enneagrams_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."enneagrams_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."room_participants" TO "anon";
GRANT ALL ON TABLE "public"."room_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."room_participants" TO "service_role";



GRANT ALL ON TABLE "public"."rooms" TO "anon";
GRANT ALL ON TABLE "public"."rooms" TO "authenticated";
GRANT ALL ON TABLE "public"."rooms" TO "service_role";



GRANT ALL ON TABLE "public"."string_comments" TO "anon";
GRANT ALL ON TABLE "public"."string_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."string_comments" TO "service_role";



GRANT ALL ON TABLE "public"."string_embeddings" TO "anon";
GRANT ALL ON TABLE "public"."string_embeddings" TO "authenticated";
GRANT ALL ON TABLE "public"."string_embeddings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."string_embeddings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."string_embeddings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."string_embeddings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."string_likes" TO "anon";
GRANT ALL ON TABLE "public"."string_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."string_likes" TO "service_role";



GRANT ALL ON TABLE "public"."strings" TO "anon";
GRANT ALL ON TABLE "public"."strings" TO "authenticated";
GRANT ALL ON TABLE "public"."strings" TO "service_role";



GRANT ALL ON TABLE "public"."user_connections" TO "anon";
GRANT ALL ON TABLE "public"."user_connections" TO "authenticated";
GRANT ALL ON TABLE "public"."user_connections" TO "service_role";



GRANT ALL ON TABLE "public"."user_embeddings" TO "anon";
GRANT ALL ON TABLE "public"."user_embeddings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_embeddings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_embeddings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_embeddings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_embeddings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_enneagrams" TO "anon";
GRANT ALL ON TABLE "public"."user_enneagrams" TO "authenticated";
GRANT ALL ON TABLE "public"."user_enneagrams" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_recommendations" TO "anon";
GRANT ALL ON TABLE "public"."user_recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."user_recommendations" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































RESET ALL;

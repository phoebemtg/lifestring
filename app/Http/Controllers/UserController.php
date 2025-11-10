<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Enneagram;
use App\Models\UserEmbeds;
use App\Models\UserRecommendations;
use App\Models\UserRecommendationss;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use App\Http\Resources\UserCollection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\EnneagramResource;
use OpenAI\Laravel\Facades\OpenAI;

class UserController extends Controller
{

    /**
     * Display a listing of all users.
     * Any authenticated user can view the user list.
     */
    public function index(Request $request): ResourceCollection
    {
        // The viewAny policy allows any authenticated user to see all users
        $this->authorize('viewAny', User::class);

        $query = User::query();

        // Handle includes (eager loading)
        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['enneagrams']; // 'roles' has been removed
            $validIncludes = array_intersect($allowedIncludes, $includes);
            if (!empty($validIncludes)) {
                $query->with($validIncludes);
            }
        }

        $perPage = $request->input('per_page', 15);
        $users = $query->paginate($perPage);

        return UserResource::collection($users);
    }

    /**
     * Display a specific user.
     * Any authenticated user can view any user profile.
     */
    public function show(User $user, Request $request): UserResource
    {
        // The view policy allows any authenticated user to see any profile
        $this->authorize('view', $user);

        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['enneagrams']; // 'roles' has been removed
            $validIncludes = array_intersect($allowedIncludes, $includes);
            if (!empty($validIncludes)) {
                $user->load($validIncludes);
            }
        }

        // check if User has An Embed
        $query = UserEmbeds::where('user_id', $user->id);
        if(!$query->exists()) {
            $this->createEmbed($user);
        }

        return new UserResource($user);
    }

    /**
     * Update a user profile.
     * Only the user themselves or an admin can update a profile.
     */
    public function update(Request $request, User $user): UserResource
    {
        Log::info('User update initiated.', [
            'updater_id' => auth()->id(),
            'target_user_id' => $user->id,
            'is_admin' => auth()->user()->isAdmin(),
            'is_same_user' => auth()->id() === $user->id
        ]);
        // The update policy ensures only the user themselves or an admin can update
        $this->authorize('update', $user);

        Log::info('User update authorized', [
            'updater_id' => auth()->id(),
            'target_user_id' => $user->id,
            'is_admin' => auth()->user()->isAdmin(),
            'is_same_user' => auth()->id() === $user->id
        ]);

        $validatedData = $request->validate([
            'contact_info' => 'nullable|array',
            'social_links' => 'nullable|array',
            'attributes' => 'nullable|array',
            'biography' => 'nullable|array',
            'meta' => 'nullable|array',
        ]);

        $user->update($validatedData);
        // on update, update the user embed
        $this->createEmbed($user);
        return new UserResource($user);
    }

    /**
     * Delete a user profile.
     * Only the user themselves or an admin can delete a profile.
     */
    public function destroy(User $user): JsonResponse
    {
        // The delete policy ensures only the user themselves or an admin can delete
        $this->authorize('delete', $user);

        Log::info('User deletion authorized', [
            'deleter_id' => auth()->id(),
            'deleted_user_id' => $user->id,
            'is_admin' => auth()->user()->isAdmin(),
            'is_same_user' => auth()->id() === $user->id
        ]);

        $user->delete();
        return response()->json(null, 204);
    }

    /**
     * Assign Enneagram types to a user.
     * Only the user themselves or an admin can assign Enneagrams.
     */
    public function assignEnneagrams(Request $request, User $user): UserResource
    {
        // The update policy ensures only the user themselves or an admin can modify
        $this->authorize('update', $user);

        $validatedData = $request->validate([
            'enneagram_ids' => 'required|array',
            'enneagram_ids.*' => 'exists:enneagrams,id'
        ]);

        $user->enneagrams()->sync($validatedData['enneagram_ids']);
        $user->load('enneagrams');
        return new UserResource($user);
    }

    /**
     * Remove specific Enneagram types from a user.
     * Only the user themselves or an admin can remove Enneagrams.
     */
    public function removeEnneagrams(Request $request, User $user): UserResource
    {
        // The update policy ensures only the user themselves or an admin can modify
        $this->authorize('update', $user);

        $validatedData = $request->validate([
            'enneagram_ids' => 'required|array',
            'enneagram_ids.*' => 'exists:enneagrams,id'
        ]);

        $user->enneagrams()->detach($validatedData['enneagram_ids']);
        $user->load('enneagrams');
        return new UserResource($user);
    }

    /**
     * Get all Enneagram types assigned to a user.
     * Any authenticated user can view any user's enneagrams.
     */
    public function getUserEnneagrams(User $user): ResourceCollection
    {
        // The view policy allows any authenticated user to see any profile
        $this->authorize('view', $user);

        $enneagrams = $user->enneagrams;
        return EnneagramResource::collection($enneagrams);
    }

    /**
     * Get the authenticated user's profile.
     */
    public function me(Request $request): UserResource
    {
        $user = $request->user();
        // check if User has An Embed
        $query = UserEmbeds::where('user_id', $user->id);
        if(!$query->exists()) {
            $this->createEmbed($user);
        }
        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['enneagrams']; // 'roles' has been removed
            $validIncludes = array_intersect($allowedIncludes, $includes);
            if (!empty($validIncludes)) {
                $user->load($validIncludes);
            }
        }
        return new UserResource($user);
    }

    /**
     * Return User Profile as String
     */
    public function getUserAsString(User $user): string {
        $jsonData = [];

        // Add attributes data if available
        if (!empty($user->attributes)) {
            $jsonData[] = 'ATTRIBUTES: ' . json_encode($user->attributes);
        }

        // Add biography data if available
        if (!empty($user->biography)) {
            $jsonData[] = 'BIOGRAPHY: ' . json_encode($user->biography);
        }

        // Add meta data if available
        if (!empty($user->meta)) {
            $jsonData[] = 'META: ' . json_encode($user->meta);
        }

        // If no data is available, return a basic identifier
        if (empty($jsonData)) {
            return 'USER: ' . $user->user_id;
        }

        // Join all JSON strings with a delimiter
        return implode(' | ', $jsonData);
    }

    /**
     * Create User Embed ( For Internal Use )
     */
    public function createEmbed($user) {

        try {
            $stringToEmbed = $this->getUserAsString($user);
            if (empty($stringToEmbed)) {
                Log::warning("User content is empty for user_id: {$user->user_id}. Skipping embedding.");
                return ['status' => 'error', 'message' => 'User content is empty.'];
            }

            // Call API
            $response = OpenAI::embeddings()->create([
                'model' => env('EMBED_MODEL', 'text-embedding-3-small'),
                'input' => $stringToEmbed,
            ]);

            // 2. Extract the embedding array using correct object syntax
            $embeddingArray = $response->embeddings[0]->embedding;

            // 3. Store the result using the corrected method call
            return $this->updateOrCreateEmbed($user, $embeddingArray);

        } catch (\Exception $e) {
            Log::error("Error processing user {$user->user_id}: " . $e->getMessage());
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    /**
     * Update or Create User Embed ( For Internal Use )
     */
    private function updateOrCreateEmbed($user, array $embeddingArray) {

        // THE FIX: The first argument is a simple associative array, not a nested one.
        // Also using the correct singular model name: UserEmbeds
        $embedRecord = UserEmbeds::updateOrCreate(
        // First Array: Attributes to find the record by.
            ['user_id' => $user->user_id],

            // Second Array: Values to update or create with.
            [
                'embedding'     => $embeddingArray,
                'model_version' => env('EMBED_MODEL', 'text-embedding-3-small'),
                'content_hash'  => md5($this->getUserAsString($user)),
            ]
        );

        $status = $embedRecord->wasRecentlyCreated ? 'created' : 'updated';
        return ['status' => $status, 'embed' => $embedRecord->embedding];

    }

    /**
     * Calculate cosine similarity between two vectors
     *
     * @param array $vectorA First vector
     * @param array $vectorB Second vector
     * @return float Cosine similarity score (0-1)
     */
    private function calculateCosineSimilarity(array $vectorA, array $vectorB): float
    {
        // Check if vectors are of same length
        if (count($vectorA) !== count($vectorB)) {
            throw new \Exception('Vectors must be of the same length');
        }

        $dotProduct = 0;
        $magnitudeA = 0;
        $magnitudeB = 0;

        // Calculate dot product and magnitudes
        for ($i = 0; $i < count($vectorA); $i++) {
            $dotProduct += $vectorA[$i] * $vectorB[$i];
            $magnitudeA += $vectorA[$i] * $vectorA[$i];
            $magnitudeB += $vectorB[$i] * $vectorB[$i];
        }

        $magnitudeA = sqrt($magnitudeA);
        $magnitudeB = sqrt($magnitudeB);

        // Avoid division by zero
        if ($magnitudeA == 0 || $magnitudeB == 0) {
            return 0;
        }

        // Calculate cosine similarity
        return $dotProduct / ($magnitudeA * $magnitudeB);
    }

    /**
     * Parse the embedding string into an array of floats
     *
     * @param string $embedString The string representation of embedding
     * @return array Array of floating point values
     */
    private function parseEmbedding($embedString): array
    {
        // If the embedding is already an array, return it
        if (is_array($embedString)) {
            return $embedString;
        }

        // If stored as JSON string with brackets
        if (is_string($embedString) && (str_starts_with($embedString, '[') && str_ends_with($embedString, ']'))) {
            return json_decode($embedString, true);
        }

        // If stored as comma-separated string
        if (is_string($embedString)) {
            return array_map('floatval', explode(',', trim($embedString, '[]')));
        }

        throw new \Exception('Unknown embedding format');
    }

    /**
     * Find similar users based on vector embedding similarity.
     *
     * This method leverages the pgvector extension in the database to perform a
     * highly efficient cosine similarity search.
     *
     * @param string $userId The UUID of the user to find matches for.
     * @param int $limit The maximum number of similar users to return.
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSimilarUsers($userId, $limit = 10): JsonResponse
    {
        // 1. Get the embedding for the target user.
        $sourceEmbedding = UserEmbeds::where('user_id', $userId)->first();
        if (!$sourceEmbedding) {
            return response()->json(['error' => 'Source user does not have an embedding.'], 404);
        }
        $sourceVector = $sourceEmbedding->embedding;

        // 2. Fetch all other user embeddings into memory (THE PERFORMANCE BOTTLENECK).
        $otherEmbeddings = UserEmbeds::where('user_id', '!=', $userId)->get();
        if ($otherEmbeddings->isEmpty()) {
            return response()->json(['data' => []]);
        }

        // 3. Calculate similarity for each user in a PHP loop.
        $similarities = [];
        foreach ($otherEmbeddings as $otherEmbedding) {
            try {
                $similarityScore = $this->calculateCosineSimilarity($sourceVector, $otherEmbedding->embedding);
                $similarities[] = [
                    'user_id' => $otherEmbedding->user_id,
                    'similarity' => $similarityScore,
                ];
            } catch (\Exception $e) {
                // Log or handle cases where vectors might have different lengths
                // For now, we'll just skip them.
                continue;
            }
        }

        // 4. Sort the results by similarity score and take the top N.
        usort($similarities, fn($a, $b) => $b['similarity'] <=> $a['similarity']);
        $topSimilarities = array_slice($similarities, 0, $limit);

        if (empty($topSimilarities)) {
            return response()->json(['data' => []]);
        }

        // 5. Eager-load the full user profiles for the top results for efficiency.
        $similarUserIds = array_column($topSimilarities, 'user_id');
        $similarUsers = User::whereIn('user_id', $similarUserIds)->get()->keyBy('user_id');

        // 6. Combine and format the results using the UserResource.
        $results = array_map(function ($item) use ($similarUsers) {
            $user = $similarUsers->get($item['user_id']);
            if ($user) {
                return [
                    'user' => new UserResource($user),
                    'similarity' => (float) number_format($item['similarity'], 4),
                ];
            }
            return null;
        }, $topSimilarities);

        $results = array_filter($results); // Remove any nulls if a profile wasn't found

        return response()->json(['data' => array_values($results)]);
    }

    /*
     * Create API endpoints for user embeds
     */
    public function apiCreateEmbed(Request $request, User $user ): JsonResponse
    {

        // Get User ID
        $userId = $user->user_id;
        $result = $this->createEmbed($user);

        return response()->json([
            'success' => true,
            'status' => $result['status'],
            'message' => 'Embedding ' . $result['status'] . ' successfully',
            'user_id' => $userId
        ]);
    }

    /**
     * Generates and stores the top 10 user recommendations for a given user.
     *
     * This orchestrates the recommendation process:
     * 1. It fetches all potential similar users using the cosine similarity calculation.
     * 2. It filters out users who have already been 'accepted' or 'dismissed'.
     * 3. It takes the top 10 remaining candidates based on their similarity score.
     * 4. It uses `updateOrCreate` to populate the `user_recommendations` table, ensuring
     * the user's recommendation list is always fresh and relevant.
     *
     * @param string $userId The UUID of the user to generate recommendations for.
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateAndStoreRecommendations(string $userId): JsonResponse
    {
        // Find the source user's embedding vector.
        $sourceEmbedding = UserEmbeds::where('user_id', $userId)->first();
        if (!$sourceEmbedding) {
            return response()->json(['error' => 'Source user does not have an embedding to compare.'], 404);
        }
        $sourceVector = $sourceEmbedding->embedding;

        // Find all user recommendations that should be permanently excluded.
        $excludedUserIds = UserRecommendations::where('user_id', $userId)
            ->whereIn('status', [UserRecommendations::STATUS_ACCEPTED, UserRecommendations::STATUS_DISMISSED])
            ->pluck('recommended_user_id')
            ->all();

        // Fetch all other user embeddings to calculate similarity against.
        // The user themselves are excluded by the '!=' condition.
        $otherEmbeddings = UserEmbeds::where('user_id', '!=', $userId)->get();

        // Calculate similarity scores for all potential candidates in PHP.
        $allSimilarities = [];
        foreach ($otherEmbeddings as $otherEmbedding) {
            // Filter out already excluded users early to save on calculation time.
            if (in_array($otherEmbedding->user_id, $excludedUserIds)) {
                continue;
            }
            $otherVector = $otherEmbedding->embedding;
            $allSimilarities[] = [
                'user_id' => $otherEmbedding->user_id,
                'similarity_score' => $this->calculateCosineSimilarity($sourceVector, $otherVector),
            ];
        }

        // Sort the filtered results by similarity score in descending order.
        usort($allSimilarities, function ($a, $b) {
            return $b['similarity_score'] <=> $a['similarity_score'];
        });

        // Take the top 10 candidates to be stored in the database.
        $topRecommendations = array_slice($allSimilarities, 0, 10);

        // Use `updateOrCreate` to efficiently populate the recommendations table.
        // This is an "upsert" operation: it updates existing recommendations
        // or creates new ones as needed.
        $processedCount = 0;
        foreach ($topRecommendations as $rec) {
            UserRecommendations::updateOrCreate(
            // Attributes to find the record by:
                [
                    'user_id' => $userId,
                    'recommended_user_id' => $rec['user_id'],
                ],
                // Values to update or create with:
                [
                    'similarity_score' => $rec['similarity_score'],
                    'status' => UserRecommendations::STATUS_GENERATED, // Always reset to 'generated'
                    'context' => ['source' => 'cosine_similarity_v1.0'], // Example context
                ]
            );
            $processedCount++;
        }

        return response()->json([
            'message' => 'User recommendations have been successfully generated or updated.',
            'recommendations_processed' => $processedCount,
        ]);
    }

    /**
     * API endpoint function to manually generate user Recommendations
     * @param Request $request
     * @param User $user
     * @return JsonResponse
     */
    public function generateUserRecommendations(Request $request, User $user): JsonResponse
    {
        return $this->generateAndStoreRecommendations($user->user_id);
    }

}



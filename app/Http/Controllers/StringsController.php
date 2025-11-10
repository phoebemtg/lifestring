<?php

namespace App\Http\Controllers;

use App\Models\StringEmbeds;
use App\Models\Strings;
use App\Models\User;
use App\Models\UserEmbeds;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\StringsResource;
use App\Http\Resources\StringsCollection;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;

class StringsController extends Controller
{
    /**
     * Display a listing of strings with optional filtering.
     */
    public function index(Request $request): ResourceCollection
    {
        $this->authorize('viewAny', Strings::class);

        $query = Strings::query()->with('user');

        // Filter by user_id
        if ($request->has('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        // Filter by stringable type
        if ($request->has('stringable_type')) {
            $query->where('stringable_type', $request->input('stringable_type'));
        }

        // Filter by stringable id
        if ($request->has('stringable_id')) {
            $query->where('stringable_id', $request->input('stringable_id'));
        }

        // Include relationships
        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['user', 'comments', 'likes'];
            $validIncludes = array_intersect($allowedIncludes, $includes);

            if (!empty($validIncludes)) {
                $query->with($validIncludes);
            }
        }

        // Sorting
        $sortField = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_dir', 'desc');

        $allowedSortFields = ['created_at', 'likes_count', 'comments_count'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        }

        $perPage = $request->input('per_page', 15);
        $strings = $query->paginate($perPage);

        return StringsResource::collection($strings);
    }

    /**
     * Store a newly created string.
     */
    public function store(Request $request): JsonResource
    {
        $this->authorize('create', Strings::class);

        $validatedData = $request->validate([
            'content_text' => 'nullable|string',
            'content_images' => 'nullable|array',
            'content_images.*' => 'string|url',
            'stringable_id' => 'nullable|uuid',
            'stringable_type' => 'nullable|string|required_with:stringable_id',
        ]);

        // At least one of content_text or content_images must be provided
        if (empty($validatedData['content_text']) && empty($validatedData['content_images'])) {
            return response()->json([
                'message' => 'At least one of content_text or content_images must be provided.',
                'errors' => [
                    'content' => ['The string must have text or image content.']
                ]
            ], 422);
        }

        // Set user_id to the authenticated user
        $validatedData['user_id'] = $request->user()->user_id;

        $string = Strings::create($validatedData);

        $this->createEmbed($string);

        return new StringsResource($string);
    }

    /**
     * Display the specified string.
     */
    public function show(Strings $string, Request $request): JsonResource
    {
        $this->authorize('view', $string);

        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['user', 'comments', 'likes'];
            $validIncludes = array_intersect($allowedIncludes, $includes);

            if (!empty($validIncludes)) {
                $string->load($validIncludes);
            }
        }

        return new StringsResource($string);
    }

    /**
     * Update the specified string.
     */
    public function update(Request $request, Strings $string): JsonResource
    {
        $this->authorize('update', $string);

        $validatedData = $request->validate([
            'content_text' => 'nullable|string',
            'content_images' => 'nullable|array',
            'content_images.*' => 'string|url',
        ]);

        // If both content_text and content_images are null/empty, return an error
        if ((isset($validatedData['content_text']) && $validatedData['content_text'] === null) &&
            (isset($validatedData['content_images']) && empty($validatedData['content_images']))) {
            return response()->json([
                'message' => 'Cannot empty all content. The string must have text or image content.',
                'errors' => [
                    'content' => ['The string must have text or image content.']
                ]
            ], 422);
        }

        $string->update($validatedData);

        $this->createEmbed($string);

        return new StringsResource($string);
    }

    /**
     * Remove the specified string.
     */
    public function destroy(Strings $string): JsonResponse
    {
        $this->authorize('delete', $string);

        $string->delete();

        return response()->json(null, 204);
    }

    /**
     * Toggle a like on a string.
     */
    public function toggleLike(Strings $string, Request $request): JsonResponse
    {
        $userId = $request->user()->user_id;

        // Check if the like already exists
        $existingLike = \App\Models\StringLike::where('string_id', $string->id)
            ->where('user_id', $userId)
            ->first();

        if ($existingLike) {
            // If like exists, delete it using the composite key (unlike)
            \App\Models\StringLike::where('string_id', $string->id)
                ->where('user_id', $userId)
                ->delete();
            $string->unlike($userId);
            $action = 'unliked';
        } else {
            // If like doesn't exist, create it
            $string->like($userId);
            $action = 'liked';
        }

        // Get updated like count
        $likesCount = \App\Models\StringLike::where('string_id', $string->id)->count();

        return response()->json([
            'message' => 'String ' . $action . ' successfully.',
            'likes_count' => $likesCount,
            'action' => $action
        ]);
    }

    /**
     * Get all strings for the authenticated user.
     */
    public function myStrings(Request $request): ResourceCollection
    {
        $user = $request->user();

        $query = Strings::where('user_id', $user->user_id);

        // Sorting
        $sortField = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_dir', 'desc');

        $allowedSortFields = ['created_at', 'likes_count', 'comments_count'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        }

        $perPage = $request->input('per_page', 15);
        $strings = $query->paginate($perPage);

        return StringsResource::collection($strings);
    }

    /**
     * Get strings liked by the authenticated user.
     */
    public function myLikedStrings(Request $request): ResourceCollection
    {
        $user = $request->user();

        $query = $user->likedStrings();

        // Sorting
        $sortField = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_dir', 'desc');

        $allowedSortFields = ['created_at', 'likes_count', 'comments_count'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy('strings.' . $sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        }

        $perPage = $request->input('per_page', 15);
        $strings = $query->paginate($perPage);

        return StringsResource::collection($strings);
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

    private function getItemAsString(Strings $string): string {
        $stringText = $string->content_text ?? '';

        $stringPoster = $this->getUserAsString(User::where('user_id', $string->user_id)->first());

        return $stringText . ' | ' . $stringPoster;
    }

    public function createEmbed(Strings $string) {

        try {
            $stringToEmbed = $this->getItemAsString($string);
            if (empty($stringToEmbed)) {
                Log::warning("Content is empty. Skipping embedding. ");;
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
            return $this->updateOrCreateEmbed($string, $embeddingArray);

        } catch (\Exception $e) {
            Log::error("Error processing  " . $e->getMessage());
            return ['status' => 'error', 'message' => $e->getMessage()];
        }

    }

    /**
     * Update or Create User Embed ( For Internal Use )
     */
    private function updateOrCreateEmbed($string, array $embeddingArray) {

        // THE FIX: The first argument is a simple associative array, not a nested one.
        // Also using the correct singular model name: UserEmbeds
        $embedRecord = StringEmbeds::updateOrCreate(
        // First Array: Attributes to find the record by.
            ['string_id' => $string->id],

            // Second Array: Values to update or create with.
            [
                'embedding'     => $embeddingArray,
                'model_version' => env('EMBED_MODEL', 'text-embedding-3-small'),
                'content_hash'  => md5($this->getItemAsString($string)),
            ]
        );

        $status = $embedRecord->wasRecentlyCreated ? 'created' : 'updated';
        return ['status' => $status, 'embed' => $embedRecord->embedding];

    }

    /**
     * Get string recommendations for the authenticated user based on embedding similarity.
     *
     * @param Request $request
     * @return ResourceCollection
     */
    public function getRecommendedStrings(Request $request): ResourceCollection
    {
        $user = $request->user();
        $perPage = $request->input('per_page', 15);
        $excludeOwn = $request->boolean('exclude_own', true);
        $threshold = $request->input('similarity_threshold', 0.2);

        // Get the user's latest embedding
        $userEmbed = \App\Models\UserEmbeds::where('user_id', $user->user_id)
            ->orderBy('updated_at', 'desc')
            ->first();

        if (!$userEmbed || empty($userEmbed->embedding)) {
            // If no user embedding exists, return recent strings instead
            $query = Strings::query()->with('user');

            if ($excludeOwn) {
                $query->where('user_id', '!=', $user->user_id);
            }

            $strings = $query->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return StringsResource::collection($strings)
                ->additional(['message' => 'No user embedding found. Showing recent strings instead.']);
        }

        // Get all string embeddings
        $stringEmbeds = StringEmbeds::all();
        Log:info('String Count: ' . $stringEmbeds->count());
        if ($stringEmbeds->isEmpty()) {
            // If no string embeddings exist, return recent strings instead
            $query = Strings::query()->with('user');

            if ($excludeOwn) {
                $query->where('user_id', '!=', $user->user_id);
            }

            $strings = $query->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return StringsResource::collection($strings)
                ->additional(['message' => 'No string embeddings found. Showing recent strings instead.']);
        }

        // Calculate similarity scores
        $similarities = [];
        foreach ($stringEmbeds as $stringEmbed) {
            if (!$stringEmbed->string) {
                Log::debug("Skipping string_embed_id: {$stringEmbed->id} because its related string is missing.");
                continue;
            }

            if ($excludeOwn && $stringEmbed->string->user_id === $user->user_id) {
                Log::debug("Skipping string_id: {$stringEmbed->string_id} because it belongs to the current user and exclude_own is true.");
                continue;
            }

            try {
                Log::info('Calculating similarity for string_id: ' . $stringEmbed->string_id);
                $similarity = $this->calculateCosineSimilarity(
                    $userEmbed->embedding,
                    $stringEmbed->embedding
                );

                Log::debug("Calculated similarity for string_id {$stringEmbed->string_id}: {$similarity}");

                // THRESHOLD CHECK: Only add the string if it meets the similarity criteria.
                if ($similarity >= $threshold) {
                    $similarities[] = [
                        'string_id' => $stringEmbed->string_id,
                        'similarity' => $similarity,
                        'created_at' => $stringEmbed->string->created_at
                    ];
                }

            } catch (\Exception $e) {
                Log::error("Error calculating similarity for string_id {$stringEmbed->string_id}: " . $e->getMessage());
                continue;
            }
        }

        // Sort by similarity (desc) and then by creation date (desc)
        usort($similarities, function ($a, $b) {
            // First compare by similarity
            $similarityDiff = $b['similarity'] - $a['similarity'];

            if (abs($similarityDiff) > 0.05) {
                // If similarity difference is significant, sort by similarity
                return $similarityDiff > 0 ? 1 : -1;
            } else {
                // If similarities are close, sort by date (newest first)
                return $b['created_at'] <=> $a['created_at'];
            }
        });

        // Get the string ids in order
        $stringIds = array_map(function ($item) {
            return $item['string_id'];
        }, $similarities);

        if (empty($stringIds)) {
            // If no matching strings, return recent strings instead
            $query = Strings::query()->with('user');

            if ($excludeOwn) {
                $query->where('user_id', '!=', $user->user_id);
            }

            $strings = $query->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return StringsResource::collection($strings)
                ->additional(['message' => 'No similar strings found. Showing recent strings instead.']);
        }

        // Retrieve strings in the order of similarity
        $strings = Strings::whereIn('id', $stringIds)
            ->with('user')
            ->get()
            ->sortBy(function ($string) use ($stringIds) {
                return array_search($string->id, $stringIds);
            })
            ->values();

        // Paginate manually
        $page = $request->input('page', 1);
        $offset = ($page - 1) * $perPage;
        $paginatedStrings = $strings->slice($offset, $perPage)->values();

        $paginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $paginatedStrings,
            $strings->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return StringsResource::collection($paginator)
            ->additional(['similarities' => $similarities]);
    }

}

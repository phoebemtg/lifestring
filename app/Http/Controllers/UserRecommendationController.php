<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserRecommendations as UserRecommendation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\UserRecommendationResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class UserRecommendationController extends Controller
{
    /**
     * Display a listing of recommendations for a user.
     */
    public function index(Request $request): ResourceCollection
    {
        $user = $request->user();

        $query = UserRecommendation::where('user_id', $user->user_id);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Include relationships if requested
        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['recommendedUser'];
            $validIncludes = array_intersect($allowedIncludes, $includes);

            if (!empty($validIncludes)) {
                $query->with($validIncludes);
            }
        }

        // Sorting options
        $sortField = $request->input('sort_by', 'similarity_score');
        $sortDirection = $request->input('sort_dir', 'desc');

        $allowedSortFields = ['similarity_score', 'created_at', 'status'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection);
        }

        $perPage = $request->input('per_page', 15);
        $recommendations = $query->paginate($perPage);

        return UserRecommendationResource::collection($recommendations);
    }

    /**
     * Store a newly created recommendation.
     */
    public function store(Request $request): JsonResource
    {
        $validatedData = $request->validate([
            'recommended_user_id' => 'required|uuid|exists:user_profiles,user_id',
            'similarity_score' => 'nullable|numeric|min:0|max:1',
            'status' => 'nullable|string|in:pending,accepted,rejected',
            'metadata' => 'nullable|array',
        ]);

        $user = $request->user();

        // Prevent recommending themselves
        if ($user->user_id === $validatedData['recommended_user_id']) {
            return response()->json([
                'message' => 'Cannot recommend yourself.',
                'errors' => [
                    'recommended_user_id' => ['Cannot recommend yourself.']
                ]
            ], 422);
        }

        // Check if recommendation already exists
        $existingRecommendation = UserRecommendation::where([
            'user_id' => $user->user_id,
            'recommended_user_id' => $validatedData['recommended_user_id']
        ])->first();

        if ($existingRecommendation) {
            return response()->json([
                'message' => 'Recommendation already exists.',
                'errors' => [
                    'recommended_user_id' => ['Recommendation already exists.']
                ]
            ], 422);
        }

        // Create the recommendation
        $recommendation = new UserRecommendation();
        $recommendation->user_id = $user->user_id;
        $recommendation->recommended_user_id = $validatedData['recommended_user_id'];
        $recommendation->similarity_score = $validatedData['similarity_score'] ?? null;
        $recommendation->status = $validatedData['status'] ?? 'pending';
        $recommendation->metadata = $validatedData['metadata'] ?? null;
        $recommendation->save();

        // Optionally load the recommended user for the response
        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            if (in_array('recommendedUser', $includes)) {
                $recommendation->load('recommendedUser');
            }
        }

        return new UserRecommendationResource($recommendation);
    }

    /**
     * Display the specified recommendation.
     */
    public function show(Request $request, UserRecommendation $recommendation): JsonResource
    {
        // Ensure the user can only see their own recommendations
        if ($request->user()->user_id !== $recommendation->user_id) {
            return response()->json([
                'message' => 'You are not authorized to view this recommendation.'
            ], 403);
        }

        // Include relationships if requested
        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['recommendedUser'];
            $validIncludes = array_intersect($allowedIncludes, $includes);

            if (!empty($validIncludes)) {
                $recommendation->load($validIncludes);
            }
        }

        // Update last viewed timestamp
        $recommendation->save();

        return new UserRecommendationResource($recommendation);
    }

    /**
     * Update the specified recommendation.
     */
    public function update(Request $request, UserRecommendation $recommendation): JsonResource
    {
        // Ensure the user can only update their own recommendations
        if ($request->user()->user_id !== $recommendation->user_id) {
            return response()->json([
                'message' => 'You are not authorized to update this recommendation.'
            ], 403);
        }

        $validatedData = $request->validate([
            'status' => 'nullable|string|in:generated,viewed,dismissed,accepted',
            'metadata' => 'nullable|array',
        ]);

        // Update the recommendation
        if (isset($validatedData['status'])) {
            $recommendation->status = $validatedData['status'];
        }

        if (isset($validatedData['metadata'])) {
            $recommendation->metadata = $validatedData['metadata'];
        }

        $recommendation->save();

        // Include relationships if requested
        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['recommendedUser'];
            $validIncludes = array_intersect($allowedIncludes, $includes);

            if (!empty($validIncludes)) {
                $recommendation->load($validIncludes);
            }
        }

        return new UserRecommendationResource($recommendation);
    }

    /**
     * Remove the specified recommendation.
     */
    public function destroy(Request $request, UserRecommendation $recommendation): JsonResponse
    {
        // Ensure the user can only delete their own recommendations
        if ($request->user()->user_id !== $recommendation->user_id) {
            return response()->json([
                'message' => 'You are not authorized to delete this recommendation.'
            ], 403);
        }

        $recommendation->delete();

        return response()->json(null, 204);
    }

    /**
     * Generate recommendations based on user embeddings.
     */
    public function generateRecommendations(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = $request->input('limit', 10);

        // This would call the UserController's getSimilarUsers method or similar logic
        $similarUsers = app(UserController::class)->getSimilarUsers($user->user_id, $limit)->getContent();
        $similarUsersData = json_decode($similarUsers, true);

        if (!isset($similarUsersData['data']) || empty($similarUsersData['data'])) {
            return response()->json([
                'message' => 'No similar users found.',
                'data' => []
            ]);
        }

        // Create recommendations for each similar user
        $createdRecommendations = [];
        foreach ($similarUsersData['data'] as $similarUserData) {
            $similarUserId = $similarUserData['user']['user_id'];
            $similarityScore = $similarUserData['similarity'];

            // Skip if recommendation already exists
            $existingRecommendation = UserRecommendation::where([
                'user_id' => $user->user_id,
                'recommended_user_id' => $similarUserId
            ])->first();

            if ($existingRecommendation) {
                // Update existing recommendation
                $existingRecommendation->similarity_score = $similarityScore;
                $existingRecommendation->save();

                $createdRecommendations[] = new UserRecommendationResource($existingRecommendation);
            } else {
                // Create new recommendation
                $recommendation = new UserRecommendation();
                $recommendation->user_id = $user->user_id;
                $recommendation->recommended_user_id = $similarUserId;
                $recommendation->similarity_score = $similarityScore;
                $recommendation->status = 'pending';
                $recommendation->save();

                $createdRecommendations[] = new UserRecommendationResource($recommendation);
            }
        }

        return response()->json([
            'message' => 'Recommendations generated successfully.',
            'count' => count($createdRecommendations),
            'data' => $createdRecommendations
        ]);
    }
}

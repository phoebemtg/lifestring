<?php

namespace App\Http\Controllers;

use App\Models\Strings;
use App\Models\StringsComment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\StringsCommentResource;
use App\Http\Resources\StringsCommentCollection;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;

class StringsCommentController extends Controller
{
    /**
     * Get comments for a specific string.
     */
    public function index(Strings $string, Request $request): ResourceCollection
    {
        $query = $string->comments();

        // Only include top-level comments (not replies) unless specified
        if (!$request->has('include_replies') || !$request->boolean('include_replies')) {
            $query->whereNull('parent_comment_id');
        }

        // Include relationships
        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['user', 'replies', 'replies.user'];
            $validIncludes = array_intersect($allowedIncludes, $includes);

            if (!empty($validIncludes)) {
                $query->with($validIncludes);
            }
        }

        // Sorting
        $sortField = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_dir', 'desc');

        $allowedSortFields = ['created_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        }

        $perPage = $request->input('per_page', 15);
        $comments = $query->paginate($perPage);

        return StringsCommentResource::collection($comments);
    }

    /**
     * Add a new comment to a string.
     */
    public function store(Strings $string, Request $request): JsonResource
    {
        $this->authorize('comment', $string);

        $validatedData = $request->validate([
            'content' => 'required|string|max:2000',
            'parent_comment_id' => 'nullable|uuid|exists:string_comments,id'
        ]);

        // Check if parent comment exists and belongs to the same string
        if (!empty($validatedData['parent_comment_id'])) {
            $parentComment = StringsComment::find($validatedData['parent_comment_id']);

            if (!$parentComment || $parentComment->string_id !== $string->id) {
                return response()->json([
                    'message' => 'The parent comment does not exist or does not belong to this string.',
                    'errors' => [
                        'parent_comment_id' => ['Invalid parent comment.']
                    ]
                ], 422);
            }
        }

        // Set user_id and string_id
        $validatedData['user_id'] = $request->user()->user_id;
        $validatedData['string_id'] = $string->id;

        $comment = StringsComment::create($validatedData);

        // Load relationships
        $comment->load(['user']);

        return new StringsCommentResource($comment);
    }

    /**
     * Display the specified comment.
     */
    public function show(Strings $string, StringsComment $comment, Request $request): JsonResource
    {
        // Check if the comment belongs to the string
        if ($comment->string_id !== $string->id) {
            return response()->json([
                'message' => 'Comment not found on this string.'
            ], 404);
        }

        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['user', 'replies', 'replies.user', 'parentComment'];
            $validIncludes = array_intersect($allowedIncludes, $includes);

            if (!empty($validIncludes)) {
                $comment->load($validIncludes);
            }
        }

        return new StringsCommentResource($comment);
    }

    /**
     * Update a comment.
     */
    public function update(Request $request, Strings $string, StringsComment $comment): JsonResource
    {
        // Check if the comment belongs to the string
        if ($comment->string_id !== $string->id) {
            return response()->json([
                'message' => 'Comment not found on this string.'
            ], 404);
        }

        $this->authorize('update', $comment);

        $validatedData = $request->validate([
            'content' => 'required|string|max:2000'
        ]);

        $comment->update($validatedData);

        return new StringsCommentResource($comment);
    }

    /**
     * Delete a comment.
     */
    public function destroy(Strings $string, StringsComment $comment): JsonResponse
    {
        // Check if the comment belongs to the string
        if ($comment->string_id !== $string->id) {
            return response()->json([
                'message' => 'Comment not found on this string.'
            ], 404);
        }

        $this->authorize('delete', $comment);

        $comment->delete();

        return response()->json(null, 204);
    }

    /**
     * Get replies to a specific comment.
     */
    public function getReplies(Strings $string, StringsComment $comment, Request $request): ResourceCollection
    {
        // Check if the comment belongs to the string
        if ($comment->string_id !== $string->id) {
            return response()->json([
                'message' => 'Comment not found on this string.'
            ], 404);
        }

        $query = $comment->replies();

        // Include user information
        $query->with('user');

        // Sorting
        $sortField = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_dir', 'desc');

        $allowedSortFields = ['created_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        }

        $perPage = $request->input('per_page', 15);
        $replies = $query->paginate($perPage);

        return StringsCommentResource::collection($replies);
    }
}

<?php

use App\Http\Controllers\UserRecommendationController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\StringsController;
use App\Http\Controllers\StringsCommentController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\RoomParticipantController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\UserConnectionController;

// All API routes will automatically use the API middleware group
// which includes ForceJsonResponse middleware

// Protected routes
Route::group(['middleware' => ['supabase.auth']], function () {
    // This 'me' route is now correctly protected
    Route::get('/me', [UserController::class, 'me']);

    /**
     * User API endpoints with UserPolicy authorization
     */
    Route::apiResource('users', UserController::class);
    Route::post('/users/{user}/enneagrams', [UserController::class, 'assignEnneagrams']);
    Route::delete('/users/{user}/enneagrams', [UserController::class, 'removeEnneagrams']);
    Route::get('/users/{user}/enneagrams', [UserController::class, 'getUserEnneagrams']);
    Route::post('/users/{user}/embed/create', [UserController::class, 'apiCreateEmbed']);
    Route::post('/users/{user}/generateSimilarUsers', [UserController::class, 'generateUserRecommendations']);

    // User recommendations API
    Route::get('/recommendations', [UserRecommendationController::class, 'index']);
    Route::post('/recommendations', [UserRecommendationController::class, 'store']);
    Route::get('/recommendations/{recommendation}', [UserRecommendationController::class, 'show']);
    Route::put('/recommendations/{recommendation}', [UserRecommendationController::class, 'update']);
    Route::delete('/recommendations/{recommendation}', [UserRecommendationController::class, 'destroy']);
    Route::post('/recommendations/generate', [UserRecommendationController::class, 'generateRecommendations']);

    // User connection management
    Route::get('/connections', [UserConnectionController::class, 'index']);
    Route::post('/connections', [UserConnectionController::class, 'store']);
    Route::get('/connections/{user}', [UserConnectionController::class, 'show']);
    Route::put('/connections/{user}', [UserConnectionController::class, 'update']);
    Route::delete('/connections/{user}', [UserConnectionController::class, 'destroy']);

    // Get connections for the authenticated user
    Route::get('/my/connections', [UserConnectionController::class, 'myConnections']);

    // Get pending connection requests for the authenticated user
    Route::get('/my/pending-requests', [UserConnectionController::class, 'pendingRequests']);

    // Get strings for the authenticated user
    Route::get('/my/strings', [StringsController::class, 'myStrings']);

    // Get strings liked by the authenticated user
    Route::get('/my/liked-strings', [StringsController::class, 'myLikedStrings']);

    // Get events for the authenticated user
    Route::get('/my/events', [EventController::class, 'myEvents']);


    // Event API endpoints with EventPolicy authorization
    Route::apiResource('events', EventController::class);

    // String API endpoints with StringPolicy authorization
    Route::apiResource('strings', StringsController::class);

    // String likes
    Route::post('/strings/{string}/like', [StringsController::class, 'toggleLike']);

    // Get string recommendations for the authenticated user
    Route::get('/recommended/strings', [StringsController::class, 'getRecommendedStrings']);

    // String comments
    Route::apiResource('strings.comments', StringsCommentController::class);

    // Get replies to a comment
    Route::get('/strings/{string}/comments/{comment}/replies', [StringsCommentController::class, 'getReplies']);

    // Chat room API endpoints
    Route::apiResource('rooms', RoomController::class);

    // Get rooms for the authenticated user
    Route::get('/my/rooms', [RoomController::class, 'myRooms']);

    // Room participants management
    Route::get('/rooms/{room}/participants', [RoomParticipantController::class, 'index']);
    Route::post('/rooms/{room}/participants', [RoomParticipantController::class, 'store']);
    Route::delete('/rooms/{room}/participants/{user_id}', [RoomParticipantController::class, 'destroy']);

    // Room messages
    // Chat room API endpoints
    Route::apiResource('rooms', RoomController::class)->names([
        'show' => 'rooms.show'
    ]);

    // Room messages
    Route::get('rooms/{room}/messages', [MessageController::class, 'index'])->name('rooms.messages.index');
    Route::post('rooms/{room}/messages', [MessageController::class, 'store'])->name('rooms.messages.store');
    Route::get('rooms/{room}/messages/{message}', [MessageController::class, 'show'])->name('rooms.messages.show');
    Route::put('rooms/{room}/messages/{message}', [MessageController::class, 'update'])->name('rooms.messages.update');
    Route::delete('rooms/{room}/messages/{message}', [MessageController::class, 'destroy'])->name('rooms.messages.destroy');

});

// Any public routes would go here (outside the authentication middleware)
// But they will still use the API middleware group which forces JSON responses

// Define a fallback for undefined API routes to return a JSON 404 response
Route::fallback(function() {
    return response()->json(data: [
        'message' => 'Not Found. If you are looking for an API endpoint, please check the documentation.',
        'success' => false
    ], status: 404);
});

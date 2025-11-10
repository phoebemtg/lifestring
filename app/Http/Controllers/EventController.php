<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Resources\EventResource;
use App\Http\Resources\EventCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;

class EventController extends Controller
{
    /**
     * Display a listing of events.
     */
    public function index(Request $request): ResourceCollection
    {
        $this->authorize('viewAny', Event::class);

        $query = Event::query();

        // Filter by user_id if provided
        if ($request->has('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        // Filter by start_time range if provided
        if ($request->has('start_from')) {
            $query->where('start_time', '>=', $request->input('start_from'));
        }

        if ($request->has('start_to')) {
            $query->where('start_time', '<=', $request->input('start_to'));
        }

        // Handle includes (eager loading)
        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['user'];
            $validIncludes = array_intersect($allowedIncludes, $includes);
            if (!empty($validIncludes)) {
                $query->with($validIncludes);
            }
        }

        // Sorting
        $sortField = $request->input('sort_by', 'start_time');
        $sortDirection = $request->input('sort_dir', 'asc');

        // Only allow sorting by valid fields
        $allowedSortFields = ['start_time', 'created_at', 'title'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'desc' ? 'desc' : 'asc');
        }

        $perPage = $request->input('per_page', 15);
        $events = $query->paginate($perPage);

        return EventResource::collection($events);
    }

    /**
     * Store a newly created event.
     */
    public function store(Request $request): JsonResource
    {
        $this->authorize('create', Event::class);

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'location' => 'nullable|string|max:255',
            'meta_data' => 'nullable|array',
            'custom_fields' => 'nullable|array',
        ]);

        // Set user_id to the authenticated user
        $validatedData['user_id'] = $request->user()->user_id;

        $event = Event::create($validatedData);

        return new EventResource($event);
    }

    /**
     * Display the specified event.
     */
    public function show(Event $event, Request $request): JsonResource
    {
        $this->authorize('view', $event);

        if ($request->has('include')) {
            $includes = explode(',', $request->input('include'));
            $allowedIncludes = ['user'];
            $validIncludes = array_intersect($allowedIncludes, $includes);
            if (!empty($validIncludes)) {
                $event->load($validIncludes);
            }
        }

        return new EventResource($event);
    }

    /**
     * Update the specified event.
     */
    public function update(Request $request, Event $event): JsonResource
    {
        Log::info('User update authorized', [
            'updater_id' => auth()->id(),
            'target_event_id' => $event->id,
            'is_admin' => auth()->user()->isAdmin(),
        ]);
        $this->authorize('update', $event);

        $validatedData = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'sometimes|required|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'location' => 'nullable|string|max:255',
            'meta_data' => 'nullable|array',
            'custom_fields' => 'nullable|array',
        ]);

        $event->update($validatedData);

        return new EventResource($event);
    }

    /**
     * Remove the specified event.
     */
    public function destroy(Event $event): JsonResponse
    {
        $this->authorize('delete', $event);

        $event->delete();

        return response()->json(null, 204);
    }

    /**
     * Get events for the authenticated user.
     */
    public function myEvents(Request $request): ResourceCollection
    {
        $user = $request->user();

        $query = Event::where('user_id', $user->user_id);

        // Filter by start_time range if provided
        if ($request->has('start_from')) {
            $query->where('start_time', '>=', $request->input('start_from'));
        }

        if ($request->has('start_to')) {
            $query->where('start_time', '<=', $request->input('start_to'));
        }

        // Sorting
        $sortField = $request->input('sort_by', 'start_time');
        $sortDirection = $request->input('sort_dir', 'asc');

        // Only allow sorting by valid fields
        $allowedSortFields = ['start_time', 'created_at', 'title'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'desc' ? 'desc' : 'asc');
        }

        $perPage = $request->input('per_page', 15);
        $events = $query->paginate($perPage);

        return EventResource::collection($events);
    }
}

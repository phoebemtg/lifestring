<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Strings;
use App\Models\User;

class StringsPageController extends Controller
{
    /**
     * Display the strings page with AI chat integration.
     */
    public function index(Request $request)
    {
        // Get recent strings
        $strings = Strings::with(['user'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        // Get current user if authenticated
        $currentUser = $request->user();

        return view('strings.index', compact('strings', 'currentUser'));
    }

    /**
     * Show the form for creating a new string.
     */
    public function create()
    {
        return view('strings.create');
    }

    /**
     * Store a newly created string.
     */
    public function store(Request $request)
    {
        $request->validate([
            'content_text' => 'required|string|max:1000',
            'stringable_type' => 'nullable|string',
        ]);

        $string = Strings::create([
            'user_id' => $request->user()->user_id,
            'content_text' => $request->content_text,
            'stringable_type' => $request->stringable_type ?? 'general',
            'content_images' => $request->content_images ?? [],
        ]);

        return redirect()->route('strings.index')->with('success', 'String created successfully!');
    }
}

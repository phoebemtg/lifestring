<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceJsonResponse
{
    /**
     * Handle an incoming request.
     *
     * This middleware forces the application to return JSON responses
     * for all API routes, preventing HTML responses even in error cases.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Force Accept header to application/json
        $request->headers->set('Accept', 'application/json');

        // Get the response
        $response = $next($request);

        // Ensure the Content-Type header is application/json
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }
}

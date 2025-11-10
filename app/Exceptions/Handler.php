<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Illuminate\Http\Request;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        // Override the render method for API requests
        $this->renderable(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return $this->handleApiException($request, $e);
            }
        });
    }

    /**
     * Handle API exceptions and return JSON responses.
     *
     * @param Request $request
     * @param Throwable $exception
     * @return JsonResponse
     */
    private function handleApiException($request, Throwable $exception): JsonResponse
    {
        // Define the default error code and message
        $status = 500;
        $response = [
            'message' => 'Server Error',
            'success' => false
        ];

        // Handle different types of exceptions
        if ($exception instanceof AuthenticationException) {
            $status = 401;
            $response['message'] = 'Unauthenticated';
        } elseif ($exception instanceof ValidationException) {
            $status = 422;
            $response['message'] = 'Validation Error';
            $response['errors'] = $exception->errors();
        } elseif ($exception instanceof ModelNotFoundException) {
            $status = 404;
            $response['message'] = 'Resource not found';
        } elseif ($exception instanceof NotFoundHttpException) {
            $status = 404;
            $response['message'] = 'The requested URL was not found';
        } elseif ($exception instanceof MethodNotAllowedHttpException) {
            $status = 405;
            $response['message'] = 'Method not allowed';
        } else {
            // For all other exceptions
            $status = method_exists($exception, 'getStatusCode')
                ? $exception->getStatusCode()
                : 500;
            $response['message'] = $exception->getMessage() ?: 'Server Error';

            // Only include detailed exception info in non-production environments
            if (config('app.debug')) {
                $response['debug'] = [
                    'exception' => get_class($exception),
                    'trace' => $exception->getTrace()
                ];
            }
        }

        return new JsonResponse($response, $status);
    }
}

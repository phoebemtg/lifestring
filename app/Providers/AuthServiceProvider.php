<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\User;
use App\Policies\UserPolicy;
use App\Models\Event;
use App\Policies\EventPolicy;
use App\Models\Strings;
use App\Policies\StringsPolicy;
use App\Models\StringsComment;
use App\Policies\StringsCommentPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        User::class => UserPolicy::class,
        Event::class => EventPolicy::class,
        Strings::class => StringsPolicy::class,
        StringsComment::class => StringsCommentPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Define gates for specific admin abilities
        Gate::define('manage-users', function (User $user) {
            return $user->isAdmin();
        });
    }
}

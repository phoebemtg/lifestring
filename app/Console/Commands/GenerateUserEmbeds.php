<?php

namespace App\Console\Commands;

use App\Http\Controllers\UserController;
use App\Models\User;
use App\Models\UserEmbeds;
use Illuminate\Console\Command;

class GenerateUserEmbeds extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'embeds:generate {--force : Force the generation of the embeds}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate embeddings for all users who don\'t have them';


    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $force = $this->option('force');
        $userController = app(UserController::class); // Good use of the service container

        // Initialize counters
        $processedCount = 0;
        $skippedCount = 0;
        $errorCount = 0;
        $totalUsers = User::count();

        if ($totalUsers === 0) {
            $this->info("No users found to process.");
            return Command::SUCCESS;
        }

        $this->info("Starting embedding generation for {$totalUsers} users...");

        // ========================================================================
        //  PERFORMANCE OPTIMIZATION: PRE-FETCH EXISTING EMBEDDINGS
        // ========================================================================
        // This single query gets all user_ids that already have an embedding,
        // solving the N+1 problem. We use flip() for instant key lookups.
        $existingEmbeddingUserIds = [];
        if (!$force) {
            $this->line("Fetching existing embeddings to avoid reprocessing...");
            $existingEmbeddingUserIds = UserEmbeds::pluck('user_id')->flip()->all();
        }

        // Setup the progress bar
        $bar = $this->output->createProgressBar($totalUsers);
        $bar->start();

        // ========================================================================
        //  MEMORY OPTIMIZATION: PROCESS USERS IN BATCHES
        // ========================================================================
        // Use chunkById to process users in manageable batches (e.g., 200 at a time).
        // This prevents memory exhaustion on applications with many users.
        User::chunkById(200, function ($users) use ($userController, $force, &$existingEmbeddingUserIds, &$processedCount, &$skippedCount, &$errorCount, $bar) {

            foreach ($users as $user) {
                $bar->advance();

                // Fast in-memory check to see if we should skip this user.
                if (!$force && isset($existingEmbeddingUserIds[$user->user_id])) {
                    $skippedCount++;
                    continue;
                }

                try {
                    $result = $userController->createEmbed($user);

                    if ($result['status'] === 'created' || $result['status'] === 'updated') {
                        $processedCount++;
                        // A small delay to avoid rate limiting with the OpenAI API
                        usleep(200000); // 200ms delay
                    } else {
                        // Log the specific error message returned from the controller
                        $this->error("\nFailed to process user {$user->user_id}: {$result['message']}");
                        $errorCount++;
                    }
                } catch (\Exception $e) {
                    // Catch any unexpected exceptions
                    $this->error("\nCritical error on user {$user->user_id}: " . $e->getMessage());
                    $errorCount++;
                }
            }
        });

        $bar->finish();
        $this->newLine(2);
        $this->info("Embedding generation completed:");
        $this->info("- Processed/Updated: {$processedCount}");
        $this->info("- Skipped (already existed): {$skippedCount}");
        $this->info("- Errors: {$errorCount}");

        return Command::SUCCESS;
    }
}

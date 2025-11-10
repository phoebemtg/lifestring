<?php

namespace App\Console\Commands;

use App\Http\Controllers\UserController;
use App\Models\User;
use Illuminate\Console\Command;

class GenerateUserRecommendations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:generate-recommendations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Iterates through all users and generates their top 10 recommendations based on embedding similarity.';

    /**
     * Execute the console command.
     */
    public function handle(UserController $userController): int
    {
        $this->info("Starting recommendation generation process...");

        $totalUsers = User::count();
        if ($totalUsers === 0) {
            $this->comment("No users found to process.");
            return Command::SUCCESS;
        }

        $bar = $this->output->createProgressBar($totalUsers);
        $bar->start();

        $processedCount = 0;
        $errorCount = 0;

        // Use chunkById for memory efficiency. This processes users in batches (e.g., 100 at a time)
        // instead of loading all of them into memory at once with User::all().
        User::query()->chunkById(100, function ($users) use ($userController, $bar, &$processedCount, &$errorCount) {
            foreach ($users as $user) {
                try {
                    // Call the method from the UserController
                    $response = $userController->generateAndStoreRecommendations($user->user_id);

                    if ($response->isSuccessful()) {
                        $processedCount++;
                    } else {
                        // Log the error for the specific user and continue
                        $errorData = $response->getData(true);
                        $this->error("\nFailed to process user {$user->user_id}: " . ($errorData['error'] ?? 'Unknown error'));
                        $errorCount++;
                    }

                    // A small delay to be considerate to the database and any external APIs.
                    usleep(100000); // 100ms delay

                } catch (\Exception $e) {
                    $this->error("\nCritical exception for user {$user->user_id}: " . $e->getMessage());
                    $errorCount++;
                }

                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine(2);

        $this->info("Recommendation generation complete.");
        $this->info("- Users processed successfully: {$processedCount}");
        $this->info("- Users with errors: {$errorCount}");

        return Command::SUCCESS;
    }
}

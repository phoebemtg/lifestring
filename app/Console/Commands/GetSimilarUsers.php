<?php

namespace App\Console\Commands;

use App\Http\Controllers\UserController;
use App\Models\User;
use App\Models\UserEmbeds;
use http\Client\Request;
use Illuminate\Console\Command;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class GetSimilarUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:find-similar
                            {user_id? : The ID of the user to find similar users for}
                            {--limit=10 : Maximum number of similar users to return}
                            {--score : Show similarity scores}
                            {--detailed : Show detailed user information}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    public function handle(): int
    {
        $userId = $this->argument('user_id');
        $limit = (int) $this->option('limit');

        // 1. Validate that the user exists in our database.
        $user = User::where('user_id', $userId)->first();
        if (!$user) {
            $this->error("User with ID '{$userId}' not found in the user_profiles table.");
            return Command::FAILURE;
        }

        $this->info("Finding the top {$limit} most similar users for User ID: {$userId}");
        $this->comment("Calling UserController->getSimilarUsers to perform calculation...");
        $this->newLine();

        // 2. Resolve the controller from the service container and call the method.
        $userController = app(UserController::class);
        $response = $userController->getSimilarUsers($userId, $limit);

        // 3. Decode the JSON response. The 'true' argument converts it to an associative array.
        $responseData = $response->getData(true);

        // 4. Check if the API call was successful.
        if (!$response->isSuccessful()) {
            $this->error("API Error: " . ($responseData['error'] ?? 'An unknown error occurred.'));
            return Command::FAILURE;
        }

        $similarUsersData = $responseData['data'] ?? [];

        if (empty($similarUsersData)) {
            $this->info("No similar users found.");
            return Command::SUCCESS;
        }

        // 5. Display results in a formatted table.
        $this->displayResults($similarUsersData);

        return Command::SUCCESS;
    }

    /**
     * Formats and displays the similarity results in a table.
     * @param array $similarUsersData The 'data' array from the API response.
     */
    private function displayResults(array $similarUsersData): void
    {
        $showScores = $this->option('score');
        $detailed = $this->option('detailed');

        // Prepare table headers
        $headers = ['#', 'User ID'];
        if ($showScores) {
            $headers[] = 'Similarity';
        }
        if ($detailed) {
            $headers[] = 'Profile Data';
        }

        // Prepare table rows by mapping over the data array
        $rows = array_map(function ($item, $index) use ($showScores, $detailed) {
            // The 'user' key now holds an associative array from the UserResource
            $similarUser = $item['user'];

            $row = [
                $index + 1,
                $similarUser['user_id'], // Accessing data as an array key
            ];

            if ($showScores) {
                $row[] = number_format($item['similarity'] * 100, 2) . '%';
            }

            if ($detailed) {
                // Display the JSONB columns for a detailed view.
                $profileData = [
                    'contact' => $similarUser['contact_info'],
                    'social' => $similarUser['social_links'],
                    'attributes' => $similarUser['attributes'],
                ];
                $row[] = json_encode($profileData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            }

            return $row;
        }, $similarUsersData, array_keys($similarUsersData));

        $this->info("Found " . count($similarUsersData) . " similar users:");
        $this->table($headers, $rows);
    }


}

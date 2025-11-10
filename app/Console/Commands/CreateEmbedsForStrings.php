<?php

namespace App\Console\Commands;

use App\Http\Controllers\StringsController;
use App\Models\Strings;
use App\Models\StringEmbeds;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CreateEmbedsForStrings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-embeds-for-strings
                            {--batch=100 : Number of strings to process in each batch}
                            {--force : Force regeneration of embeddings even if they already exist}
                            {--recent= : Only process strings created after specified number of days ago}
                            {--user= : Only process strings from specific user_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create embeddings for all strings in the database';

    /**
     * The StringsController instance.
     *
     * @var StringsController
     */
    protected $stringsController;

    /**
     * Create a new command instance.
     *
     * @param StringsController $stringsController
     * @return void
     */
    public function __construct(StringsController $stringsController)
    {
        parent::__construct();
        $this->stringsController = $stringsController;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $batchSize = (int) $this->option('batch');
        $forceRegeneration = $this->option('force');
        $recentDays = $this->option('recent');
        $userId = $this->option('user');

        $this->info('Starting string embeddings generation...');

        // Build the query to select strings
        $query = Strings::query();

        // Apply filters if specified
        if ($recentDays) {
            $date = now()->subDays((int) $recentDays);
            $query->where('created_at', '>=', $date);
            $this->info("Processing only strings created in the last {$recentDays} days");
        }

        if ($userId) {
            $query->where('user_id', $userId);
            $this->info("Processing only strings from user_id: {$userId}");
        }

        // If not forcing regeneration, exclude strings that already have embeddings
        if (!$forceRegeneration) {
            $existingEmbeddingIds = StringEmbeds::pluck('string_id')->toArray();
            if (!empty($existingEmbeddingIds)) {
                $query->whereNotIn('id', $existingEmbeddingIds);
            }
            $this->info("Processing only strings without existing embeddings");
        } else {
            $this->info("Force option enabled: regenerating embeddings for all strings");
        }

        // Get total count for progress bar
        $totalStrings = $query->count();

        if ($totalStrings === 0) {
            $this->info("No strings found to process.");
            return 0;
        }

        $this->info("Found {$totalStrings} strings to process");

        // Create progress bar
        $bar = $this->output->createProgressBar($totalStrings);
        $bar->start();

        // Variables to track progress
        $processed = 0;
        $successful = 0;
        $errors = 0;

        // Process in batches to avoid memory issues
        $query->orderBy('created_at', 'desc')
            ->chunk($batchSize, function ($strings) use (&$processed, &$successful, &$errors, $bar, $totalStrings) {
                foreach ($strings as $string) {
                    try {
                        $result = $this->stringsController->createEmbed($string);

                        if (isset($result['status']) && $result['status'] === 'error') {
                            $this->logError($string->id, $result['message'] ?? 'Unknown error');
                            $errors++;
                        } else {
                            $successful++;
                        }
                    } catch (\Exception $e) {
                        $this->logError($string->id, $e->getMessage());
                        $errors++;
                    }

                    $processed++;
                    $bar->advance();

                    // Optional: add a small delay to avoid API rate limits
                    usleep(100000); // 0.1 second
                }
            });

        $bar->finish();
        $this->newLine(2);

        // Summary
        $this->info("Embedding generation complete!");
        $this->info("Processed: {$processed} strings");
        $this->info("Successful: {$successful} strings");
        $this->info("Errors: {$errors} strings");

        if ($errors > 0) {
            $this->warn("Some strings could not be processed. Check the logs for details.");
            return 1;
        }

        return 0;
    }

    /**
     * Log an error with a string ID
     *
     * @param string $stringId
     * @param string $errorMessage
     * @return void
     */
    private function logError($stringId, $errorMessage)
    {
        $message = "Error generating embedding for string {$stringId}: {$errorMessage}";
        $this->error($message);
        Log::error($message);
    }
}

<?php

namespace App\Console\Commands;

use App\Models\Portfolio;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ConvertPortfolioImages extends Command
{
    protected $signature = 'portfolios:convert-images {--quality=82 : WebP quality from 0 to 100}';

    protected $description = 'Convert existing portfolio images to WebP';

    public function handle(): int
    {
        $quality = max(0, min(100, (int) $this->option('quality')));
        $disk = Storage::disk('public');
        $converted = 0;

        Portfolio::query()->whereNotNull('image')->each(function (Portfolio $portfolio) use ($disk, $quality, &$converted): void {
            if (Str::endsWith(strtolower($portfolio->image), '.webp')) {
                return;
            }

            $sourcePath = $disk->path($portfolio->image);
            if (! is_file($sourcePath)) {
                $this->warn("Missing: {$portfolio->image}");

                return;
            }

            $source = @imagecreatefromstring((string) file_get_contents($sourcePath));
            if ($source === false) {
                $this->warn("Unreadable: {$portfolio->image}");

                return;
            }

            $path = 'portfolios/'.Str::uuid().'.webp';
            $targetPath = $disk->path($path);
            $written = @imagewebp($source, $targetPath, $quality);
            imagedestroy($source);

            if (! $written) {
                $this->warn("Failed: {$portfolio->image}");

                return;
            }

            $oldPath = $portfolio->image;
            $portfolio->update(['image' => $path]);
            $disk->delete($oldPath);
            $converted++;
        });

        $this->info("Converted {$converted} portfolio image(s) to WebP.");

        return self::SUCCESS;
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\Portfolio;
use App\Models\WebService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

class SitemapController extends Controller
{
    public function index(Request $request)
    {
        $baseUrl = Config::get('app.url');

        $sitemap = Sitemap::create()
            ->add($this->getStaticUrls($baseUrl))
            ->add($this->getDynamicUrls($baseUrl));

        return response($sitemap->render())
            ->header('Content-Type', 'application/xml');
    }

    protected function getStaticUrls(string $baseUrl): array
    {
        return [
            Url::create($baseUrl . '/')
                ->setLastModificationDate(now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
                ->setPriority(1.0),

            Url::create($baseUrl . '/jasa-web')
                ->setLastModificationDate(now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                ->setPriority(0.8),

            Url::create($baseUrl . '/contact')
                ->setLastModificationDate(now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                ->setPriority(0.6),

            Url::create($baseUrl . '/domain')
                ->setLastModificationDate(now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
                ->setPriority(0.9),

            Url::create($baseUrl . '/portofolio')
                ->setLastModificationDate(now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                ->setPriority(0.7),
        ];
    }

    protected function getDynamicUrls(string $baseUrl): array
    {
        $urls = [];

        // Web Services
        $webServices = WebService::query()
            ->where('is_active', true)
            ->select('slug', 'updated_at')
            ->get();

        foreach ($webServices as $service) {
            $urls[] = Url::create($baseUrl . '/jasa-web/' . $service->slug)
                ->setLastModificationDate($service->updated_at)
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                ->setPriority(0.7);
        }

        // Portfolios
        $portfolios = Portfolio::query()
            ->select('slug', 'updated_at')
            ->get();

        foreach ($portfolios as $portfolio) {
            $urls[] = Url::create($baseUrl . '/portofolio/' . $portfolio->slug)
                ->setLastModificationDate($portfolio->updated_at)
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                ->setPriority(0.6);
        }

        // Available Domains (chunked to avoid memory issues)
        Domain::query()
            ->where('is_available', true)
            ->select('id', 'extension', 'updated_at')
            ->chunkById(100, function ($domains) use ($baseUrl, &$urls) {
                foreach ($domains as $domain) {
                    $urls[] = Url::create($baseUrl . '/domain?extension=' . $domain->extension)
                        ->setLastModificationDate($domain->updated_at)
                        ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
                        ->setPriority(0.5);
                }
            });

        return $urls;
    }
}
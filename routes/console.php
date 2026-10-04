<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('sitemap:generate', function () {
    $this->info('Generating sitemap...');

    $controller = app(\App\Http\Controllers\SitemapController::class);
    $request = new \Illuminate\Http\Request();
    $response = $controller->index($request);

    $content = $response->getContent();
    file_put_contents(public_path('sitemap.xml'), $content);

    $this->info('Sitemap generated at: ' . public_path('sitemap.xml'));
})->purpose('Generate static sitemap.xml file');

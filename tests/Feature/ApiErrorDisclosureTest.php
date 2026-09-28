<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiErrorDisclosureTest extends TestCase
{
    public function test_api_404_does_not_disclose_exception_details(): void
    {
        $response = $this->getJson('/api/not-found');

        $response->assertNotFound()
            ->assertExactJson(['message' => 'Not Found.']);

        $this->assertStringNotContainsString('trace', $response->getContent());
        $this->assertStringNotContainsString('file', $response->getContent());
        $this->assertStringNotContainsString('exception', $response->getContent());
    }
}

// ponytail: covers the public API error boundary; add endpoint-specific tests only when an API contract requires them.

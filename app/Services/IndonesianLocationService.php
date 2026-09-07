<?php

namespace App\Services;

use Laravolt\Indonesia\Models\Province;

class IndonesianLocationService
{
    public function all(): array
    {
        return Province::query()
            ->with(['cities:id,province_code,name'])
            ->orderBy('name')
            ->get(['code', 'name'])
            ->toArray();
    }
}

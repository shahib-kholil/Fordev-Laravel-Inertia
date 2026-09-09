<?php

namespace App\Http\Requests;

use App\Models\Setting;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $enabledPaymentMethods = json_decode(
            Setting::query()->where('key', 'payment_methods')->value('value')
                ?? '["qris","dana","bank_transfer"]',
            true,
        );

        $enabledPaymentMethods = is_array($enabledPaymentMethods)
            ? array_values(array_intersect(
                $enabledPaymentMethods,
                ['qris', 'dana', 'bank_transfer'],
            ))
            : [];

        return [
            'client_phone' => ['required', 'string', 'regex:/^[0-9+()\s-]{8,30}$/'],
            'order_type' => ['nullable', Rule::in(['domain'])],
            'domain_id' => ['nullable', 'exists:domains,id'],
            'bundle_id' => ['nullable', 'integer', 'min:0'],
            'domain_name' => ['required', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'zipcode' => ['required', 'string', 'max:20'],
            'country_code' => ['required', 'string', 'size:2'],
            'notes' => ['nullable', 'string'],
            'payment_method' => [
                'required',
                Rule::in($enabledPaymentMethods),
            ],
        ];
    }
}

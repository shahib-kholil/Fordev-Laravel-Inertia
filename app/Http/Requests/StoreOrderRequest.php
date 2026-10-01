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

    protected function prepareForValidation(): void
    {
        $fields = ['client_phone', 'domain_name', 'company', 'address_line_1', 'city', 'state', 'zipcode', 'country_code', 'notes', 'order_number'];
        $clean = [];
        foreach ($fields as $field) {
            $value = $this->input($field);
            $clean[$field] = is_string($value) ? trim(strip_tags($value)) : $value;
        }
        if (is_string($clean['client_phone'] ?? null)) {
            $clean['client_phone'] = preg_replace('/\D+/', '', $clean['client_phone']);
        }
        $clean['domain_name'] = strtolower($clean['domain_name'] ?? '');
        $clean['country_code'] = strtoupper($clean['country_code'] ?? '');
        $clean['coupon_code'] = strtoupper(trim((string) $this->input('coupon_code', '')));
        $this->merge($clean);
    }

    public function rules(): array
    {
        $enabledPaymentMethods = json_decode(
            Setting::query()->where('key', 'payment_methods')->value('value')
                ?? '["borderpay","manual"]',
            true,
        );

        $enabledPaymentMethods = is_array($enabledPaymentMethods)
            ? array_values(array_intersect(
                $enabledPaymentMethods,
                ['borderpay', 'qris', 'dana', 'bank_transfer', 'manual'],
            ))
            : [];

        return [
            'client_phone' => ['required', 'string', 'regex:/^(?:62\d{11}|0\d{11})$/'],
            'order_type' => ['nullable', Rule::in(['domain'])],
            'domain_id' => ['nullable', 'exists:domains,id'],
            'bundle_id' => ['nullable', 'string', 'max:80'],
            'domain_name' => ['required', 'string', 'max:63', 'regex:/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/'],
            'company' => ['nullable', 'string', 'min:2', 'max:255'],
            'address_line_1' => ['required', 'string', 'max:62'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'zipcode' => ['required', 'string', 'regex:/^\d{5}$/'],
            'country_code' => ['required', 'string', 'size:2'],
            'notes' => ['nullable', 'string'],
            'payment_method' => ['nullable', Rule::in($enabledPaymentMethods)],
            'order_number' => ['nullable', 'regex:/^FRD-[0-9]{8}-[A-Z0-9]{4}$/'],
            'coupon_code' => ['nullable', 'string', 'max:40', 'regex:/^[A-Z0-9_-]+$/'],
        ];
    }
}

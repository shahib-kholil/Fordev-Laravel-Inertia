<?php

namespace App\Http\Requests;

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
        return [
            'client_phone' => ['required', 'string', 'regex:/^[0-9+()\s-]{8,30}$/'],
            'order_type' => ['nullable', Rule::in(['domain'])],
            'domain_id' => ['required', 'exists:domains,id'],
            'domain_name' => ['required', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'zipcode' => ['required', 'string', 'max:20'],
            'country_code' => ['required', 'string', 'size:2'],
            'notes' => ['nullable', 'string'],
            'payment_method' => ['nullable', Rule::in(['qris', 'dana', 'bank_transfer'])],
        ];
    }
}

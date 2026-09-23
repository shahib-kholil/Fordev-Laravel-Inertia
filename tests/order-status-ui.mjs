// Run: node tests/order-status-ui.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../resources/js/pages/public/order-status.jsx', import.meta.url), 'utf8');
const expression = source.match(/function OrderProgress[\s\S]*?const active =([\s\S]*?);/)[1];
const progress = new Function('status', `return (${expression});`);
assert.equal(progress('pending_confirmation'), 1);
assert.equal(progress('paid'), 2, 'Paid must not mean active');
assert.equal(progress('active'), 3);
assert.equal(progress('api_error'), 0, 'Unknown progress must not imply verified payment');
assert.match(source, /aria-expanded=\{method === value\}/);
assert.match(source, /errors\.payment/);
assert.match(source, /if \(!response\.ok\)/);
assert.match(source, /method="post"[\s\S]*name="payment_method" value="borderpay"/);
assert.equal((source.match(/Total pembayaran/g) ?? []).length, 1);
console.log('Order status UI: 9 assertions passed');

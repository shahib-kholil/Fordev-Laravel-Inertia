#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT="/var/www/stagging-fordev"
STAGING_URL="https://stagging.fordev11.tech"
PHP_FPM_SERVICE="php8.4-fpm"

cd "$PROJECT"

maintenance_enabled=0
cleanup() {
    if [ "$maintenance_enabled" -eq 1 ]; then
        php artisan up || true
    fi
}
trap cleanup EXIT

php artisan down --retry=60 || true
maintenance_enabled=1

git fetch origin staging
git checkout staging
git reset --hard origin/staging

composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader
npm ci
npm run build

php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

sudo chown -R "$USER":www-data storage bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache
php artisan queue:restart || true
sudo systemctl reload "$PHP_FPM_SERVICE"

php artisan up
maintenance_enabled=0
curl --fail --silent --show-error --max-time 15 "$STAGING_URL/up"
echo "=== STAGING DEPLOYMENT SUCCESSFUL ==="

#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "$0")/.."

env_file="${ENV_FILE:-.env.prod}"

if [[ ! -f "$env_file" ]]; then
    echo "Missing $env_file. Copy .env.prod.example and fill in its values first." >&2
    exit 1
fi

set -a
# shellcheck disable=SC1090
source "$env_file"
set +a

: "${DOMAIN:?Set DOMAIN in $env_file}"
: "${CERTBOT_EMAIL:?Set CERTBOT_EMAIL in $env_file}"

if [[ "$DOMAIN" == "app.example.com" || "$CERTBOT_EMAIL" == "admin@example.com" ]]; then
    echo "Replace the example domain and email in $env_file before deployment." >&2
    exit 1
fi

compose() {
    docker compose --env-file "$env_file" -f docker-compose.prod.yml "$@"
}

mkdir -p deploy/certbot/conf deploy/certbot/www

if [[ -f "deploy/certbot/conf/live/$DOMAIN/fullchain.pem" ]]; then
    echo "An existing certificate was found. Starting the production stack."
    compose up -d --build
    exit 0
fi

echo "Building the application and starting its internal services..."
compose up -d --build db backend frontend

echo "Creating a temporary certificate so Nginx can start..."
compose run --rm --entrypoint mkdir certbot \
    -p "/etc/letsencrypt/live/$DOMAIN"
compose run --rm --entrypoint openssl certbot req \
    -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout "/etc/letsencrypt/live/$DOMAIN/privkey.pem" \
    -out "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" \
    -subj "/CN=localhost"

compose up -d nginx

staging_args=()
if [[ "${CERTBOT_STAGING:-0}" != "0" ]]; then
    staging_args+=(--staging)
fi

echo "Requesting a Let's Encrypt certificate for $DOMAIN..."
compose run --rm --entrypoint rm certbot \
    -rf "/etc/letsencrypt/live/$DOMAIN"

if ! compose run --rm --entrypoint certbot certbot certonly \
    --webroot --webroot-path /var/www/certbot \
    --email "$CERTBOT_EMAIL" --agree-tos --no-eff-email \
    "${staging_args[@]}" \
    -d "$DOMAIN"; then
    echo "Certificate issuance failed. Stop the stack, correct DNS/firewall settings, and rerun this script." >&2
    exit 1
fi

compose exec nginx nginx -s reload
compose up -d certbot

echo "HTTPS is ready at https://$DOMAIN"

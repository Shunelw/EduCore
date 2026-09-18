#!/bin/sh

# This script is run by the official Nginx entrypoint after it renders the
# configuration templates. Periodic reloads make renewed certificates active
# without interrupting requests.
(
    while :; do
        sleep 6h
        nginx -s reload
    done
) &

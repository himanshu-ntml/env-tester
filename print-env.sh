#!/bin/bash

echo "🔍 Printing Coolify Environment Variables:"
echo "------------------------------------------"

# Print all env vars (sorted)
env | sort

# Optional: print specific ones
echo ""
echo "👀 Specific variables:"
echo "FOO = $FOO"
echo "DB_NAME = $DB_NAME"

echo "✅ Done!"

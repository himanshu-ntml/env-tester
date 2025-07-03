#!/bin/bash

echo "🔁 Starting infinite environment console logger (1s delay)..."

while true; do
  echo "🕒 $(date)"
  echo "Environment variables:"
  env | sort
  echo "------------------------------"
  sleep 1
done

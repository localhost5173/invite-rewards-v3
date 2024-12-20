#!/bin/bash

# Remove the dist directory
rm -rf ./dist

# Create the languages directory in the dist folder
mkdir -p ./dist/src/languages

# Copy JSON files to the dist folder
cp ./src/languages/* ./dist/src/languages

# Run tsc-watch and cpx in parallel using concurrently
npx concurrently -k "tsc-watch --onSuccess 'node dist/src/index.js'" "cpx 'src/**/*.json' dist --watch"
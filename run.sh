mkdir ./dist/src/languages
cp ./src/languages/* ./dist/src/languages
npx tsc-watch --onSuccess "node dist/src/index.js"
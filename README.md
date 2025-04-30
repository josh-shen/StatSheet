# StatSheet
An NBA player and betting stats compiler and visualizer

## Build
```
npm install --save-dev @electron-forge/cli
npx electron-forge import
```

```
npm run make
```
## API
This app utilizes [odds-api](https://the-odds-api.com/) to get sports betting data. Create an API key and place it in 
the `API_KEYS` array in `config.js`. The free tier of the API has a request limit per month. Multiple API keys can be 
placed in `API_KEYS`, the app will use all keys inside the array.
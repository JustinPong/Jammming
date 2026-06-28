# Jammming

A React app for building Spotify playlists — search the Spotify library, assemble a custom playlist, name it, and save it straight to your Spotify account.

**🔗 Live demo:** https://justinpong.github.io/Jammming

<img width="1326" alt="Jammming screenshot" src="https://github.com/user-attachments/assets/861d879e-6584-4c5f-9bcb-0f0c7646e67d" />

## Features

- Search Spotify for tracks by name
- Add and remove tracks from a custom playlist
- Rename the playlist before saving
- Save the playlist straight to your Spotify account in one click
- Logs in with your own Spotify account (OAuth)

## Tech stack

- **React 17** (Create React App, `react-scripts` 5)
- **Spotify Web API** — search + playlist endpoints
- **Spotify OAuth** — in-browser user authorization
- **GitHub Pages** — hosting

## How the Spotify API is called

Spotify's Web API supports CORS and authorizes each user with their own account, so the browser calls it directly — no backend or secret required:

- The user logs in through Spotify and the app receives a short-lived **access token** in the browser.
- Every request (`/v1/search`, `/v1/me`, `/v1/users/{id}/playlists`) sends that token in the `Authorization` header.
- The Spotify **client ID** is public by design — it identifies the app, it is not a secret.

## Local development

Requires a free Spotify app: https://developer.spotify.com/dashboard

1. Create a Spotify app in the dashboard and copy its **Client ID**.
2. In the app settings, add the **Redirect URIs** used by `src/util/Spotify.js`:
   - dev: `http://127.0.0.1:3000/`
   - production: `https://justinpong.github.io/Jammming/`
3. Put your Client ID in `src/util/Spotify.js` (the `clientId` constant).
4. Install dependencies and start:
   ```bash
   npm install
   npm start
   ```
   Open http://127.0.0.1:3000 (use `127.0.0.1`, not `localhost`, so it matches the redirect URI).

## Deployment

Frontend → GitHub Pages:

```bash
npm run deploy
```

Builds and publishes `build/` to the `gh-pages` branch. Make sure the production redirect URI (`https://justinpong.github.io/Jammming/`) is registered in your Spotify app.

## Project structure

```
src/
  Components/
    App/            app shell + state (search results, playlist)
    SearchBar/      search input
    SearchResults/  list of found tracks
    TrackList/      reusable track list
    Track/          single track (add / remove)
    Playlist/       playlist name, tracks, save button
  util/Spotify.js   Spotify auth + API calls
```

let accessToken = "";
const clientId = "351c6be9234b4dbe8dfe8fbfe60efce7";
const redirectUri =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/"
    : "https://justinpong.github.io/Jammming/";

function generateRandomString(length) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values).map((x) => possible[x % possible.length]).join("");
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const Spotify = {
  async getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    // PKCE callback: exchange code for token
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      const verifier = sessionStorage.getItem("pkce_verifier");
      sessionStorage.removeItem("pkce_verifier");

      const body = new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      });

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      const json = await response.json();
      accessToken = json.access_token;
      window.setTimeout(() => (accessToken = ""), json.expires_in * 1000);
      window.history.replaceState({}, "", redirectUri);
      return accessToken;
    }

    // Initiate PKCE flow
    const verifier = generateRandomString(64);
    const challenge = await generateCodeChallenge(verifier);
    sessionStorage.setItem("pkce_verifier", verifier);

    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", "playlist-modify-public");
    authUrl.searchParams.set("code_challenge_method", "S256");
    authUrl.searchParams.set("code_challenge", challenge);
    window.location = authUrl.toString();
  },

  async search(term) {
    const accessToken = await Spotify.getAccessToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((jsonResponse) => {
        if (!jsonResponse.tracks) {
          return [];
        }
        return jsonResponse.tracks.items.map((track) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          image: track.album.images[0]?.url,
          uri: track.uri,
        }));
      });
  },

  async savePlaylist(name, trackUris) {
    if (!name && !trackUris) {
      return;
    } else {
      const accessToken = await Spotify.getAccessToken();
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      let userId;

      return fetch("https://api.spotify.com/v1/me", { headers: headers })
        .then((response) => response.json())
        .then((jsonResponse) => {
          userId = jsonResponse.id;
          return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            headers: headers,
            method: "POST",
            body: JSON.stringify({ name: name }),
          })
            .then((response) => response.json())
            .then((jsonResponse) => {
              const playlistId = jsonResponse.id;

              return fetch(
                `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
                {
                  headers: headers,
                  method: "POST",
                  body: JSON.stringify({ uris: trackUris }),
                }
              );
            });
        });
    }
  },
};

export default Spotify;

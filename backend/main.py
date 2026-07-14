from flask import Flask, redirect, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import re
import spotipy
import anthropic
import json
from datetime import datetime, timezone
from spotipy.oauth2 import SpotifyOAuth
import uuid
token_store = {}
playlist_store = {}

load_dotenv()

app = Flask(__name__)
CORS(app)

claude_client = anthropic.Client(api_key=os.getenv("ANTHROPIC_API_KEY"))
tools = [
    {
        "name": "search_spotify_track",
        "description": "Search Spotify for a specific song by track name and artist to verify it exists and get its real Spotify data",
        "input_schema": {
            "type": "object",
            "properties": {
                "track_name": {"type": "string", "description": "The name of the song"},
                "artist_name": {"type": "string", "description": "The name of the artist"}
            },
            "required": ["track_name", "artist_name"]
        }
    }
]

SYSTEM_PROMPT = """You are DJWizard, a music expert AI that builds personalized playlists.
When a user describes a vibe or mood, use your own deep knowledge of music to think of 
8-10 real songs that genuinely fit their request. Consider genre, era, mood, and energy carefully.
With each playlist, include a mix of well-known hits and hidden gems. 
Well-known hits have more than 200,000,000 streams, and hidden gems have less than 100,000,000. 
Additionally, include a mix of well-known artists (>10 million monthly listeners) and lesser-known artists. 
For EACH song you choose, call the search_spotify_track tool to verify it exists on Spotify.
Once you have verified all tracks, respond with exactly two lines in this exact format and nothing else:
TITLE: <a short, catchy playlist name, 2-5 words, no quotes>
SUMMARY: <one brief, friendly sentence describing the overall vibe and calling out 1-2 standout songs by name>
Do not list out all the tracks or their details in the summary - the full tracklist is shown separately."""

def get_spotify_oauth():
    return SpotifyOAuth(
        client_id=os.getenv("SPOTIFY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
        redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
        scope="user-top-read user-read-recently-played playlist-modify-public playlist-modify-private user-library-read user-library-modify",
        # Without this, spotipy falls back to a shared file cache (backend/.cache) and
        # get_access_token() returns whatever token is in that file instead of exchanging
        # the fresh code, so every login can collide onto one stale token.
        cache_handler=spotipy.cache_handler.MemoryCacheHandler()
    )

@app.route("/")
def root():
    return {"status": "DJWizard backend is running"}

@app.route("/login")
def login():
    sp_oauth = get_spotify_oauth()
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

@app.route("/callback")
def callback():
    error = request.args.get("error")
    if error:
        return redirect(f"http://localhost:5173?auth_error={error}")

    code = request.args.get("code")
    if not code:
        return redirect("http://localhost:5173?auth_error=missing_code")

    sp_oauth = get_spotify_oauth()
    token_info = sp_oauth.get_access_token(code, check_cache=False)
    token_id = str(uuid.uuid4())
    token_store[token_id] = token_info
    return redirect(f"http://localhost:5173?token={token_id}")

@app.route("/check-auth")
def check_auth():
    token_id = request.args.get("token_id")
    if not token_id or token_id not in token_store:
        return jsonify({"logged_in": False})
    return jsonify({"logged_in": True})

@app.route("/me")
def get_current_user():
    token_id = request.args.get("token_id")
    if not token_id or token_id not in token_store:
        return jsonify({"error": "Not logged in"}), 401
    sp = spotipy.Spotify(auth=token_store[token_id]["access_token"])
    return jsonify(sp.current_user())

@app.route("/top-artists")
def get_top_artists():
    token_id = request.args.get("token_id")
    if not token_id or token_id not in token_store:
        return jsonify({"error": "Not logged in"}), 401
    sp = spotipy.Spotify(auth=token_store[token_id]["access_token"])
    top_artists = sp.current_user_top_artists(limit=10, time_range="medium_term")
    artists = [{
        "name": artist.get("name", ""),
        "genres": artist.get("genres", []),
        "popularity": artist.get("popularity", 0),
        "id": artist.get("id", "")
    } for artist in top_artists["items"]]
    return jsonify(artists)

@app.route("/top-tracks")
def get_top_tracks():
    token_id = request.args.get("token_id")
    if not token_id or token_id not in token_store:
        return jsonify({"error": "Not logged in"}), 401
    sp = spotipy.Spotify(auth=token_store[token_id]["access_token"])
    top_tracks = sp.current_user_top_tracks(limit=10, time_range="medium_term")
    tracks = [{
        "name": track.get("name", ""),
        "artist": track["artists"][0]["name"],
        "popularity": track.get("popularity", 0),
        "id": track.get("id", "")
    } for track in top_tracks["items"]]
    return jsonify(tracks)

def search_track(token_id, track_name, artist_name):
    sp = spotipy.Spotify(auth=token_store[token_id]["access_token"])
    query = f"track:{track_name} artist:{artist_name}"
    results = sp.search(q=query, type="track", limit=1)
    items = results["tracks"]["items"]
    if not items:
        return {"found": False, "track_name": track_name, "artist_name": artist_name}
    track = items[0]
    return {
        "found": True,
        "name": track["name"],
        "artist": track["artists"][0]["name"],
        "id": track["id"],
        "url": track["external_urls"]["spotify"],
        "album_image": track["album"]["images"][0]["url"] if track["album"]["images"] else None
    }

def run_playlist_conversation(token_id, messages):
    found_tracks = []
    while True:
        response = claude_client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            system=SYSTEM_PROMPT,
            tools=tools,
            messages=messages
        )

        if response.stop_reason != "tool_use":
            final_text = next(block.text for block in response.content if block.type == "text")
            return final_text, found_tracks

        messages.append({"role": "assistant", "content": response.content})

        tool_results = []
        for block in response.content:
            if block.type == "tool_use" and block.name == "search_spotify_track":
                result = search_track(token_id, **block.input)
                if result.get("found"):
                    found_tracks.append(result)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result)
                })

        messages.append({"role": "user", "content": tool_results})

def parse_title_and_summary(text):
    title_match = re.search(r"TITLE:\s*(.+)", text)
    summary_match = re.search(r"SUMMARY:\s*(.+)", text, re.DOTALL)
    title = title_match.group(1).strip() if title_match else "Untitled Playlist"
    summary = summary_match.group(1).strip() if summary_match else text.strip()
    return title, summary

@app.route("/chat", methods=["POST"])
def chat():
    token_id = request.json.get("token_id")
    if not token_id or token_id not in token_store:
        return jsonify({"error": "Not logged in"}), 401

    user_message = request.json.get("message")
    messages = [{"role": "user", "content": user_message}]

    final_text, found_tracks = run_playlist_conversation(token_id, messages)
    title, summary = parse_title_and_summary(final_text)

    playlist = {
        "id": str(uuid.uuid4()),
        "name": title,
        "prompt": user_message,
        "summary": summary,
        "tracks": found_tracks,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    playlist_store.setdefault(token_id, []).append(playlist)

    return jsonify({"response": summary, "tracks": found_tracks, "playlist": playlist})

@app.route("/playlists")
def get_playlists():
    token_id = request.args.get("token_id")
    if not token_id or token_id not in token_store:
        return jsonify({"error": "Not logged in"}), 401
    return jsonify(playlist_store.get(token_id, []))

@app.route("/playlists/<playlist_id>", methods=["PATCH"])
def rename_playlist(playlist_id):
    token_id = request.json.get("token_id")
    if not token_id or token_id not in token_store:
        return jsonify({"error": "Not logged in"}), 401

    name = request.json.get("name", "").strip()
    if not name:
        return jsonify({"error": "Name is required"}), 400

    playlist = next(
        (p for p in playlist_store.get(token_id, []) if p["id"] == playlist_id), None
    )
    if not playlist:
        return jsonify({"error": "Playlist not found"}), 404

    playlist["name"] = name
    return jsonify(playlist)

@app.route("/playlists/<playlist_id>/more", methods=["POST"])
def generate_more(playlist_id):
    token_id = request.json.get("token_id")
    if not token_id or token_id not in token_store:
        return jsonify({"error": "Not logged in"}), 401

    playlist = next(
        (p for p in playlist_store.get(token_id, []) if p["id"] == playlist_id), None
    )
    if not playlist:
        return jsonify({"error": "Playlist not found"}), 404

    existing_names = ", ".join(f'"{t["name"]}" by {t["artist"]}' for t in playlist["tracks"])
    followup_message = (
        f"Earlier you built a playlist called \"{playlist['name']}\" for this request: "
        f"\"{playlist['prompt']}\". The existing tracks are: {existing_names}. "
        f"Add about 5 more real songs that fit the same vibe, without repeating any of the existing tracks."
    )
    messages = [{"role": "user", "content": followup_message}]

    _, new_tracks = run_playlist_conversation(token_id, messages)

    existing_ids = {t["id"] for t in playlist["tracks"]}
    for track in new_tracks:
        if track["id"] not in existing_ids:
            playlist["tracks"].append(track)
            existing_ids.add(track["id"])

    return jsonify(playlist)

if __name__ == "__main__":
    app.run(debug=True)
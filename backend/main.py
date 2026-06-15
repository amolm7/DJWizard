from flask import Flask, redirect, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth

load_dotenv()

app = Flask(__name__)
CORS(app)

app.secret_key = "djwizard_secret"

def get_spotify_oauth():
    return SpotifyOAuth(
        client_id=os.getenv("SPOTIFY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
        redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
        scope="user-top-read user-read-recently-played playlist-modify-public playlist-modify-private user-library-read user-library-modify"
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
    sp_oauth = get_spotify_oauth()
    code = request.args.get("code")
    token_info = sp_oauth.get_access_token(code)
    session["token_info"] = token_info
    return jsonify({"status": "Logged in successfully"})

@app.route("/me")
def get_current_user():
    token_info = session.get("token_info")
    if not token_info:
        return jsonify({"error": "User not logged in"}), 401
    sp = spotipy.Spotify(auth=token_info["access_token"])
    user = sp.current_user()
    return jsonify(user)

@app.route("/top-artists")
def get_top_artists():
    token_info = session.get("token_info")
    if not token_info:
        return jsonify({"error": "User not logged in"}), 401
    sp = spotipy.Spotify(auth=token_info["access_token"])
    top_artists = sp.current_user_top_artists(limit=10, time_range = "medium_term")
    artists = [{
        "name": artist.get("name"),
        "id": artist.get("id"),
        "genres": artist.get("genres", []),
        "popularity": artist.get("popularity"),
    } for artist in top_artists["items"]]
    return jsonify(artists)

@app.route("/top-tracks")
def get_top_tracks():
    token_info = session.get("token_info")
    if not token_info:
        return jsonify({"error": "User not logged in"}), 401
    sp = spotipy.Spotify(auth=token_info["access_token"])
    top_tracks = sp.current_user_top_tracks(limit=10, time_range = "medium_term"   )
    tracks = [{
        "name": track.get("name"),
        "id": track.get("id"),
        "album": track.get("album", {}).get("name"),
        "popularity": track.get("popularity", []),
    } for track in top_tracks["items"]]
    return jsonify(tracks)

if __name__ == "__main__":
    app.run(debug=True)
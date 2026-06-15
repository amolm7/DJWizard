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


if __name__ == "__main__":
    app.run(debug=True)
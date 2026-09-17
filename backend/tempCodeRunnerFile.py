from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return "RideX Backend is Running!"


@app.route("/api/test")
def test():
    return {
        "status": "success",
        "message": "RideX API is working"
    }


if __name__ == "__main__":
    app.run(debug=True, port=5000)
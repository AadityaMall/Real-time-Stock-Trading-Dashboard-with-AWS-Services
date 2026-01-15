from flask import Flask, jsonify

def create_app():
    app = Flask(__name__)

    @app.route("/")
    def home():
        return jsonify({
            "message": "AWS-Based Real-Time Stock Analytics & Price Forecasting Platform",
            "status": "Backend running"
        })

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
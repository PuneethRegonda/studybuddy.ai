from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

# Initialize Flask
app = Flask(__name__)
CORS(app, supports_credentials=True)  # Apply CORS globally
from flask import Flask, request, jsonify, make_response
import traceback
import uuid

@app.route("/upload", methods=["POST", "OPTIONS"])
def upload_file():
    try:
        if request.method == "OPTIONS":
            response = make_response()
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add("Access-Control-Allow-Headers", "Content-Type")
            response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
            return response

        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]

        if not file or file.filename == '':
            return jsonify({"error": "Empty file uploaded"}), 400

        # Dummy response matching frontend format
        response = jsonify({
            "id": f"text-{uuid.uuid4()}",
            "type": "text",
            "data": {
                "title": file.filename.rsplit('.', 1)[0],  # filename without extension
                "content": "## Test Markdown\n\n- Item 1\n- Item 2"
            }
        })
        print(response);
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 200

    except Exception as e:
        print("Upload error:", e)
        print(traceback.format_exc())
        response = jsonify({"error": "Internal server error", "details": str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)


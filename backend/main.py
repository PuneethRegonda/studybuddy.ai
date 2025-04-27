import uuid
from flask import Flask, request, jsonify
import google.generativeai as genai
from dotenv import load_dotenv
import os
import logging
import tempfile
from flask_cors import CORS   # <-- Add this
import json

# Setup logging
logging.basicConfig(level=logging.DEBUG)

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
# CORS(app)  # This line allows all origins by default
# CORS(app, resources={r"/*": {"origins": "*"}})  
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
# Configure Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel(model_name="models/gemini-1.5-pro-latest")


@app.route("/upload", methods=["POST"])
def upload_pdf():
    if "file" not in request.files:
        logging.error("No file part in request")
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        logging.error("Empty filename uploaded")
        return jsonify({"error": "Empty file uploaded"}), 400

    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp:
            temp.write(file.read())
            temp_path = temp.name

        logging.info(f"Saved uploaded file temporarily at {temp_path}")

        # Upload file to Gemini
        uploaded_file = genai.upload_file(
            path=temp_path,
            mime_type="application/pdf"
        )
        logging.info(f"Uploaded file to Gemini with file ID: {uploaded_file.name}")

        # Create prompt
        prompt = """
You are a smart learning assistant.

Given the uploaded PDF file, please summarize it into:
- A clear, readable, well-structured **Markdown** formatted text
- Use headings (##), bullet points, and important highlights.
- Write for a college-level audience.
- Strictly output only the Markdown text.
        """

        # Final correct call to Gemini
        response = model.generate_content(
            contents=[
                {
                    "role": "user",
                    "parts": [
                        {
                            "file_data": {
                                "file_uri": uploaded_file.uri
                            }
                        }
                    ]
                },
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ]
        )

        summarized_text = response.text.strip()
        logging.info(f"Summarization complete for file: {file.filename}")

        # Clean up temp file
        os.remove(temp_path)

        # ✅ Return clean frontend-friendly JSON response
        return jsonify({
            "id": f"text-{uuid.uuid4()}",  # NEW 🔥
            "type": "text",
            "data": {
                "title": file.filename.rsplit('.', 1)[0],
                "content": summarized_text
            }
        }), 200

    except Exception as e:
        logging.exception("Exception occurred while processing upload")
        return jsonify({"error": "Server error", "details": str(e)}), 500




@app.route("/generate-flashcards", methods=["POST"])
def generate_flashcards():
    try:
        data = request.get_json()
        summarized_text = data.get("text")

        if not summarized_text:
            return jsonify({"error": "No text provided"}), 400

        prompt = f"""
Given this summarized content:

\"\"\"
{summarized_text}
\"\"\"

Generate 5-7 flashcards.
Each flashcard must have:
- 'front': Question or Term
- 'back': Answer

Return as raw JSON array:
[
  {{"front": "...", "back": "..."}},
  ...
]
Strictly output valid JSON, no extra text.
"""

        response = model.generate_content(prompt)
        raw_flashcards = response.text.strip()

        if raw_flashcards.startswith("```json"):
            raw_flashcards = raw_flashcards.replace("```json", "").replace("```", "").strip()

        cards = json.loads(raw_flashcards)

        # Wrap into your frontend structure
        formatted_flashcards = {
            "id": f"flashcard-{uuid.uuid4()}",
            "type": "flipcard",
            "data": {
                "title": "Generated Flashcards",
                "cards": [
                    {
                        "id": str(i + 1),
                        "front": card["front"],
                        "back": card["back"]
                    }
                    for i, card in enumerate(cards)
                ]
            }
        }

        return jsonify(formatted_flashcards)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/generate-quiz", methods=["POST"])
def generate_quiz():
    try:
        data = request.get_json()
        summarized_text = data.get("text")

        if not summarized_text:
            return jsonify({"error": "No text provided"}), 400

        prompt = f"""
Given this summarized content:

\"\"\"
{summarized_text}
\"\"\"

Generate 5-7 multiple choice questions.
Each question must have:
- 'question'
- 'options' (4 options)
- 'correctOptionIndex' (0-3)
- 'explanation'

Return as raw JSON array:
[
  {{
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correctOptionIndex": 2,
    "explanation": "..."
  }},
  ...
]
Strictly output valid JSON, no extra text.
"""

        response = model.generate_content(prompt)
        raw_quiz = response.text.strip()

        if raw_quiz.startswith("```json"):
            raw_quiz = raw_quiz.replace("```json", "").replace("```", "").strip()

        questions = json.loads(raw_quiz)

        # Wrap into your frontend structure
        formatted_quiz = {
            "id": f"quiz-{uuid.uuid4()}",
            "type": "quiz",
            "data": {
                "title": "Generated Quiz",
                "description": "Quiz to test your understanding!",
                "questions": [
                    {
                        "id": f"q{i + 1}",
                        "question": q["question"],
                        "options": q["options"],
                        "correctOptionIndex": q["correctOptionIndex"],
                        "explanation": q["explanation"]
                    }
                    for i, q in enumerate(questions)
                ]
            }
        }

        return jsonify(formatted_quiz)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/generate-mindmap", methods=["POST"])
def generate_mindmap():
    try:
        data = request.get_json()
        summarized_text = data.get("text")

        if not summarized_text:
            return jsonify({"error": "No text provided"}), 400

        prompt = f"""
Given the following summarized content:

\"\"\"
{summarized_text}
\"\"\"

Create a mindmap in JSON format:
- A 'root' node (string title)
- 'children' as an array of subtopics
- Each child can have its own children

Format as:
{{
  "id": "mindmap-id",
  "type": "mindmap",
  "data": {{
    "title": "Mind Map Title",
    "root": {{
      "title": "Root Topic",
      "children": [
        {{
          "title": "Subtopic 1",
          "children": [...]
        }},
        ...
      ]
    }}
  }}
}}
Strictly return valid JSON only, no explanation.
"""

        response = model.generate_content(prompt)
        mindmap_text = response.text.strip()

        if mindmap_text.startswith("```json"):
            mindmap_text = mindmap_text.replace("```json", "").replace("```", "").strip()

        mindmap_data = json.loads(mindmap_text)

        return jsonify(mindmap_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/generate-mini-game", methods=["POST"])
def generate_mini_game():
    try:
        data = request.get_json()
        summarized_text = data.get("text")

        if not summarized_text:
            return jsonify({"error": "No text provided"}), 400

        prompt = f"""
You are a smart learning assistant.

Given the following summarized learning content:

\"\"\"
{summarized_text}
\"\"\"

Your task is to create a drag-and-drop mini-game.

- Generate 4-5 pairs of {{ "task", "solution" }}.
- Each 'task' is a keyword or term.
- Each 'solution' is the matching description or definition.
- Always include 'uiType': "drag-drop" for each challenge.

Strictly output valid JSON in this format:

{{
  "id": "mini-game-id",
  "type": "mini-game",
  "data": {{
    "title": "Mini Game Title",
    "challenges": [
      {{
        "task": "Operating System",
        "solution": "Acts as an intermediary between user and hardware",
        "uiType": "drag-drop"
      }},
      ...
    ]
  }}
}}

- DO NOT include any explanation.
- DO NOT wrap JSON inside triple backticks (```).
- ONLY return clean pure JSON.
"""

        # Generate from Gemini
        response = model.generate_content(prompt)
        mini_game_text = response.text.strip()

        # No need to clean backticks because prompt says "no backticks"
        mini_game_data = json.loads(mini_game_text)

        return jsonify(mini_game_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)


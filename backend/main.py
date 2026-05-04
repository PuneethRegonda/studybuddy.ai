import uuid
import re
import json
import os
import logging
import base64

import anthropic
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Setup
logging.basicConfig(level=logging.DEBUG)
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
MODEL = "claude-sonnet-4-20250514"


def ask_claude(prompt: str, max_tokens: int = 4096) -> str:
    """Send a text-only prompt to Claude."""
    message = client.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text.strip()


def ask_claude_with_pdf(pdf_bytes: bytes, prompt: str, max_tokens: int = 4096) -> str:
    """Send a PDF document + prompt to Claude. Claude sees the full PDF natively."""
    pdf_b64 = base64.standard_b64encode(pdf_bytes).decode("utf-8")

    message = client.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "base64",
                            "media_type": "application/pdf",
                            "data": pdf_b64,
                        },
                    },
                    {
                        "type": "text",
                        "text": prompt,
                    },
                ],
            }
        ],
    )
    return message.content[0].text.strip()


def extract_json(text: str):
    """Robustly extract JSON from Claude's response, stripping markdown fences."""
    cleaned = re.sub(r"^```(?:json|JSON)?\s*\n?", "", text, flags=re.MULTILINE)
    cleaned = re.sub(r"\n?```\s*$", "", cleaned, flags=re.MULTILINE)
    cleaned = cleaned.strip()
    return json.loads(cleaned)


@app.route("/upload", methods=["POST"])
def upload_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"error": "Empty file uploaded"}), 400

    try:
        pdf_bytes = file.read()

        if not pdf_bytes:
            return jsonify({"error": "Empty file"}), 400

        prompt = """You are a smart learning assistant.

Summarize this document into:
- A clear, readable, well-structured Markdown formatted text
- Use headings (##), bullet points, and important highlights
- If there are diagrams or images, describe what they show
- Write for a college-level audience
- Strictly output only the Markdown text, no preamble"""

        summarized_text = ask_claude_with_pdf(pdf_bytes, prompt)

        return jsonify({
            "id": f"text-{uuid.uuid4()}",
            "type": "text",
            "data": {
                "title": file.filename.rsplit('.', 1)[0],
                "content": summarized_text
            }
        }), 200

    except Exception as e:
        logging.exception("Error processing upload")
        return jsonify({"error": "Server error", "details": str(e)}), 500


@app.route("/generate-flashcards", methods=["POST"])
def generate_flashcards():
    try:
        data = request.get_json()
        summarized_text = data.get("text")
        if not summarized_text:
            return jsonify({"error": "No text provided"}), 400

        prompt = f"""Given this summarized content:

\"\"\"
{summarized_text}
\"\"\"

Generate 5-7 flashcards. Each flashcard must have:
- 'front': Question or Term
- 'back': Answer

Return as a raw JSON array. No explanation, no markdown fences, just valid JSON:
[
  {{"front": "...", "back": "..."}},
  ...
]"""

        raw = ask_claude(prompt)
        cards = extract_json(raw)

        return jsonify({
            "id": f"flashcard-{uuid.uuid4()}",
            "type": "flipcard",
            "data": {
                "title": "Generated Flashcards",
                "cards": [
                    {"id": str(i + 1), "front": c["front"], "back": c["back"]}
                    for i, c in enumerate(cards)
                ]
            }
        })

    except Exception as e:
        logging.exception("Error generating flashcards")
        return jsonify({"error": str(e)}), 500


@app.route("/generate-quiz", methods=["POST"])
def generate_quiz():
    try:
        data = request.get_json()
        summarized_text = data.get("text")
        if not summarized_text:
            return jsonify({"error": "No text provided"}), 400

        prompt = f"""Given this summarized content:

\"\"\"
{summarized_text}
\"\"\"

Generate 5-7 multiple choice questions. Each question must have:
- 'question'
- 'options' (4 options)
- 'correctOptionIndex' (0-3)
- 'explanation'

Return as a raw JSON array. No explanation, no markdown fences, just valid JSON:
[
  {{
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correctOptionIndex": 2,
    "explanation": "..."
  }},
  ...
]"""

        raw = ask_claude(prompt)
        questions = extract_json(raw)

        return jsonify({
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
        })

    except Exception as e:
        logging.exception("Error generating quiz")
        return jsonify({"error": str(e)}), 500


@app.route("/generate-mindmap", methods=["POST"])
def generate_mindmap():
    try:
        data = request.get_json()
        summarized_text = data.get("text")
        if not summarized_text:
            return jsonify({"error": "No text provided"}), 400

        prompt = f"""Given the following summarized content:

\"\"\"
{summarized_text}
\"\"\"

Create a mindmap in JSON format:
- A 'root' node with a string 'title'
- 'children' as an array of subtopics
- Each child can have its own children

Return ONLY valid JSON in this exact format, no explanation:
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
        }}
      ]
    }}
  }}
}}"""

        raw = ask_claude(prompt)
        mindmap_data = extract_json(raw)

        return jsonify(mindmap_data)

    except Exception as e:
        logging.exception("Error generating mindmap")
        return jsonify({"error": str(e)}), 500


@app.route("/generate-mini-game", methods=["POST"])
def generate_mini_game():
    try:
        data = request.get_json()
        summarized_text = data.get("text")
        if not summarized_text:
            return jsonify({"error": "No text provided"}), 400

        prompt = f"""You are a smart learning assistant.

Given the following summarized learning content:

\"\"\"
{summarized_text}
\"\"\"

Create a drag-and-drop mini-game with 4-5 pairs.
Each pair has a 'task' (keyword/term) and 'solution' (matching definition).

Return ONLY valid JSON in this exact format, no explanation:
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
      }}
    ]
  }}
}}"""

        raw = ask_claude(prompt)
        mini_game_data = extract_json(raw)

        return jsonify(mini_game_data)

    except Exception as e:
        logging.exception("Error generating mini-game")
        return jsonify({"error": str(e)}), 500


## ── Session & Analytics Endpoints ──

from database import SessionLocal, Document, StudySession, FocusEvent, QuizAttempt, ContentTransition, DistractionEvent, ChatMessage
from knowledge_graph import extract_knowledge_graph
from study_agent import chat_with_agent, generate_distraction_recap
from datetime import datetime


@app.route("/api/documents", methods=["POST"])
def create_document():
    """Store a processed document with its summary and knowledge graph."""
    try:
        data = request.get_json()
        doc_id = data.get("id", f"doc-{uuid.uuid4()}")
        filename = data.get("filename", "untitled")
        summary = data.get("summary", "")

        # Extract knowledge graph from summary
        kg = None
        try:
            kg = extract_knowledge_graph(summary)
        except Exception as e:
            logging.warning(f"Knowledge graph extraction failed: {e}")

        db = SessionLocal()
        doc = Document(
            id=doc_id,
            filename=filename,
            summary=summary,
            concepts=kg.get("concepts", []) if kg else [],
            knowledge_graph=kg,
        )
        db.merge(doc)  # Upsert
        db.commit()
        db.close()

        return jsonify({
            "id": doc_id,
            "knowledge_graph": kg,
        })

    except Exception as e:
        logging.exception("Error creating document")
        return jsonify({"error": str(e)}), 500


@app.route("/api/documents/<doc_id>/graph", methods=["GET"])
def get_knowledge_graph(doc_id):
    """Get the knowledge graph for a document."""
    db = SessionLocal()
    doc = db.query(Document).filter(Document.id == doc_id).first()
    db.close()

    if not doc:
        return jsonify({"error": "Document not found"}), 404

    return jsonify({
        "document_id": doc_id,
        "concepts": doc.concepts or [],
        "knowledge_graph": doc.knowledge_graph,
    })


@app.route("/api/documents", methods=["GET"])
def list_documents():
    """List all documents."""
    db = SessionLocal()
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    db.close()

    return jsonify({
        "documents": [
            {
                "id": d.id,
                "filename": d.filename,
                "created_at": d.created_at.isoformat() if d.created_at else None,
            }
            for d in docs
        ]
    })


@app.route("/api/documents/latest", methods=["GET"])
def get_latest_document():
    """Get the most recent document with its summary."""
    db = SessionLocal()
    doc = db.query(Document).order_by(Document.created_at.desc()).first()
    db.close()

    if not doc:
        return jsonify({"found": False}), 200

    return jsonify({
        "found": True,
        "id": doc.id,
        "filename": doc.filename,
        "summary": doc.summary,
        "concepts": doc.concepts,
        "knowledge_graph": doc.knowledge_graph,
    })


@app.route("/api/sessions/latest", methods=["GET"])
def get_latest_session():
    """Get the most recent active session."""
    db = SessionLocal()
    session = db.query(StudySession).order_by(StudySession.started_at.desc()).first()
    db.close()

    if not session:
        return jsonify({"found": False}), 200

    return jsonify({
        "found": True,
        "id": session.id,
        "document_id": session.document_id,
        "started_at": session.started_at.isoformat() if session.started_at else None,
        "distraction_count": session.distraction_count or 0,
    })


@app.route("/api/sessions", methods=["POST"])
def create_session():
    """Start a new study session."""
    try:
        data = request.get_json()
        session_id = f"session-{uuid.uuid4()}"
        document_id = data.get("document_id")

        db = SessionLocal()
        session = StudySession(
            id=session_id,
            document_id=document_id,
            started_at=datetime.utcnow(),
        )
        db.add(session)
        db.commit()
        db.close()

        return jsonify({"id": session_id})

    except Exception as e:
        logging.exception("Error creating session")
        return jsonify({"error": str(e)}), 500


@app.route("/api/sessions/<session_id>/focus", methods=["POST"])
def record_focus_events(session_id):
    """Record a batch of focus events."""
    try:
        data = request.get_json()
        events = data.get("events", [])

        db = SessionLocal()
        for event in events:
            fe = FocusEvent(
                session_id=session_id,
                focus_score=event.get("score", 0),
                content_type=event.get("contentType", "text"),
                timestamp=datetime.utcnow(),
            )
            db.add(fe)
        db.commit()
        db.close()

        return jsonify({"recorded": len(events)})

    except Exception as e:
        logging.exception("Error recording focus events")
        return jsonify({"error": str(e)}), 500


@app.route("/api/sessions/<session_id>/distraction", methods=["POST"])
def record_distraction(session_id):
    """Record a distraction event."""
    try:
        data = request.get_json()

        db = SessionLocal()
        de = DistractionEvent(
            session_id=session_id,
            started_at=datetime.utcnow(),
            duration_sec=data.get("duration_sec", 0),
        )
        db.add(de)

        # Update session distraction count
        session = db.query(StudySession).filter(StudySession.id == session_id).first()
        if session:
            session.distraction_count = (session.distraction_count or 0) + 1
        db.commit()
        db.close()

        return jsonify({"ok": True})

    except Exception as e:
        logging.exception("Error recording distraction")
        return jsonify({"error": str(e)}), 500


@app.route("/api/sessions/<session_id>/end", methods=["POST"])
def end_session(session_id):
    """End a study session and generate analytics."""
    try:
        db = SessionLocal()
        session = db.query(StudySession).filter(StudySession.id == session_id).first()
        if not session:
            db.close()
            return jsonify({"error": "Session not found"}), 404

        session.ended_at = datetime.utcnow()

        # Calculate analytics
        focus_events = db.query(FocusEvent).filter(FocusEvent.session_id == session_id).all()
        distractions = db.query(DistractionEvent).filter(DistractionEvent.session_id == session_id).all()
        transitions = db.query(ContentTransition).filter(ContentTransition.session_id == session_id).all()

        scores = [fe.focus_score for fe in focus_events if fe.focus_score is not None]
        avg_focus = sum(scores) / len(scores) if scores else 0

        duration_sec = (session.ended_at - session.started_at).total_seconds() if session.started_at else 0
        total_distraction_sec = sum(d.duration_sec or 0 for d in distractions)
        focused_time_sec = duration_sec - total_distraction_sec

        # Focus per content type
        focus_by_type = {}
        for fe in focus_events:
            ct = fe.content_type or "text"
            if ct not in focus_by_type:
                focus_by_type[ct] = {"scores": [], "count": 0}
            focus_by_type[ct]["scores"].append(fe.focus_score)
            focus_by_type[ct]["count"] += 1

        content_effectiveness = {}
        for ct, data in focus_by_type.items():
            content_effectiveness[ct] = {
                "avg_focus": round(sum(data["scores"]) / len(data["scores"]), 1),
                "time_pct": round(data["count"] / len(focus_events) * 100, 1) if focus_events else 0,
            }

        session_summary = {
            "total_duration_min": round(duration_sec / 60, 1),
            "focused_time_min": round(max(focused_time_sec, 0) / 60, 1),
            "focus_percentage": round(max(focused_time_sec, 0) / duration_sec * 100, 1) if duration_sec > 0 else 0,
            "avg_focus_score": round(avg_focus, 1),
            "distraction_count": len(distractions),
            "avg_distraction_sec": round(total_distraction_sec / len(distractions), 1) if distractions else 0,
            "content_switches": len(transitions),
            "content_effectiveness": content_effectiveness,
        }

        session.avg_focus_score = avg_focus
        session.total_focus_time_sec = max(focused_time_sec, 0)
        session.content_switches = len(transitions)
        session.session_summary = session_summary

        db.commit()
        db.close()

        return jsonify(session_summary)

    except Exception as e:
        logging.exception("Error ending session")
        return jsonify({"error": str(e)}), 500


@app.route("/api/sessions/<session_id>/analytics", methods=["GET"])
def get_session_analytics(session_id):
    """Get analytics for a session."""
    db = SessionLocal()
    session = db.query(StudySession).filter(StudySession.id == session_id).first()
    db.close()

    if not session:
        return jsonify({"error": "Session not found"}), 404

    return jsonify(session.session_summary or {"status": "session still active"})


## ── Agent Endpoints ──

@app.route("/api/agent/chat", methods=["POST"])
def agent_chat():
    """Chat with the study agent. Saves messages to DB."""
    try:
        data = request.get_json()
        user_message = data.get("message", "")
        session_id = data.get("sessionId")
        context = data.get("context", {})

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # Load history from DB if session exists
        conversation_history = []
        if session_id:
            db = SessionLocal()
            msgs = db.query(ChatMessage).filter(
                ChatMessage.session_id == session_id
            ).order_by(ChatMessage.created_at).all()
            conversation_history = [{"role": m.role, "content": m.content} for m in msgs]

            # Save user message
            db.add(ChatMessage(session_id=session_id, role="user", content=user_message))
            db.commit()
            db.close()

        response = chat_with_agent(
            user_message=user_message,
            conversation_history=conversation_history,
            document_title=context.get("documentTitle", ""),
            summary_text=context.get("summaryText", ""),
            focus_score=context.get("focusScore", 75),
            current_content_type=context.get("contentType", "text"),
            distraction_count=context.get("distractionCount", 0),
            session_duration_min=context.get("sessionDurationMin", 0),
            knowledge_graph=context.get("knowledgeGraph"),
            quiz_performance=context.get("quizPerformance"),
        )

        # Save assistant response
        if session_id:
            db = SessionLocal()
            db.add(ChatMessage(session_id=session_id, role="assistant", content=response))
            db.commit()
            db.close()

        return jsonify({"response": response})

    except Exception as e:
        logging.exception("Error in agent chat")
        return jsonify({"error": str(e)}), 500


@app.route("/api/agent/history/<session_id>", methods=["GET"])
def get_chat_history(session_id):
    """Load chat history for a session."""
    db = SessionLocal()
    msgs = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at).all()
    db.close()

    return jsonify({
        "messages": [{"role": m.role, "content": m.content} for m in msgs]
    })


@app.route("/api/agent/recap", methods=["POST"])
def agent_recap():
    """Generate a distraction recovery recap."""
    try:
        data = request.get_json()

        recap = generate_distraction_recap(
            document_title=data.get("documentTitle", ""),
            summary_text=data.get("summaryText", ""),
            last_content_type=data.get("contentType", "text"),
            last_section_context=data.get("lastSection", ""),
            absence_duration_sec=data.get("absenceDurationSec", 0),
        )

        return jsonify({"recap": recap})

    except Exception as e:
        logging.exception("Error generating recap")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)

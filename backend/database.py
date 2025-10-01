import os
from datetime import datetime
from sqlalchemy import create_engine, Column, String, Text, Float, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DB_PATH = os.path.join(os.path.dirname(__file__), "studybuddy.db")
engine = create_engine(f"sqlite:///{DB_PATH}", echo=False)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True)
    filename = Column(String, nullable=False)
    summary = Column(Text)
    concepts = Column(JSON)  # List of extracted concepts
    knowledge_graph = Column(JSON)  # Nodes + edges
    created_at = Column(DateTime, default=datetime.utcnow)

    sessions = relationship("StudySession", back_populates="document")


class StudySession(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True)
    document_id = Column(String, ForeignKey("documents.id"))
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    total_focus_time_sec = Column(Float, default=0)
    avg_focus_score = Column(Float, default=0)
    distraction_count = Column(Integer, default=0)
    content_switches = Column(Integer, default=0)
    session_summary = Column(JSON)  # Post-session report

    document = relationship("Document", back_populates="sessions")
    focus_events = relationship("FocusEvent", back_populates="session")
    quiz_attempts = relationship("QuizAttempt", back_populates="session")
    transitions = relationship("ContentTransition", back_populates="session")
    distractions = relationship("DistractionEvent", back_populates="session")


class FocusEvent(Base):
    __tablename__ = "focus_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("sessions.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    focus_score = Column(Float)
    content_type = Column(String)

    session = relationship("StudySession", back_populates="focus_events")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("sessions.id"))
    question_text = Column(Text)
    user_answer = Column(String)
    is_correct = Column(Integer)  # 0 or 1
    time_spent_ms = Column(Integer)
    concept = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("StudySession", back_populates="quiz_attempts")


class ContentTransition(Base):
    __tablename__ = "content_transitions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("sessions.id"))
    from_type = Column(String)
    to_type = Column(String)
    reason = Column(String)
    focus_before = Column(Float)
    focus_after = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("StudySession", back_populates="transitions")


class DistractionEvent(Base):
    __tablename__ = "distraction_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("sessions.id"))
    started_at = Column(DateTime)
    duration_sec = Column(Float)

    session = relationship("StudySession", back_populates="distractions")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("sessions.id"))
    role = Column(String)  # 'user' or 'assistant'
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


# Create all tables
Base.metadata.create_all(engine)

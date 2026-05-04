"""Generate RAG Evaluation ERD matching the existing report style."""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

fig, ax = plt.subplots(1, 1, figsize=(18, 16))
ax.set_xlim(0, 18)
ax.set_ylim(-2, 14)
ax.axis('off')
fig.patch.set_facecolor('#FFFFFF')

# Colors matching the existing ERD style
PURPLE_BG = '#F3E8FF'
PURPLE_BORDER = '#A855F7'
GREEN_BG = '#D1FAE5'
GREEN_BORDER = '#34D399'
ORANGE_BG = '#FFF7ED'
ORANGE_BORDER = '#FB923C'
CYAN_BG = '#E0F7FA'
CYAN_BORDER = '#26C6DA'
YELLOW_BG = '#FEF9C3'
YELLOW_BORDER = '#FACC15'
PINK_BG = '#FCE7F3'
PINK_BORDER = '#F472B6'
BLUE_BG = '#DBEAFE'
BLUE_BORDER = '#60A5FA'
DARK = '#1F2937'
GRAY = '#6B7280'
HEADER_BG = '#F9FAFB'

def draw_table(ax, x, y, w, table_name, columns, color_bg, color_border, header_color=None):
    """Draw an ERD-style table box.
    columns: list of (type, name, constraint) tuples
    """
    row_h = 0.38
    header_h = 0.45
    total_h = header_h + row_h * len(columns)

    # Outer border
    outer = FancyBboxPatch((x, y - total_h), w, total_h,
                            boxstyle="round,pad=0.03",
                            facecolor=color_bg, edgecolor=color_border, linewidth=2.5)
    ax.add_patch(outer)

    # Header
    header = FancyBboxPatch((x + 0.03, y - header_h + 0.03), w - 0.06, header_h - 0.06,
                             boxstyle="round,pad=0.02",
                             facecolor=color_border, edgecolor=color_border, linewidth=0)
    ax.add_patch(header)
    ax.text(x + w/2, y - header_h/2, table_name, ha='center', va='center',
            fontsize=13, fontweight='bold', color='white')

    # Column rows
    for i, (col_type, col_name, constraint) in enumerate(columns):
        row_y = y - header_h - row_h * i

        # Separator line
        if i > 0:
            ax.plot([x + 0.1, x + w - 0.1], [row_y, row_y],
                    color=color_border, linewidth=0.5, alpha=0.3)

        # Type
        ax.text(x + 0.2, row_y - row_h/2, col_type, ha='left', va='center',
                fontsize=9, color=GRAY, fontfamily='monospace')
        # Name
        ax.text(x + w * 0.4, row_y - row_h/2, col_name, ha='left', va='center',
                fontsize=10, color=DARK, fontweight='bold' if constraint else 'normal')
        # Constraint
        if constraint:
            ax.text(x + w - 0.2, row_y - row_h/2, constraint, ha='right', va='center',
                    fontsize=8, color=color_border, fontweight='bold')

    return total_h

def draw_relationship(ax, x1, y1, x2, y2, label='', color='#9CA3AF', style='-'):
    """Draw a relationship line between tables."""
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=2,
                               connectionstyle='arc3,rad=0'))
    if label:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        ax.text(mx, my + 0.15, label, ha='center', va='center',
                fontsize=9, color=color, style='italic',
                bbox=dict(boxstyle='round,pad=0.2', facecolor='white',
                         edgecolor='none', alpha=0.9))

def draw_crow_foot(ax, x1, y1, x2, y2, label='', color='#374151'):
    """Draw relationship with crow's foot notation."""
    # Main line
    ax.plot([x1, x2], [y1, y2], color=color, linewidth=2)

    # Crow's foot at destination (many side)
    dx = x2 - x1
    dy = y2 - y1
    length = (dx**2 + dy**2)**0.5
    if length == 0:
        return
    ux, uy = dx/length, dy/length
    px, py = -uy, ux  # perpendicular

    foot_size = 0.15
    # Three lines from the endpoint
    ax.plot([x2, x2 - ux*0.3 + px*foot_size], [y2, y2 - uy*0.3 + py*foot_size],
            color=color, linewidth=2)
    ax.plot([x2, x2 - ux*0.3 - px*foot_size], [y2, y2 - uy*0.3 - py*foot_size],
            color=color, linewidth=2)
    ax.plot([x2, x2 - ux*0.3], [y2, y2 - uy*0.3], color=color, linewidth=2)

    # One side (circle)
    ax.plot(x1, y1, 'o', color=color, markersize=6, markerfacecolor='white', markeredgewidth=2)

    if label:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        ax.text(mx, my + 0.2, label, ha='center', va='center',
                fontsize=9, color=color, style='italic',
                bbox=dict(boxstyle='round,pad=0.15', facecolor='white',
                         edgecolor='none', alpha=0.9))

# ── Title ──
ax.text(9, 13.5, 'RAG Evaluation — Database Schema (ERD)', ha='center', va='center',
        fontsize=20, fontweight='bold', color=DARK)
ax.text(9, 13.1, 'Additional tables for dual-pipeline evaluation harness', ha='center', va='center',
        fontsize=12, color=GRAY, style='italic')

# ── Existing tables (shown as references) ──

# documents (reference - shown faded)
doc_cols = [
    ('STRING', 'id', 'PK'),
    ('STRING', 'filename', ''),
    ('TEXT', 'summary', ''),
    ('JSON', 'knowledge_graph', ''),
]
doc_h = draw_table(ax, 0.5, 12, 4, 'documents', doc_cols, '#F3F4F6', '#9CA3AF')

# document_sections (reference)
sec_cols = [
    ('STRING', 'id', 'PK'),
    ('STRING', 'document_id', 'FK'),
    ('STRING', 'title', ''),
    ('TEXT', 'content', ''),
    ('JSON', 'concepts', ''),
]
sec_h = draw_table(ax, 0.5, 6.2, 4, 'document_sections', sec_cols, '#F3F4F6', '#9CA3AF')

# Label these as existing
ax.text(2.5, 12.25, '(existing)', ha='center', va='center', fontsize=9,
        color='#9CA3AF', style='italic')
ax.text(2.5, 6.45, '(existing)', ha='center', va='center', fontsize=9,
        color='#9CA3AF', style='italic')

# ── NEW: eval_test_cases ──
tc_cols = [
    ('INTEGER', 'id', 'PK'),
    ('STRING', 'document_id', 'FK'),
    ('STRING', 'section_id', 'FK'),
    ('TEXT', 'question', ''),
    ('TEXT', 'ground_truth', ''),
    ('TEXT', 'source_chunk_text', ''),
    ('DATETIME', 'created_at', ''),
]
tc_h = draw_table(ax, 6.5, 12, 5, 'eval_test_cases', tc_cols, GREEN_BG, GREEN_BORDER)

# ── NEW: eval_runs ──
run_cols = [
    ('INTEGER', 'id', 'PK'),
    ('STRING', 'document_id', 'FK'),
    ('DATETIME', 'started_at', ''),
    ('DATETIME', 'completed_at', ''),
    ('STRING', 'status', ''),
    ('JSON', 'summary', ''),
]
run_h = draw_table(ax, 12.5, 12, 5, 'eval_runs', run_cols, PURPLE_BG, PURPLE_BORDER)

# ── NEW: eval_results ──
res_cols = [
    ('INTEGER', 'id', 'PK'),
    ('INTEGER', 'run_id', 'FK'),
    ('INTEGER', 'test_case_id', 'FK'),
    ('STRING', 'pipeline', ''),
    ('TEXT', 'answer', ''),
    ('FLOAT', 'accuracy_score', ''),
    ('FLOAT', 'relevance_score', ''),
    ('FLOAT', 'groundedness_score', ''),
    ('INTEGER', 'latency_ms', ''),
    ('INTEGER', 'token_count', ''),
    ('JSON', 'retrieved_chunks', ''),
    ('DATETIME', 'created_at', ''),
]
res_h = draw_table(ax, 7, 5.5, 5.5, 'eval_results', res_cols, ORANGE_BG, ORANGE_BORDER)

# ── Relationships ──

# documents -> eval_test_cases (1:N)
draw_crow_foot(ax, 4.5, 11.2, 6.5, 11.2, 'generates', '#34D399')

# documents -> eval_runs (1:N)
draw_crow_foot(ax, 4.5, 11.6, 12.5, 11.6, 'evaluated by', PURPLE_BORDER)

# document_sections -> eval_test_cases (1:N)
draw_crow_foot(ax, 4.5, 5.8, 6.5, 8.5, 'sourced from', '#34D399')

# eval_runs -> eval_results (1:N)
draw_crow_foot(ax, 15, 9.5, 12.5, 5.2, 'contains', PURPLE_BORDER)

# eval_test_cases -> eval_results (1:N)
draw_crow_foot(ax, 9, 8.8, 9.5, 5.5, 'tested by', '#34D399')

# ── Legend ──
legend_y = 0.0
ax.text(1, legend_y + 0.5, 'Legend:', fontsize=11, fontweight='bold', color=DARK)

# Existing table
box1 = FancyBboxPatch((1, legend_y - 0.3), 0.6, 0.4, boxstyle="round,pad=0.03",
                       facecolor='#F3F4F6', edgecolor='#9CA3AF', linewidth=2)
ax.add_patch(box1)
ax.text(1.9, legend_y - 0.1, 'Existing table (reference)', fontsize=10, color=GRAY, va='center')

# New table (green)
box2 = FancyBboxPatch((5.5, legend_y - 0.3), 0.6, 0.4, boxstyle="round,pad=0.03",
                       facecolor=GREEN_BG, edgecolor=GREEN_BORDER, linewidth=2)
ax.add_patch(box2)
ax.text(6.4, legend_y - 0.1, 'New: Test Cases', fontsize=10, color=GREEN_BORDER, va='center')

# New table (purple)
box3 = FancyBboxPatch((9.5, legend_y - 0.3), 0.6, 0.4, boxstyle="round,pad=0.03",
                       facecolor=PURPLE_BG, edgecolor=PURPLE_BORDER, linewidth=2)
ax.add_patch(box3)
ax.text(10.4, legend_y - 0.1, 'New: Eval Runs', fontsize=10, color=PURPLE_BORDER, va='center')

# New table (orange)
box4 = FancyBboxPatch((13.5, legend_y - 0.3), 0.6, 0.4, boxstyle="round,pad=0.03",
                       facecolor=ORANGE_BG, edgecolor=ORANGE_BORDER, linewidth=2)
ax.add_patch(box4)
ax.text(14.4, legend_y - 0.1, 'New: Eval Results', fontsize=10, color=ORANGE_BORDER, va='center')

# Constraints legend
ax.text(1, legend_y - 0.9, 'PK = Primary Key    FK = Foreign Key    STRING/TEXT/INTEGER/FLOAT/JSON/DATETIME = Column Types',
        fontsize=9, color=GRAY)

# ── Pipeline values note ──
note_box = FancyBboxPatch((7.2, -1.3), 5, 0.6, boxstyle="round,pad=0.1",
                           facecolor=YELLOW_BG, edgecolor=YELLOW_BORDER, linewidth=1.5)
ax.add_patch(note_box)
ax.text(9.7, -1.0, 'pipeline values: "rag" | "full_context"\nstatus values: "running" | "completed" | "failed"',
        ha='center', va='center', fontsize=9, color='#92400E', fontfamily='monospace')

plt.tight_layout()
out = '/Users/spartan/Desktop/code/studybuddy.ai/rag_eval_erd.png'
plt.savefig(out, dpi=200, bbox_inches='tight', facecolor='white', pad_inches=0.3)
print(f"Saved: {out}")

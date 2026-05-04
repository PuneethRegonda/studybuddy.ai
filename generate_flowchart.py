"""Generate a professional dual-pipeline RAG flowchart as PNG."""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

fig, ax = plt.subplots(1, 1, figsize=(16, 12))
ax.set_xlim(0, 16)
ax.set_ylim(-1.5, 11)
ax.axis('off')
fig.patch.set_facecolor('#FFFFFF')

# Colors
BLUE = '#2563EB'
BLUE_LIGHT = '#DBEAFE'
GREEN = '#059669'
GREEN_LIGHT = '#D1FAE5'
PURPLE = '#7C3AED'
PURPLE_LIGHT = '#EDE9FE'
ORANGE = '#EA580C'
ORANGE_LIGHT = '#FFF7ED'
GRAY = '#374151'
GRAY_LIGHT = '#F3F4F6'
DARK = '#1F2937'
AMBER = '#D97706'
AMBER_LIGHT = '#FEF3C7'

def draw_box(ax, x, y, w, h, text, color, bg, fontsize=10, bold=False):
    box = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.15",
                          facecolor=bg, edgecolor=color, linewidth=2)
    ax.add_patch(box)
    weight = 'bold' if bold else 'normal'
    ax.text(x + w/2, y + h/2, text, ha='center', va='center',
            fontsize=fontsize, color=DARK, fontweight=weight,
            wrap=True, linespacing=1.4)

def draw_arrow(ax, x1, y1, x2, y2, color=GRAY, style='->', lw=2):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=style, color=color, lw=lw,
                               connectionstyle='arc3,rad=0'))

def draw_curved_arrow(ax, x1, y1, x2, y2, color=GRAY, rad=0.3):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=2,
                               connectionstyle=f'arc3,rad={rad}'))

# ── Title ──
ax.text(8, 9.6, 'StudyBuddy.AI — Dual-Pipeline Chat Architecture',
        ha='center', va='center', fontsize=18, fontweight='bold', color=DARK)
ax.text(8, 9.2, 'Full Context vs RAG Pipeline Comparison',
        ha='center', va='center', fontsize=12, color='#6B7280', style='italic')

# ── Student Question (top center) ──
draw_box(ax, 5.5, 8.0, 5, 0.8, 'Student Question', BLUE, BLUE_LIGHT, fontsize=13, bold=True)

# ── Split label ──
ax.text(8, 7.5, 'pipeline parameter', ha='center', va='center',
        fontsize=9, color='#6B7280', style='italic')

# ── Arrows from question to both pipelines ──
draw_curved_arrow(ax, 6.5, 8.0, 3.5, 7.0, ORANGE, rad=0.2)
draw_curved_arrow(ax, 9.5, 8.0, 12.5, 7.0, GREEN, rad=-0.2)

# ── LEFT: Full Context Pipeline ──
ax.text(3.5, 7.3, 'pipeline = "full_context"', ha='center', va='center',
        fontsize=9, color=ORANGE, fontweight='bold')

draw_box(ax, 1.0, 5.8, 5, 0.8, 'Load Document Summary\n(first 3,000 characters)',
         ORANGE, ORANGE_LIGHT, fontsize=10)

draw_arrow(ax, 3.5, 5.8, 3.5, 5.2, ORANGE)

draw_box(ax, 1.0, 4.2, 5, 0.8, 'Build System Prompt\n+ Conversation History',
         ORANGE, ORANGE_LIGHT, fontsize=10)

draw_arrow(ax, 3.5, 4.2, 3.5, 3.6, ORANGE)

draw_box(ax, 1.0, 2.6, 5, 0.8, 'Claude Sonnet 4\n(Full Summary Context)',
         PURPLE, PURPLE_LIGHT, fontsize=10, bold=True)

draw_arrow(ax, 3.5, 2.6, 3.5, 2.0, ORANGE)

draw_box(ax, 1.0, 1.0, 5, 0.8, 'Response\n(No source attribution)',
         ORANGE, '#FEE2E2', fontsize=10, bold=True)

# ── RIGHT: RAG Pipeline ──
ax.text(12.5, 7.3, 'pipeline = "rag"', ha='center', va='center',
        fontsize=9, color=GREEN, fontweight='bold')

draw_box(ax, 10, 5.8, 5, 0.8, 'Embed Query\n(all-MiniLM-L6-v2, 384d)',
         GREEN, GREEN_LIGHT, fontsize=10)

draw_arrow(ax, 12.5, 5.8, 12.5, 5.2, GREEN)

draw_box(ax, 10, 4.2, 5, 0.8, 'ChromaDB Retrieval\n(Top-5 chunks, cosine similarity)',
         GREEN, GREEN_LIGHT, fontsize=10)

draw_arrow(ax, 12.5, 4.2, 12.5, 3.6, GREEN)

draw_box(ax, 10, 2.6, 5, 0.8, 'Claude Sonnet 4\n(Retrieved Chunks as Context)',
         PURPLE, PURPLE_LIGHT, fontsize=10, bold=True)

draw_arrow(ax, 12.5, 2.6, 12.5, 2.0, GREEN)

draw_box(ax, 10, 1.0, 5, 0.8, 'Response + Source Citations\n([1] Section: "...", [2] Section: "...")',
         GREEN, '#D1FAE5', fontsize=10, bold=True)

# ── Evaluation Harness (bottom) ──
draw_box(ax, 4.5, -0.2, 7, 0.7, 'Evaluation Harness: LLM-as-Judge\nAccuracy | Groundedness | Relevance | Latency | Token Cost',
         AMBER, AMBER_LIGHT, fontsize=9, bold=True)

draw_curved_arrow(ax, 3.5, 1.0, 6.0, 0.5, '#9CA3AF', rad=0.2)
draw_curved_arrow(ax, 12.5, 1.0, 10.0, 0.5, '#9CA3AF', rad=-0.2)

# ── Pipeline labels on sides ──
# Left pipeline label
ax.text(0.5, 4.5, 'FULL CONTEXT\nPIPELINE', ha='center', va='center',
        fontsize=11, color=ORANGE, fontweight='bold', rotation=90, alpha=0.3)

# Right pipeline label
ax.text(15.5, 4.5, 'RAG\nPIPELINE', ha='center', va='center',
        fontsize=11, color=GREEN, fontweight='bold', rotation=90, alpha=0.3)

# ── VS divider ──
ax.text(8, 4.6, 'VS', ha='center', va='center',
        fontsize=20, color='#D1D5DB', fontweight='bold', alpha=0.5)

# ── Dashed line divider ──
ax.plot([8, 8], [1.8, 7.0], color='#E5E7EB', linewidth=1.5, linestyle='--', alpha=0.7)

# ── Document indexing note (top right) ──
note_box = FancyBboxPatch((10.5, 6.8, ), 4.2, 0.6, boxstyle="round,pad=0.1",
                           facecolor='#F0FDF4', edgecolor='#86EFAC', linewidth=1.5, linestyle='--')
ax.add_patch(note_box)
ax.text(12.6, 7.1, 'On Upload: Sections chunked,\nembedded, stored in ChromaDB',
        ha='center', va='center', fontsize=8, color='#166534', style='italic')

plt.tight_layout()
out = '/Users/spartan/Desktop/code/studybuddy.ai/rag_pipeline_flowchart.png'
plt.savefig(out, dpi=200, bbox_inches='tight', facecolor='white', pad_inches=0.3)
print(f"Saved: {out}")

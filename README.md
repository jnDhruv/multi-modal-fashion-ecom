# Fashion Discovery Engine

Multimodal fashion search with AI-generated style notes — upload an image or describe what you want, get back visually and semantically similar products, each with a personalized explanation of why it matches.

---

## What We're Solving

Traditional e-commerce search relies on exact keyword matching, but that's not how shoppers actually think or shop:

- They think in **images** — "find me something like this" — not just keywords.
- They describe things **vaguely** — "relaxed linen shirt, neutral tones" — language that keyword search handles poorly.
- Once they find a product, they have **no idea why it was recommended** — recommendations feel like a black box.

Our goal: accept either an **image or a text description** as a search query, retrieve visually and semantically similar products from the catalog, and generate a short, **grounded, personalized style note** for each result explaining the match.

---

## How We Are Doing This

We treat this as a three-part problem — **encode → retrieve → explain** — built as four sequential stages:

1. **Embed** — Turn both the product catalog and user queries (image or text) into vectors in one shared space, using CLIP.
2. **Retrieve** — Search that space with a hybrid of dense (vector similarity) and sparse (keyword) search, merged into one ranked candidate list.
3. **Refine** — Apply hard filters (price, size, category) and, if needed, re-rank the shortlist with a more precise model.
4. **Explain** — Attach real product attributes to the final results and have an LLM generate a short, fact-grounded style note per product.

Each stage hands off a clean, well-defined output to the next, so the pipeline can be built and tested one piece at a time rather than all at once.

---

## Key Features

- **Dual-input search** — query by uploading a photo, typing a description, or both.
- **Hybrid retrieval** — combines semantic/visual similarity (dense) with exact keyword matching (sparse) so neither vague queries nor specific terms get lost.
- **Grounded AI explanations** — style notes are generated only from verified product attributes, not invented by the LLM.
- **Filterable results** — price, size, and category constraints applied as hard rules, never overridden by similarity.
- **Optional precision re-ranking** — a cross-encoder step available for cases where broad retrieval alone isn't precise enough.

---

## Architecture

```
User Input (image and/or text)
            ↓
      CLIP Embedding
   (shared vector space)
            ↓
   ┌────────────────────┐
   │   Hybrid Search     │
   │  Dense (HNSW)  +    │
   │  Sparse (BM25)      │
   │  → merge & blend    │
   └────────────────────┘
            ↓
      Apply Filters
   (price, size, category)
            ↓
   Re-rank (optional)
   (cross-encoder)
            ↓
      Final Top 10
            ↓
   Attach Metadata
  (color, material, fit)
            ↓
   LLM Style Note Generation
   (one batched call, grounded)
            ↓
   Results + Style Notes → User
```

**Design principle:** every stage only ever passes a `product_id` forward. Full product records (image, price, metadata) are looked up once, right before they're needed — never carried in full through every intermediate step.

---

## Intelligence System

| Component | Role | Why it works this way |
|---|---|---|
| **CLIP** (image + text encoder) | Converts both catalog items and queries into one shared embedding space | Contrastively pretrained on (image, caption) pairs — a photo and a matching sentence land close together, enabling cross-modal search with a single index |
| **HNSW (dense search)** | Fast approximate nearest-neighbor search over CLIP vectors | Captures semantic/visual similarity even with zero word overlap between query and product |
| **BM25 (sparse search)** | Keyword search over an inverted index | Catches exact terms (fabric, size) that dense similarity can blur |
| **Cross-encoder (re-ranking)** | Scores query + product together, not separately | Catches nuance bi-encoders miss (e.g., a word describing a minor detail vs. the main feature) — used only on a small shortlist since it can't be precomputed |
| **LLM (style notes)** | Generates a short explanation per product | Constrained to only use structured, verified product attributes — prevents hallucinated details |

---

## System Workflow

1. User submits a query (image, text, or both).
2. Query is embedded via CLIP into the shared vector space.
3. Dense and sparse search run in parallel, returning ~100 candidates each.
4. Results are merged via a normalized, weighted score blend → ~100–150 candidates.
5. Hard filters (price, size, category) narrow the list.
6. Optional re-ranking sharpens the final ordering.
7. Final top 10 products are selected.
8. Structured metadata (material, color, fit, occasion) is attached to each.
9. A single batched LLM call generates a personalized style note per product.
10. Notes are merged back into the results by `product_id` and returned to the user.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Embeddings | CLIP / OpenCLIP (`ViT-B-32`) |
| Dense search | PostgreSQL + pgvector (HNSW index) |
| Sparse search | Postgres full-text search (`ts_rank`) or `rank_bm25` |
| Re-ranking | Cross-encoder (sentence-transformers) or LLM listwise scorer |
| Style note generation | LLM API, batched structured (JSON) calls |
| Database | PostgreSQL |
| Backend | FastAPI |
| Frontend | React |

---

## Platform Choice

- **Kaggle Notebooks** — used for GPU-heavy CLIP embedding generation (free GPU access, dataset already hosted there).
- **PostgreSQL + pgvector** — chosen over a dedicated vector database (Pinecone, Weaviate) to keep infrastructure simple for a project of this scale, while still supporting production-grade ANN search via HNSW.
  - **Local development:** Docker (`pgvector/pgvector` image)
  - **Hosted:** Supabase or Neon (free tier, pgvector supported natively)
- **GitHub** — single shared repository for all code; Kaggle is used only for compute, not as the source of truth. Large data artifacts (embeddings, datasets) are excluded from git and shared via Drive or a private Kaggle Dataset instead.

---

## Development Plan

Built in four sequential, independently testable parts:

| Part | Focus | Deliverable |
|---|---|---|
| **1. Data & Database** | Clean and subset the dataset, verify images, finalize schema, set up Postgres + pgvector | Cleaned catalog + working database with indexes ready |
| **2. Embedding & Retrieval** | Generate CLIP embeddings, implement dense + sparse search and blending | A function that returns ranked candidates for any query |
| **3. Refinement** | Apply filters, evaluate and (if needed) implement re-ranking | Precise final top-10 selection |
| **4. Generation & Delivery** | Attach metadata, batch the LLM call, wire up the frontend | End-to-end working app: query in, ranked results with style notes out |

**One-week build target:** a fully working backend pipeline callable end-to-end — not yet a deployed app — that takes a query and returns real top-10 results with grounded style notes, running against the actual dataset.

---

## Uniqueness

- **Cross-modal by design, not bolted on** — image and text queries search the exact same index because both are embedded into one shared space from the start, rather than running two separate search systems.
- **Explanations are grounded, not generated freely** — style notes are constrained to real, verified product attributes, directly addressing the common failure mode of AI recommendations that sound plausible but are factually wrong.
- **Precision tools are added by evidence, not by default** — re-ranking is only built out if testing shows retrieval alone produces a specific, identifiable failure pattern, keeping the system as simple as it can be while still being accurate.
- **Every design decision traces back to a concrete tradeoff** — dense vs. sparse, bi-encoder vs. cross-encoder, filter vs. re-rank — rather than stacking every possible ML technique for its own sake.

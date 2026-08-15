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

1. **Embed** — Turn both the product catalog and user queries (image or text) into vectors in one shared space, using FashionCLIP.
2. **Retrieve** — Search that space with dense (vector similarity) and sparse (keyword) search running in parallel.
3. **Refine** — Apply hard filters (price, size, category) and, if needed, re-rank the shortlist with a more precise model.
4. **Explain** — Attach real product attributes to the final results and have an LLM generate a short, fact-grounded style note per product.

Each stage hands off a clean, well-defined output to the next, so the pipeline can be built and tested one piece at a time rather than all at once.

---

## Key Features

- **Dual-input search** — query by uploading a photo, typing a description, or both.
- **Parallel dense + sparse retrieval** — semantic/visual similarity (dense) and exact keyword matching (sparse) run side by side so neither vague queries nor specific terms get lost.
- **Grounded AI explanations** — style notes are generated only from verified product attributes, not invented by the LLM.
- **Filterable results** — price, size, and category constraints applied as hard rules, never overridden by similarity.
- **Optional precision re-ranking** — a cross-encoder step available for cases where broad retrieval alone isn't precise enough.

---

## Architecture

```
User Input (image and/or text)
            ↓
   FashionCLIP Embedding
   (shared vector space)
            ↓
   ┌────────────────────┐
   │  Dense (Qdrant ANN) │
   │         +           │
   │  Sparse (BM25)      │
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
| **FashionCLIP** (image + text encoder) | Converts both catalog items and queries into one shared embedding space | CLIP fine-tuned specifically on fashion image-text pairs — captures fashion-specific attributes (fit, fabric, silhouette) more precisely than generic CLIP |
| **Qdrant (dense search)** | Fast approximate nearest-neighbor search over FashionCLIP vectors | Purpose-built vector database with HNSW indexing — captures semantic/visual similarity even with zero word overlap between query and product |
| **BM25 (sparse search)** | Keyword search over an inverted index | Catches exact terms (fabric, size) that dense similarity can blur |
| **Cross-encoder (re-ranking)** | Scores query + product together, not separately | Catches nuance bi-encoders miss (e.g., a word describing a minor detail vs. the main feature) — used only on a small shortlist since it can't be precomputed |
| **LLM (style notes)** | Generates a short explanation per product | Constrained to only use structured, verified product attributes — prevents hallucinated details |

---

## System Workflow

1. User submits a query (image, text, or both).
2. Query is embedded via FashionCLIP into the shared vector space.
3. Dense (Qdrant) and sparse (BM25) search run in parallel, each returning a ranked candidate list.
4. Hard filters (price, size, category) narrow the combined candidate pool.
5. Optional re-ranking sharpens the final ordering.
6. Final top 10 products are selected.
7. Structured metadata (material, color, fit, occasion) is attached to each.
8. A single batched LLM call generates a personalized style note per product.
9. Notes are merged back into the results by `product_id` and returned to the user.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Embeddings | FashionCLIP |
| Dense search | Qdrant (HNSW index) |
| Sparse search | `rank_bm25` (or Qdrant's built-in sparse vector support) |
| Re-ranking | Cross-encoder (sentence-transformers) or LLM listwise scorer |
| Style note generation | LLM API, batched structured (JSON) calls |
| Database | PostgreSQL (structured metadata) + Qdrant (vectors) |
| Backend | FastAPI |
| Frontend | React |

---

## Platform Choice

- **Kaggle Notebooks** — used for GPU-heavy FashionCLIP embedding generation (free GPU access, dataset already hosted there).
- **Qdrant** — chosen as a dedicated, purpose-built vector database for dense search: native HNSW indexing, filtering, and (optionally) sparse vector support in one system, without needing to bolt vector search onto a general-purpose relational database.
  - **Local development:** Docker (`qdrant/qdrant` image)
  - **Hosted:** Qdrant Cloud (free tier)
- **PostgreSQL** — retained for structured product metadata (title, price, category, color, material) that gets attached to results and fed to the LLM.
- **GitHub** — single shared repository for all code; Kaggle is used only for compute, not as the source of truth. Large data artifacts (embeddings, datasets) are excluded from git and shared via Drive or a private Kaggle Dataset instead.

---

## Development Plan

Built in four sequential, independently testable parts:

| Part | Focus | Deliverable |
|---|---|---|
| **1. Data & Database** | Clean and subset the dataset, verify images, finalize schema, set up Postgres (metadata) + Qdrant (vectors) | Cleaned catalog + working database/vector store with indexes ready |
| **2. Embedding & Retrieval** | Generate FashionCLIP embeddings, implement dense (Qdrant) + sparse (BM25) search | A function that returns ranked candidates for any query |
| **3. Refinement** | Apply filters, evaluate and (if needed) implement re-ranking | Precise final top-10 selection |
| **4. Generation & Delivery** | Attach metadata, batch the LLM call, wire up the frontend | End-to-end working app: query in, ranked results with style notes out |

**One-week build target:** a fully working backend pipeline callable end-to-end — not yet a deployed app — that takes a query and returns real top-10 results with grounded style notes, running against the actual dataset.

---

## Uniqueness

- **Cross-modal by design, not bolted on** — image and text queries search the exact same index because both are embedded into one shared space from the start, rather than running two separate search systems.
- **Domain-tuned embeddings** — FashionCLIP, not generic CLIP, so fashion-specific detail (fit, fabric, silhouette) is captured more precisely rather than relying on general-purpose image-text alignment.
- **Explanations are grounded, not generated freely** — style notes are constrained to real, verified product attributes, directly addressing the common failure mode of AI recommendations that sound plausible but are factually wrong.
- **Precision tools are added by evidence, not by default** — re-ranking is only built out if testing shows retrieval alone produces a specific, identifiable failure pattern, keeping the system as simple as it can be while still being accurate.
- **Every design decision traces back to a concrete tradeoff** — dense vs. sparse, bi-encoder vs. cross-encoder, filter vs. re-rank — rather than stacking every possible ML technique for its own sake.

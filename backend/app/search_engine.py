import sys
import torch
import open_clip
from PIL import Image
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models
from sentence_transformers import CrossEncoder

class SearchEngine:
    def __init__(self, qurl: str, api: Optional[str] = None):
     
  
        try:
            self.client = QdrantClient(url=qurl, api_key=api)
        except Exception:
            sys.exit("Error connecting to database")

       
        try:
            collections_response = self.client.get_collections()
            if collections_response.collections:
                self.collection_name = collections_response.collections[0].name
                print(f"Connected to Qdrant. Automatically using active collection: '{self.collection_name}'")
            else:
                sys.exit("Error: No active collections found on this Qdrant server instance.")
        except Exception as e:
            sys.exit(f"Error fetching collection lists: {e}")
        
       
        print("Configuring Marqo Fashion-CLIP encoding layers...")
        self.M = "hf-hub:Marqo/marqo-fashionCLIP"
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(self.M)
        self.tokenizer = open_clip.get_tokenizer(self.M)
        self.model.eval()
        
        print("Preloading cross-encoder ranking optimization architectures...")
        self.cross_encoder_model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

    def generate_query_embedding(self, text: Optional[str] = None, image: Optional[Image.Image] = None) -> List[float]:
    
        feature_t = None
        feature_i = None 

        with torch.no_grad():
            if text: 
                tokens = self.tokenizer([text])
                feature_t = self.model.encode_text(tokens)
                feature_t /= feature_t.norm(dim=-1, keepdim=True)
            if image:
                tensor = self.preprocess(image).unsqueeze(0)
                feature_i = self.model.encode_image(tensor)  # Fixed typo: was model.encode_text(tensor)
                feature_i /= feature_i.norm(dim=-1, keepdim=True)
                
            if feature_t is not None and feature_i is not None:
                blend = feature_t + feature_i
                blend /= blend.norm(dim=-1, keepdim=True)
                return blend.squeeze(0).tolist()
            elif feature_t is not None:
                return feature_t.squeeze(0).tolist()
            elif feature_i is not None:
                return feature_i.squeeze(0).tolist()
            else:
                raise ValueError("You must provide at least a text query or an image query!")

    def _build_qdrant_filters(self, dic: Optional[Dict[str, Any]] = None) -> Optional[models.Filter]:
    
        if not dic:
            return None
            
        must_clauses = []
        fields = [
            "brand_name", "gender", "master_category", "sub_category", 
            "article_type", "base_colour", "season", "usage", "year",
            "pattern", "fabric", "sleeve_length", "occasion", "fit", "neck", "length"
        ]

       
        for field in fields:
            if field in dic and dic[field] is not None: 
                val = dic[field]
                if isinstance(val, list):
                    must_clauses.append(
                        models.FieldCondition(
                            key=field,
                            match=models.MatchAny(any=val)
                        )
                    )
                else: 
                    must_clauses.append(
                        models.FieldCondition(
                            key=field,
                            match=models.MatchValue(value=val)
                        )
                    )

        if "min_price" in dic and dic["min_price"] is not None:
            must_clauses.append(
                models.FieldCondition(
                    key="discounted_price",
                    range=models.Range(gte=float(dic["min_price"]))
                )
            )
    
        if "max_price" in dic and dic["max_price"] is not None:
            must_clauses.append(
                models.FieldCondition(
                    key="discounted_price",
                    range=models.Range(lte=float(dic["max_price"]))
                )
            )

        return models.Filter(must=must_clauses) if must_clauses else None
    
    def hybrid_search(
        self, 
        dense_vector: List[float], 
        text_query: Optional[str] = None,
        hard_filters: Optional[models.Filter] = None,
        limit_can: int = 50
    ) -> List[Any]:
      
        hnsw = models.Prefetch(
            query=dense_vector,
            using="dense",
            filter=hard_filters,
            limit=limit_can
        )
        
        bm25 = models.Prefetch(
            query=models.Document(
                text=text_query,
                model="Qdrant/bm25"
            ),
            using="sparse",
            filter=hard_filters,
            limit=limit_can
        )
        
        response = self.client.query_points(
            collection_name=self.collection_name,
            prefetch=[hnsw, bm25],
            query=models.FusionQuery(fusion=models.Fusion.RRF), 
            query_filter=hard_filters,
            limit=limit_can,
            with_payload=True
        )
        return response.points
       
    def execute_retrieval(
        self, 
        dense_vector: List[float], 
        text_query: Optional[str] = None,
        filter_dict: Optional[Dict[str, Any]] = None,
        limit_candidates: int = 50
    ) -> List[Any]:
       
        hard_filters = self._build_qdrant_filters(filter_dict)
        
        if text_query:
            return self.hybrid_search(
                dense_vector=dense_vector, 
                text_query=text_query,
                hard_filters=hard_filters,
                limit_can=limit_candidates
            )
        else:
            response = self.client.query_points(
                collection_name=self.collection_name,
                query=dense_vector,
                using="dense",
                query_filter=hard_filters,
                limit=limit_candidates,
                with_payload=True
            )
            return response.points
            
    def precision_rerank(self, query_text: Optional[str] = None, items_found: Optional[List[Any]] = None) -> List[int]:
       
        if not query_text or not items_found:
            return [int(i.id) for i in items_found] if items_found else []

        pairs = []
        valid_pids = []
        
        for i in items_found:
            payload = i.payload or {}
            title = payload.get("product_display_name", "")
            desc = payload.get("description", "")
            content = f"{title} {desc}".strip()
            
            if content:
                pairs.append([query_text, content])
                valid_pids.append(int(i.id))
                
        if not pairs:
            return [int(p.id) for p in items_found]
            
        scores = self.cross_encoder_model.predict(pairs)
        reranked_pairs = sorted(zip(valid_pids, scores), key=lambda x: x[1], reverse=True)
        return [pid for pid, score in reranked_pairs]

    def discover_fashion(
        self, 
        text_query: Optional[str] = None, 
        image_query: Optional[Image.Image] = None,
        filters: Optional[Dict[str, Any]] = None,
        apply_rerank: bool = False,
        top_k: int = 10
    ) -> List[int]:
       
        dense_vector = self.generate_query_embedding(text=text_query, image=image_query)

        limit_candidates = 30 if apply_rerank else top_k
        points = self.execute_retrieval(
            dense_vector=dense_vector,
            text_query=text_query,
            filter_dict=filters,
            limit_candidates=limit_candidates
        )

        if apply_rerank and text_query and points:
            final_ordered_ids = self.precision_rerank(query_text=text_query, items_found=points)
        else:
            final_ordered_ids = [int(p.id) for p in points]

        return final_ordered_ids[:top_k]

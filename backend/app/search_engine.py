from typing import List, Dict, Any, Optional
import open_clip
import torch
from PIL import Image
from qdrant_client import QdrantClient
from qdrant_client.http import models



class SearchEngine:
    def __init__(self, qurl: str, api: Optional[str] = None):
        if qurl == ":memory:":
            self.client = QdrantClient(location=":memory:")
            self.collection_name = "catalog"
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(size=512,distance=models.Distance.COSINE)
            )
        else:
            self.client = QdrantClient(url=qurl, api_key=api)
            self.collection_name = "catalog"
            
        self.MODEL = "hf-hub:Marqo/marqo-fashionCLIP"
    
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            self.MODEL, precision='fp32'
        )
        self.tokenizer = open_clip.get_tokenizer(self.MODEL)
        self.model.eval()

    
    def generate_emd(self, t: Optional[str] = None, i: Optional[Image.Image] = None):
        text = None
        img = None
        
        with torch.no_grad():
            if t:
                tokens = self.tokenizer([t])
                text = self.model.encode_text(tokens)  # Fixed: encode_text instead of encode
                text /= text.norm(dim=-1, keepdim=True)
                
            if i:
                imgTensor = self.preprocess(i).unsqueeze(0)
                img = self.model.encode_image(imgTensor)
                img /= img.norm(dim=-1, keepdim=True)
                
            if text is not None and img is not None:
                b = text + img
                b /= b.norm(dim=-1, keepdim=True)
                return b.squeeze(0).tolist()
                
            elif text is not None:
                return text.squeeze(0).tolist()
                
            elif img is not None:
                return img.squeeze(0).tolist()
                
            else:
                raise ValueError("Provide at least a text query or an image query!")
    def retrieval(self, dense: List[float], filters: Optional[Dict[str, Any]] = None, no_res: int = 50) -> List[Any]:
        response = self.client.query_points(collection_name=self.collection_name,
                                            query=dense,
                                            limit=no_res,
                                            with_payload=True)
        
        return response.points
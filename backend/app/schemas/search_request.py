from pydantic import BaseModel
from typing import Optional, Dict, Any

class SearchRequest(BaseModel):
    query_text: Optional[str] = None
    image_base64: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None
    apply_rerank: bool = False
    top_k: int = 10
import open_clip
import torch
from PIL import Image
from qdrant_client import QdrantClient
from qdrant_client.http import models

class SearchEngine :
    def __init__(self, url:str, api: Optional[str] = None):
        self.client = QdrantClient(url=url, api_key=api)
        self.collection_name = "catalog"
        self.MODEL = "hf-hub:Marqo/marqo-fashionCLIP"
        self.model, _, self.processor = open_clip.create_model_and_transforms(self.MODEL, precision='fp32')
        self.tokenizer = open_clip.get_tokenizer(self.MODEL)
        self.model.eval()
        
    def generate_emd(self, text: Optional[str]=None, image:Optional[Image.Image]= None):
        text = None
        img = None
        with torch.no_grad() :
            if text is not None :
                tokens = self.tokenizer([text])
                text = self.model.encode(tokens)
                text /= text.norm(dim=-1, keepdim=True)
                
            if image is not None:
                imgTensor = self.preprocess(image).unsqueeze(0)
                img = self.model.encode_image(imgTensor)
                img /= img.norm(dim=-1, keepdim=True)
                
            
        if text is not None and image is not None :
            b = text + img
            b /= b.norm(dim=-1, keepdim=True)
            return b.squeeze(0).toList()
        
        elif text is not None:
           return text.squeeze(0).tolist()
            
       
        elif image is not None:
            return image.squeeze(0).tolist()
            
        else:
            raise ValueError("Provide at least a text query or an image query!")
        
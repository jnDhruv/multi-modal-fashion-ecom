from fastapi import FastAPI
from app.dependencies import get_search_engine
from app.routers import search

app = FastAPI()

@app.on_event("startup")
def warm_up():
    get_search_engine()

app.include_router(search.router)
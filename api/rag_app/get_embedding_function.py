
from langchain.embeddings import CacheBackedEmbeddings
from langchain.storage import LocalFileStore
from langchain_openai import OpenAIEmbeddings
from config import OPENROUTER_API_KEY

def get_openai_embeddings():
    underlying_embeddings = OpenAIEmbeddings(api_key=OPENROUTER_API_KEY)
    store = LocalFileStore("./data/cache/")
    cached_embedder = CacheBackedEmbeddings.from_bytes_store(
        underlying_embeddings, store, namespace=underlying_embeddings.model
    )
    return cached_embedder

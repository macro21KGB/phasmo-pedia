
from langchain.embeddings import CacheBackedEmbeddings
from langchain.storage import LocalFileStore
from langchain_google_genai import GoogleGenerativeAIEmbeddings

def get_openai_embeddings():
    underlying_embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
    store = LocalFileStore("./data/cache/")
    cached_embedder = CacheBackedEmbeddings.from_bytes_store(
        underlying_embeddings, store, namespace=underlying_embeddings.model
    )
    return cached_embedder

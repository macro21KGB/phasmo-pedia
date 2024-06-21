
from langchain_openai import OpenAIEmbeddings
from config import OPENAI_API_KEY

def get_openai_embeddings() -> OpenAIEmbeddings:
    embeddings = OpenAIEmbeddings(api_key=OPENAI_API_KEY)
    return embeddings

from langchain_community.vectorstores import Chroma
from get_embedding_function import get_openai_embeddings
from config import CHROMA_PATH

def get_chroma_client() -> Chroma:
  chroma_client = Chroma(persist_directory=CHROMA_PATH, embedding_function=get_openai_embeddings())
  return chroma_client
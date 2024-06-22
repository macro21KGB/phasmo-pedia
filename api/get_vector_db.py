from langchain_community.vectorstores import Chroma
from get_embedding_function import get_openai_embeddings
from config import CHROMA_PATH

CHROMA_DB_INSTANCE = None # Reference to singleton instance of ChromaDB

def get_chroma_client() -> Chroma:
  global CHROMA_DB_INSTANCE
  if not CHROMA_DB_INSTANCE:
    CHROMA_DB_INSTANCE = Chroma(
      persist_directory=CHROMA_PATH,
      embedding_function=get_openai_embeddings(),
    )
    print(f"Init ChromaDB {CHROMA_DB_INSTANCE} from {CHROMA_PATH}")

  return CHROMA_DB_INSTANCE
from langchain_openai import ChatOpenAI
from config import OPENROUTER_API_KEY

OPENAI_LLM_INSTANCE = None # Reference to singleton instance of OpenAI LLM

def get_openai_llm() -> ChatOpenAI:
  global OPENAI_LLM_INSTANCE
  if not OPENAI_LLM_INSTANCE:
    OPENAI_LLM_INSTANCE = ChatOpenAI(api_key=OPENROUTER_API_KEY, base_url="https://openrouter.ai/api/v1", model="google/gemini-2.0-flash-001")
    print(f"Init OpenAI LLM {OPENAI_LLM_INSTANCE}")

  return OPENAI_LLM_INSTANCE

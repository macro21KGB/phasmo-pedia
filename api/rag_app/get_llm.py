from langchain_openai import ChatOpenAI
from config import OPENROUTER_API_KEY

OPENAI_LLM_INSTANCE = None # Reference to singleton instance of OpenAI LLM

def get_openai_llm() -> ChatOpenAI:
  global OPENAI_LLM_INSTANCE
  if not OPENAI_LLM_INSTANCE:
    print("LOADING MODEL")
    print(OPENROUTER_API_KEY)
    OPENAI_LLM_INSTANCE = ChatOpenAI(openai_proxy="https://openrouter.ai/api/v1", model="openai/4o-mini")
    print(f"Init OpenAI LLM {OPENAI_LLM_INSTANCE}")

  return OPENAI_LLM_INSTANCE

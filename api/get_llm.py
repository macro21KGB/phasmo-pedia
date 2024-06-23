from langchain_openai import ChatOpenAI
from config import OPENAI_API_KEY

OPENAI_LLM_INSTANCE = None # Reference to singleton instance of OpenAI LLM

def get_openai_llm() -> ChatOpenAI:
  global OPENAI_LLM_INSTANCE
  if not OPENAI_LLM_INSTANCE:
    OPENAI_LLM_INSTANCE = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model="gpt-3.5-turbo-0125")
    print(f"Init OpenAI LLM {OPENAI_LLM_INSTANCE}")
  return OPENAI_LLM_INSTANCE
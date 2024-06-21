from langchain_openai import ChatOpenAI
from config import OPENAI_API_KEY

def get_openai_llm() -> ChatOpenAI:
  llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model="gpt-3.5-turbo-0125")
  return llm
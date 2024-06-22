import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
LANGCHAIN_API_KEY= os.getenv("LANGCHAIN_API_KEY")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")

if not OPENAI_API_KEY:
  raise Exception("PLEASE PROVIDE OPENAI API KEY")

if not COHERE_API_KEY:
  raise Exception("PLEASE PROVIDE COHERE API KEY")

CHROMA_PATH = "./data/chroma"
SITEMAP_PATH = "./data/sitemap/phasmophobia_wiki.xml"

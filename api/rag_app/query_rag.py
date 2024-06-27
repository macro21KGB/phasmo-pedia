import os
import argparse
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
from langchain.retrievers.contextual_compression import ContextualCompressionRetriever
from langchain_cohere import CohereRerank
from rag_app.get_vector_db import get_chroma_client
from rag_app.get_llm import get_openai_llm
from config import LANGCHAIN_API_KEY, COHERE_API_KEY
from dataclasses import dataclass
from typing import List


if LANGCHAIN_API_KEY:
  os.environ["LANGCHAIN_TRACING_V2"] = "true"
  os.environ["LANGCHAIN_API_KEY"] = LANGCHAIN_API_KEY


PROMPT_TEMPLATE = """
You are an assistant for question-answering tasks related to Phasmophobia.
Create a spooky atmosphere in your response and generate a comprehensive \
and informative answer of 80 words or less for the given question based solely on the provided context.
If you don't know the answer, just say, 'Hmm, I'm not sure.'
Answer the question based only on the following context:
{context}

Question: {question}
"""


@dataclass
class QueryResponse:
  query_text: str
  response_text: str
  sources: List[str]


def main():
  # Create CLI.
  parser = argparse.ArgumentParser()
  parser.add_argument("query_text", type=str, help="The query text.")
  args = parser.parse_args()
  query_text = args.query_text
  query_rag(query_text)


# Retrieve docs from our vector db and perform rerank
def retrieve_docs(query_text: str):
  db = get_chroma_client()
  retriever = db.as_retriever(search_kwargs={"k": 20})

  # Using Cohere to rerank the documents
  compressor = CohereRerank(cohere_api_key=COHERE_API_KEY, top_n=3)
  compression_retriever = ContextualCompressionRetriever(
      base_compressor=compressor, base_retriever=retriever
  )
  return compression_retriever.invoke(query_text)


def extract_sources(results: List[Document]) -> list[str]:
  sources = [doc.metadata.get("id", None) for doc in results]
  cleaned_sources = list(set([
    id.rsplit(':', 1)[0] if id else None for id in sources
  ]))
  cleaned_sources = list(filter(None, cleaned_sources))
  return cleaned_sources

def query_rag(query_text: str) -> QueryResponse:
  # Retrieve and format the documents
  results = retrieve_docs(query_text)
  context_text = "\n\n".join(doc.page_content for doc in results)
  sources = extract_sources(results)

  # Create a chat promt template
  prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
  prompt = prompt_template.format(context=context_text, question=query_text)
  print(prompt)

  # Init the model and invoke it with the prompt
  llm = get_openai_llm()
  response = llm.invoke(prompt)
  response_text = response.content
  formatted_response = f"\n\nResponse: {response_text}\nSources: {sources}"
  print(formatted_response)

  return QueryResponse(
    query_text=query_text, response_text=response_text, sources=sources
  )


if __name__ == "__main__":
    main()
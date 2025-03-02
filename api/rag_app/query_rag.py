import os
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel
from langchain_core.runnables import RunnablePassthrough
from langchain.retrievers.contextual_compression import ContextualCompressionRetriever
from langchain_cohere import CohereRerank
from rag_app.get_vector_db import get_chroma_client
from rag_app.get_llm import get_openai_llm
from config import LANGCHAIN_API_KEY, COHERE_API_KEY
from dataclasses import dataclass
from typing import List
import json


if LANGCHAIN_API_KEY:
  os.environ["LANGCHAIN_TRACING_V2"] = "true"
  os.environ["LANGCHAIN_API_KEY"] = LANGCHAIN_API_KEY


PROMPT_TEMPLATE = """
You are an assistant for question-answering tasks related to Phasmophobia.
Create a spooky atmosphere in your response and generate a comprehensive \
and informative answer of 80 words or less for the given question based solely on the provided context.
If you don't know the answer, just say, "Hmm, I'm not sure."
Answer the question based only on the following context:
{context}

Question: {question}
"""


@dataclass
class QueryResponse:
  query_text: str
  response_text: str
  sources: List[str]


# Retrieve docs from our vector db and perform rerank
def retrieve_docs(query_text: str):
  db = get_chroma_client()
  retriever = db.as_retriever(search_kwargs={"k": 20})

  # Using Cohere to rerank the documents
  compressor = CohereRerank(cohere_api_key=COHERE_API_KEY, top_n=5)
  compression_retriever = ContextualCompressionRetriever(
      base_compressor=compressor, base_retriever=retriever
  )
  return compression_retriever.invoke(query_text)


# Extract sources e.g. https://phasmophobia.fandom.com/wiki/Money
def extract_sources(docs):
  sources = [doc.metadata.get("id", None) for doc in docs]
  cleaned_sources = list(set([
    id.rsplit(":", 1)[0] if id else None for id in sources
  ]))
  cleaned_sources = list(filter(None, cleaned_sources))
  return cleaned_sources


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


def query_rag(query_text: str) -> QueryResponse:
  # Retrieve and format the documents
  docs = retrieve_docs(query_text)
  context_text = format_docs(docs)
  sources = extract_sources(docs)

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


async def query_rag_stream(query_text: str):
  # Retriever with Cohere to rerank documents
  db = get_chroma_client()
  retriever = db.as_retriever(search_kwargs={"k": 20})
  compressor = CohereRerank(cohere_api_key=COHERE_API_KEY, top_n=3)
  compression_retriever = ContextualCompressionRetriever(
      base_compressor=compressor, base_retriever=retriever
  )

  prompt = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
  llm = get_openai_llm()
  llm.streaming = True

  rag_chain_from_docs = (
    RunnablePassthrough.assign(context=(lambda x: format_docs(x["context"])))
    | prompt
    | llm
    | StrOutputParser()
  )

  rag_chain_with_source = RunnableParallel(
      {"context": compression_retriever, "question": RunnablePassthrough()}
  ).assign(answer=rag_chain_from_docs)

  async for chunk in rag_chain_with_source.astream(query_text):
    if "context" in chunk:
      sources = list({doc.metadata["source"] for doc in chunk["context"]})
      yield json.dumps({"sources": sources}) + "\n"
    elif "answer" in chunk:
      yield json.dumps({"answer": chunk["answer"]}) + "\n"

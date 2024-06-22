import os
import argparse
from langchain_core.prompts import ChatPromptTemplate
from langchain.retrievers.contextual_compression import ContextualCompressionRetriever
from langchain_cohere import CohereRerank
from get_vectostore import get_chroma_client
from get_llm import get_openai_llm
from config import LANGCHAIN_API_KEY, COHERE_API_KEY

if LANGCHAIN_API_KEY:
  os.environ["LANGCHAIN_TRACING_V2"] = "true"
  os.environ["LANGCHAIN_API_KEY"] = LANGCHAIN_API_KEY

PROMPT_TEMPLATE = """
You are an assistant for question-answering tasks related to Phasmophobia.
Create a spooky atmosphere in your response and generate a comprehensive \
and informative answer of 80 words or less for the given question based solely on the provided context.
If you don't know the answer, just say, 'Hmm, I'm not sure.'
Anything between the following `context` html blocks is retrieved from a knowledge bank

<context>
{context}
<context/>
"""


def main():
  # Create CLI.
  parser = argparse.ArgumentParser()
  parser.add_argument("query_text", type=str, help="The query text.")
  args = parser.parse_args()
  query_text = args.query_text
  answer = query_rag(query_text)


def query_rag(query_text: str):
  db = get_chroma_client()
  retriever = db.as_retriever(search_kwargs={"k": 20})

  prompt = ChatPromptTemplate.from_messages(
      [
          ("system", PROMPT_TEMPLATE),
          ("human", "{question}"),
      ]
  )

  # Using Cohere to rerank the documents
  compressor = CohereRerank(cohere_api_key=COHERE_API_KEY, top_n=3)
  compression_retriever = ContextualCompressionRetriever(
      base_compressor=compressor, base_retriever=retriever
  )
  results = compression_retriever.invoke(query_text)

  # Format the retrieved documents and prepare chat promt template
  context_text = "\n\n".join(doc.page_content for doc in results)
  sources = [doc.metadata.get("id", None) for doc in results]
  prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
  prompt = prompt_template.format(context=context_text, question=query_text)

  # Prepare our model and invoke it with our prompt
  llm = get_openai_llm()
  response_text = llm.invoke(prompt)
  formatted_response = f"Response: {response_text.content}\nSources: {sources}"
  print(formatted_response)

  return response_text


if __name__ == "__main__":
    main()
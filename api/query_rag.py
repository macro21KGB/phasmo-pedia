import os
import argparse
from langchain_core.documents import Document
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


def prettify_docs(docs: list[Document]) -> str:
    prettify = f"\n{'-' * 100}\n".join(
      [f"source: {d.metadata.get('id', None)}\n\n" + d.page_content for d in docs]
    )
    return prettify

def query_rag(query_text: str):
    db = get_chroma_client()
    retriever = db.as_retriever(search_kwargs={"k": 20})
    llm = get_openai_llm()

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
    compressed_docs = compression_retriever.invoke(query_text)

    context_text = prettify_docs(compressed_docs)
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text, question=query_text)
    print(prompt)


if __name__ == "__main__":
    main()
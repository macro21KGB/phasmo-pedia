import os
import argparse
from langchain import hub
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from get_vectostore import get_chroma_client
from get_llm import get_openai_llm
from config import LANGCHAIN_API_KEY
from langchain_core.prompts import ChatPromptTemplate

if LANGCHAIN_API_KEY:
  os.environ["LANGCHAIN_TRACING_V2"] = "true"
  os.environ["LANGCHAIN_API_KEY"] = LANGCHAIN_API_KEY

PROMPT_TEMPLATE = """
You are an assistant for question-answering tasks related to Phasmophobia.
Create a spooky atmosphere in your response and generate a comprehensive \
and informative answer of 80 words or less for the given question based solely on the provided.
If you don't know the answer, just say, 'Hmm, I'm not sure.'
Anything between the following `context`  html blocks is retrieved from a knowledge bank

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
    print(f"Question: {query_text}\n\nAnswer: {answer}")


def query_rag(query_text: str):
    db = get_chroma_client()
    retriever = db.as_retriever()
    llm = get_openai_llm()

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", PROMPT_TEMPLATE),
            ("human", "{question}"),
        ]
    )

    def format_docs(docs):
      return "\n\n".join(doc.page_content for doc in docs)

    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    response_text = rag_chain.invoke(query_text)
    return response_text


if __name__ == "__main__":
    main()
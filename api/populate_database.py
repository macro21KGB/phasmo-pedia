import re
import argparse
import os
import shutil
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema.document import Document
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders.sitemap import SitemapLoader
from get_vectostore import get_chroma_client
from bs4 import BeautifulSoup
from config import CHROMA_PATH, SITEMAP_PATH


def main():
    # Reset the database by passing --reset argument
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="Reset the database.")
    args = parser.parse_args()
    if args.reset:
        print("✨ Clearing Database")
        clear_database()

    # Create (or update) the data store.
    documents = load_documents()

    for doc in documents:
        doc.page_content = process_string(doc.page_content)

    chunks = split_documents(documents)
    add_to_chroma(chunks)


def extract_main_content(div_content: BeautifulSoup) -> str:
    content = div_content.find("div", class_="mw-parser-output")
    if not content:
        return ""

    # List of elements to remove
    elements_to_remove = [
        {"name": "div", "attrs": {"class": "toc", "id": "toc", "role": "navigation"}},
        {"name": "div", "attrs": {"role": "navigation", "class": "navbox"}},
    ]

    for element in elements_to_remove:
        el = content.find(element["name"], attrs=element["attrs"])
        if el:
            el.decompose()

    # Find the specific <div> and remove the subsequent table
    references_wrap = content.find("div", class_="mw-references-wrap")
    if references_wrap:
        next_table = references_wrap.find_next("table")
        if next_table:
            next_table.decompose()

    # Return the text content of the cleaned main element
    return content.get_text()


def load_documents():
    document_loader = SitemapLoader(web_path=SITEMAP_PATH, is_local=True, parsing_function=extract_main_content)
    document_loader.requests_per_second = 2
    # Optional: avoid `[SSL: CERTIFICATE_VERIFY_FAILED]` issue
    document_loader.requests_kwargs = {"verify": False}
    return document_loader.load()


def process_string(input_string: str):
    # Remove URLs
    processed_string = re.sub(r'http\S+', '', input_string)
    # Remove all occurrences of square brackets and their contents
    processed_string = re.sub(r'\[.*?\]', '', processed_string)
    # Remove text before []
    processed_string = re.sub(r'\b\w+\[\]', '', processed_string)
    # Replace newlines, tabs, and multiple spaces with a single space
    processed_string = re.sub(r'[\n\t ]+', ' ', processed_string)
    processed_string = processed_string.strip()
    return processed_string


def split_documents(documents: list[Document]):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=120,
        length_function=len,
        is_separator_regex=False,
    )
    return text_splitter.split_documents(documents)


def add_to_chroma(chunks: list[Document]):
    # Load the existing database.
    db = get_chroma_client()

    # Calculate Page IDs.
    chunks_with_ids = calculate_chunk_ids(chunks)

    # Add or Update the documents.
    existing_items = db.get(include=[])  # IDs are always included by default
    existing_ids = set(existing_items["ids"])
    print(f"Number of existing documents in DB: {len(existing_ids)}")

    # Only add documents that don't exist in the DB.
    new_chunks = []
    for chunk in chunks_with_ids:
        if chunk.metadata["id"] not in existing_ids:
            new_chunks.append(chunk)

    if len(new_chunks):
        print(f"👉 Adding new documents: {len(new_chunks)}")
        new_chunk_ids = [chunk.metadata["id"] for chunk in new_chunks]
        db.add_documents(new_chunks, ids=new_chunk_ids)
    else:
        print("✅ No new documents to add")


def calculate_chunk_ids(chunks: list[Document]):
    # This will create IDs like "https://phasmophobia.fandom.com/wiki/Money:2"
    # Page Source : Chunk Index

    last_page = None
    current_chunk_index = 0

    for chunk in chunks:
        source = chunk.metadata.get("source")
        current_page = source

        if current_page == last_page:
            current_chunk_index += 1
        else:
            current_chunk_index = 0

        # Calculate the chunk ID.
        chunk_id = f"{current_page}:{current_chunk_index}"
        last_page = current_page

        # Add it to the chunk meta-data.
        chunk.metadata["id"] = chunk_id

    return chunks


def clear_database():
    if os.path.exists(CHROMA_PATH):
        shutil.rmtree(CHROMA_PATH)


if __name__ == "__main__":
    main()
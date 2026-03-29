from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from dotenv import load_dotenv
import os

load_dotenv()

DATA_PATH = "data"
DB_PATH = "embeddings"


def ingest_documents():
    # 1. Load the document
    loader = TextLoader(os.path.join(DATA_PATH, "sample.txt"))
    documents = loader.load()

    # 2. Split into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_documents(documents)
    # 3. Create embeddings
    embeddings = SentenceTransformerEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )


    # 4. Store embeddings in Chroma DB
    db = Chroma.from_documents(
        chunks,
        embeddings,
        persist_directory=DB_PATH
    )

    db.persist()
    print("✅ Documents ingested successfully!")


if __name__ == "__main__":
    ingest_documents()

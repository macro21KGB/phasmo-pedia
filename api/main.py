import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from rag_app.query_rag import query_rag, QueryResponse

app = FastAPI()

class SubmitQueryRequest(BaseModel):
    query_text: str

@app.post("/submit_query")
def submit_query_endpoint(request: SubmitQueryRequest) -> QueryResponse:
  query_response = query_rag(request.query_text)
  return query_response

def main() -> None:
   port = 5656
   print(f"Running the FastAPI server on port: {port}")
   uvicorn.run("main:app", host="localhost", port=port)

if __name__ == "__main__":
   main()
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from rag_app.query_rag import query_rag, query_rag_stream, QueryResponse

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SubmitQueryRequest(BaseModel):
    query_text: str

@app.post("/submit_query")
def submit_query_endpoint(request: SubmitQueryRequest) -> QueryResponse:
  query_response = query_rag(request.query_text)
  return query_response

@app.post("/submit_query_stream")
async def submit_query_stream_endpoint(request: SubmitQueryRequest) -> StreamingResponse:
  return StreamingResponse(query_rag_stream(request.query_text), media_type="text/event-stream")

def main() -> None:
   port = 5656
   print(f"Running the FastAPI server on port: {port}")
   uvicorn.run("main:app", host="localhost", port=port)

if __name__ == "__main__":
   main()
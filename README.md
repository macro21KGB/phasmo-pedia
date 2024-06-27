# phasmo-chat

phasmo-chat is a generative AI project leveraging Retrieval-Augmented Generation (RAG) to answer questions about the game [Phasmophobia](https://store.steampowered.com/app/739630/Phasmophobia/) by Kinetic Games.

## Features

- **Client Interface**: A user-friendly interface, similar to ChatGPT, where users can chat and ask questions about Phasmophobia.
- **Question Answering API**: API that answers questions about Phasmophobia using a Large Language Model (LLM) integrated with RAG for enhanced accuracy and context-aware responses.
- **Retrieval-Augmented Generation (RAG)**: Enhances the response accuracy by retrieving relevant information before generating answers, ensuring that responses are contextually relevant and accurate.

## How It Works

The front end is a ChatGPT-like interface where users can type in questions about Phasmophobia. When a question is submitted, the front end sends a request (POST) to the back end, which processes the query using RAG and returns a generated response to the front end.

## Disclaimer

This is a personal project for learning purposes in generative AI and RAG. This project is not affiliated with Kinetic Games, the creators of Phasmophobia. The information provided by phasmo-chat is sourced from the [Phasmophobia Wiki](https://phasmophobia.fandom.com/wiki/Main_Page).

## Front-end Technologies

- **[React](https://reactjs.org)**: JavaScript library for building user interfaces.
- **[TypeScript](https://www.typescriptlang.org)**: Typed superset of JavaScript that compiles to plain JavaScript.
- **[Vite](https://vitejs.dev)**: Build tool providing a fast and lean development experience.
- **[Axios](https://axios-http.com)**: Promise-based HTTP client for the browser and Node.js.
- **[React Query](https://react-query.tanstack.com)**: Manages fetching, caching, and updating asynchronous data in React.
- **[Material UI](https://mui.com)**: React component library for building user interfaces with pre-built components and styling solutions.

## Back-end Technologies

- **[LangChain](https://langchain.com)**: Framework for developing applications powered by language models.
- **[OpenAI](https://openai.com)**: Provides the language model for generating responses.
- **[FastAPI](https://fastapi.tiangolo.com)**: High-performance web framework for building APIs.
- **[ChromaDB](https://www.trychroma.com/)**: Database for managing and querying embeddings.
- **[Cohere](https://cohere.ai)**: Assists with language understanding and generation.

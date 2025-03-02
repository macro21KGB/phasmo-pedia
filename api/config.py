import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Fetch API keys from environment variables
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
LANGCHAIN_API_KEY = os.getenv("LANGCHAIN_API_KEY")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")

# Define paths
CHROMA_PATH = "./data/chroma"
SITEMAP_PATH = "./data/sitemap/phasmophobia_wiki.xml"

# Check for required API keys and raise detailed exceptions if missing
required_env_vars = {
    "OPENROUTER_API_KEY": OPENROUTER_API_KEY,
    "COHERE_API_KEY": COHERE_API_KEY
}

for var_name, var_value in required_env_vars.items():
    if not var_value:
        raise EnvironmentError(f"Environment variable {var_name} is not set. Please provide {var_name}.")

# Optional: Log the successful loading of configuration for debugging purposes
print("Configuration loaded successfully.")

import os

from openai import OpenAI
from pathlib import Path
from pydantic import ValidationError

# Load keys
gen_key = os.environ.get("GENERATION_API_KEY")
eval_key = os.environ.get("EVALUATION_API_KEY")

# Models
MODEL_GENERATION = "gpt-4o-mini"
MODEL_EVALUATION = "gpt-5.2"

# Two clients
gen_client = OpenAI(api_key=gen_key, timeout=10)
eval_client = OpenAI(api_key=eval_key, timeout=10)


def _run_llm(
        client,
        model: str,
        instructions: str,
        user_input: str,
        response_format: object = None,
        previous_response_id: str = None,
):
    data = {
        "model": model,
        "instructions": instructions,
        "input": user_input,
    }

    if previous_response_id:
        data["previous_response_id"] = previous_response_id

    if response_format:
        for _ in range(2):
            try:
                response = client.responses.parse(
                    **data,
                    text_format=response_format,
                )
                return response.output_parsed, response.id
            except ValidationError:
                continue

        raise Exception("LLM returned invalid JSON twice.")

    response = client.responses.create(**data)
    return response.output_text, response.id


def run_llm_generation(
        instructions: str,
        user_input: str,
        response_format: object = None,
        previous_response_id: str = None,
):
    """Uses GPT-4o-mini with generation key."""
    return _run_llm(
        gen_client,
        MODEL_GENERATION,
        instructions,
        user_input,
        response_format,
        previous_response_id,
    )


def run_llm_evaluation(
        instructions: str,
        user_input: str,
        response_format: object = None,
        previous_response_id: str = None,
):
    """Uses GPT-5.2 with evaluation key."""
    return _run_llm(
        eval_client,
        MODEL_EVALUATION,
        instructions,
        user_input,
        response_format,
        previous_response_id,
    )
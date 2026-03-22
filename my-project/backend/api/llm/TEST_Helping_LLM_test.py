from llm_utils import run_llm_generation
from prompts import ChatLLM_instructions, build_instructions

print("Type 'exit' to quit.\n")
response_id = None
knowledge = "Addition"
while True:
    user_input = input("You: ")
    if user_input.lower() in ["exit", "quit"]:
        print("👋 Goodbye!")
        break

    try:
        reply, response_id = run_llm_generation(
            build_instructions(ChatLLM_instructions),
            user_input,
            previous_response_id=response_id
        )

        print("Assistant:", reply)

    except LLMError as e:
        print(f"⚠️ LLM failure: {e}")

    except Exception as e:
        print(f"🔥 Unexpected system error: {e}")
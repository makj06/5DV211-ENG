from llm_utils import run_llm_evaluation
from prompts import EvaluationLLM_instructions, EvaluatingSchema, build_instructions

task = input("Enter Task: ")
answer = input("Enter Answer: ")
lang = input("Enter Language: ")
if lang.lower() not in ["english", "swedish"] : lang = None
prompt= f"Task :{task}, Student's answer: {answer}"
response, _ = run_llm_evaluation(build_instructions(EvaluationLLM_instructions,lang), prompt, response_format=EvaluatingSchema)

print(response.correct, response.response)
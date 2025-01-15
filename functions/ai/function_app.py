import logging
import azure.functions as func
from azure.cosmos import CosmosClient
from openai import OpenAI
import json
import os

def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
    key = os.environ['OPENAI_API_KEY']
    recipetype = req.headers.get('recipetype')
    
    food = req.headers.get('food')
    ingredients = req.headers.get('ingredients')
    extra = req.headers.get('extra')

    client = OpenAI(
    api_key=key,
    )

    if recipetype == "random" and food == "random":
        prompt = f"Short output random recipe with title"
    elif recipetype == "random":
        prompt = f"Short output random {food} recipe"
    else:
        prompt = f"Short output {food} recipe with title contains {ingredients} and is {extra}"
    completion = client.chat.completions.create(
    model="gpt-4o-mini",
    store=True,
    messages=[
        {"role": "user", "content": prompt}
    ]
    )

    return func.HttpResponse(
        json.dumps(str(completion.choices[0].message.content)),
        status_code=200
    )
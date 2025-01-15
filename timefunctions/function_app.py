import logging
import azure.functions as func
from azure.cosmos import CosmosClient
import requests
import json
import os

def generate_random_recipe():
    # get the API endpoint URL
    url = os.environ['function_url']
    headers = {'recipetype': 'random', 'food': 'random'}

    try:
        # Make a GET request to the API endpoint using requests.get()
        response = requests.get(url, headers=headers)

        # Check if the request was successful (status code 200)
        if response.status_code == 200:
            recipes = response.json()
            return recipes
        else:
            print('Error:', response.status_code)
            return None
    except requests.exceptions.RequestException as e:
        # Handle any network-related errors or exceptions
        print('Error:', e)
        return None

app = func.FunctionApp()

@app.schedule(schedule="0 0 0/24 * * *", arg_name="myTimer", run_on_startup=True,
              use_monitor=False) 
def generaterecipeoftheday(myTimer: func.TimerRequest) -> None:
    logging.info('Python timer trigger function executed.')

    recipes = generate_random_recipe()

    if recipes:
        client = CosmosClient(os.environ['cosmo_url'], credential=os.environ['cosmo_key'])
        DATABASE_NAME = 'savourai'
        database = client.get_database_client(DATABASE_NAME)
        CONTAINER_NAME = 'recipes'
        container = database.get_container_client(CONTAINER_NAME)
        container.upsert_item({
            'id': "1",
            'userid': "1",
            'recipe': json.dumps(recipes)
            })
        logging.info('Generated Recipe')
    else:
        logging.info('Error')

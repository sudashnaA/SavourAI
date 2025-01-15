import logging
import azure.functions as func
from azure.cosmos import CosmosClient
import os
import uuid
import json

def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
    logging.info('createaccount HTTP trigger function processed a request.')

    recipe = req.headers.get('recipe')
    userid= req.headers.get('userid')

    url = os.environ['cosmo_url']
    key = os.environ['cosmo_key']


    client = CosmosClient(url, credential=key)
    DATABASE_NAME = 'savourai'
    database = client.get_database_client(DATABASE_NAME)
    CONTAINER_NAME = 'recipes'
    container = database.get_container_client(CONTAINER_NAME)

    id = uuid.uuid4()

    if not recipe and userid:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            recipe = req_body.get('recipe')
            userid = req_body.get('userid')

    if recipe and userid:    
            container.upsert_item({
            'id': str(id),
            'userid': userid,
            'recipe': recipe
            })
            return func.HttpResponse(
                 json.dumps("Successfully saved recipe"), 
                 status_code=200
                 )
    else:
        return func.HttpResponse(
        "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
        status_code=200
        )
import logging
import azure.functions as func
from azure.cosmos import CosmosClient
import os
import uuid
import json

def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
    logging.info('createaccount HTTP trigger function processed a request.')

    userid= req.headers.get('userid')
    collectionid = req.headers.get('collectionid')
    recipeid = req.headers.get('recipeids')

    url = os.environ['cosmo_url']
    key = os.environ['cosmo_key']


    client = CosmosClient(url, credential=key)
    DATABASE_NAME = 'savourai'
    database = client.get_database_client(DATABASE_NAME)
    CONTAINER_NAME = 'collectionitems'
    container = database.get_container_client(CONTAINER_NAME)

    if not recipeid and userid and collectionid:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            recipeid = req_body.get('recipeid')
            userid = req_body.get('userid')
            collectionid = req_body.get('collectionid')

    if recipeid and userid and collectionid: 
            # split recipeids
            recipeidformatted = str(recipeid).split(',') 
            for item in recipeidformatted:
                id = uuid.uuid4()
                container.upsert_item({
                'id': str(id),
                'userid': userid,
                'collectionid': collectionid,
                'recipeid': item
                })
            return func.HttpResponse(
            json.dumps("Successfully added collection items"),
            status_code=200
            )
    else:
        return func.HttpResponse(
        "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
        status_code=200
        )
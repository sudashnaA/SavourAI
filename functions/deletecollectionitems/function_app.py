import logging
import azure.functions as func
from azure.cosmos import CosmosClient
import os
import json

def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    collectionitemids = req.headers.get('collectionitemids')

    url = os.environ['cosmo_url']
    key = os.environ['cosmo_key']


    client = CosmosClient(url, credential=key)
    DATABASE_NAME = 'savourai'
    database = client.get_database_client(DATABASE_NAME)
    CONTAINER_NAME = 'collectionitems'
    container = database.get_container_client(CONTAINER_NAME)

    if not collectionitemids:
        try:
                req_body = req.get_json()
        except ValueError:
                pass
        else:
                collectionitemids = req_body.get('collectionitemid')

    if collectionitemids:
        collectionitemlist = str(collectionitemids).split(',') 
        for item in collectionitemlist:
            container.delete_item(item=item, partition_key=item)
        return func.HttpResponse(json.dumps("Items DESTROYED"))
    else:
        return func.HttpResponse(
        "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
        status_code=200
        )
import logging
import azure.functions as func
from azure.cosmos import CosmosClient
import os
import json

def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
        logging.info('Python HTTP trigger function processed a request.')

        recipeofthedayid = "1"

        url = os.environ['cosmo_url']
        key = os.environ['cosmo_key']

        client = CosmosClient(url, credential=key)
        DATABASE_NAME = 'savourai'
        database = client.get_database_client(DATABASE_NAME)
        CONTAINER_NAME = "recipes"
        container = database.get_container_client(CONTAINER_NAME)

        results = container.query_items(
        query='SELECT * FROM C WHERE C.id = @id',
        parameters=[
                dict(name='@id', value=recipeofthedayid)
        ],
        enable_cross_partition_query=True)
        item_list = []
        for item in results:
                item_list.append(item)

        if not item_list:
                return func.HttpResponse(json.dumps("No items Exist"))
        else:
                return func.HttpResponse(json.dumps(item_list))
import logging
import azure.functions as func
from azure.cosmos import CosmosClient
import os
import json

def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    userid = req.headers.get('userid')
    container = req.headers.get('container')

    url = os.environ['cosmo_url']
    key = os.environ['cosmo_key']


    client = CosmosClient(url, credential=key)
    DATABASE_NAME = 'savourai'
    database = client.get_database_client(DATABASE_NAME)
    CONTAINER_NAME = container
    container = database.get_container_client(CONTAINER_NAME)

    if not userid:
            try:
                    req_body = req.get_json()
            except ValueError:
                    pass
            else:
                    userid = req_body.get('userid')

    if userid:
            results = container.query_items(
            query='SELECT * FROM C WHERE C.userid = @userid',
            parameters=[
                    dict(name='@userid', value=userid)
            ],
            enable_cross_partition_query=True)
            item_list = []
            for item in results:
                item_list.append(item)

            if not item_list:
                    return func.HttpResponse(json.dumps("No items Exist"))
            else:
                    return func.HttpResponse(json.dumps(item_list))
    else:
            return func.HttpResponse(
            "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
            status_code=200
            )
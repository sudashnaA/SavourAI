import logging
import azure.functions as func
from azure.cosmos import CosmosClient
import os
import json

def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
    logging.info('createaccount HTTP trigger function processed a request.')

    collectionid = req.headers.get('collectionid')
    collectionName = req.headers.get('collectionname')
    userid= req.headers.get('userid')

    url = os.environ['cosmo_url']
    key = os.environ['cosmo_key']


    client = CosmosClient(url, credential=key)
    DATABASE_NAME = 'savourai'
    database = client.get_database_client(DATABASE_NAME)
    CONTAINER_NAME = 'collections'
    container = database.get_container_client(CONTAINER_NAME)

    if not collectionName and userid and collectionid:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            collectionName = req_body.get('collectionname')
            userid = req_body.get('userid')
            collectionid = req_body.get("collectionid")

    if collectionName and userid and collectionid:  
            results = container.query_items(
            query='SELECT C.collection FROM C WHERE C.userid = @userid and C.collection = @collection',
            parameters=[
                    dict(name='@userid', value=userid),
                    dict(name='@collection', value=collectionName)
            ],
            enable_cross_partition_query=True)
            item_list = []
            for item in results:
                item_list.append(item)  

            if not item_list:
                container.upsert_item({
                'id': collectionid,
                'userid': userid,
                'collection': collectionName
                })
                return func.HttpResponse(
                    json.dumps("Successfully created collection"), 
                    status_code=200
                    )
            else:
                 return func.HttpResponse(
                    json.dumps("Collection Name already exists"), 
                    status_code=200
                    )
    else:
        return func.HttpResponse(
        "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
        status_code=200
        )
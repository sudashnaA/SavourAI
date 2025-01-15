import logging
import azure.functions as func
from azure.cosmos import CosmosClient
import os
import json

def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    collectionids = req.headers.get('collectionids')

    url = os.environ['cosmo_url']
    key = os.environ['cosmo_key']


    client = CosmosClient(url, credential=key)
    DATABASE_NAME = 'savourai'
    database = client.get_database_client(DATABASE_NAME)
    CONTAINER_NAME = 'collections'
    collectioncontainer = database.get_container_client(CONTAINER_NAME)
    CONTAINER_NAME2 = 'collectionitems'
    collectionitemscontainer = database.get_container_client(CONTAINER_NAME2)

    if not collectionids:
        try:
                req_body = req.get_json()
        except ValueError:
                pass
        else:
                collectionids = req_body.get('collectionid')

    if collectionids:
        collectionidlist = str(collectionids).split(',') 
        for item in collectionidlist:
            collectioncontainer.delete_item(item=item, partition_key=item)

            # query collectionitems to find all items that had the collectionid
            results = collectionitemscontainer.query_items(
            query='SELECT * FROM C WHERE C.collectionid = @collectionid',
            parameters=[
                    dict(name='@collectionid', value=item)
            ],
            enable_cross_partition_query=True)
                
            collectionitem_list = []
            for item in results:
                    collectionitem_list.append(item)      

            for collectionitem in collectionitem_list:
                collectionitemid = collectionitem.get('id') 
                collectionitemscontainer.delete_item(item=collectionitemid, partition_key=collectionitemid)

        return func.HttpResponse(json.dumps("Collection and its items DESTROYED"))
    else:
        return func.HttpResponse(
        "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
        status_code=200
        )
import logging
import azure.functions as func
from azure.cosmos import CosmosClient
import os
import json

def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    recipeids = req.headers.get('recipeids')

    url = os.environ['cosmo_url']
    key = os.environ['cosmo_key']


    client = CosmosClient(url, credential=key)
    DATABASE_NAME = 'savourai'
    database = client.get_database_client(DATABASE_NAME)
    CONTAINER_NAME = 'recipes'
    recipescontainer = database.get_container_client(CONTAINER_NAME)
    CONTAINER_NAME = 'collectionitems'
    collectionitemscontainer = database.get_container_client(CONTAINER_NAME)

    if not recipeids:
        try:
                req_body = req.get_json()
        except ValueError:
                pass
        else:
                recipeids = req_body.get('recipeid')

    if recipeids:
        recipeidlist = str(recipeids).split(',') 
        for recipeid in recipeidlist:
            recipescontainer.delete_item(item=recipeid, partition_key=recipeid)
            
            # find items that match the recipeid in the collectionitems table
            results = collectionitemscontainer.query_items(
            query='SELECT * FROM C WHERE C.recipeid = @recipeid',
            parameters=[
                    dict(name='@recipeid', value=recipeid)
            ],
            enable_cross_partition_query=True)

            collectionitem_list = []
            for item in results:
                    collectionitem_list.append(item)      

            for collectionitem in collectionitem_list:
                collectionitemid = collectionitem.get('id') 
                collectionitemscontainer.delete_item(item=collectionitemid, partition_key=collectionitemid)
        return func.HttpResponse(json.dumps("Recipe DESTROYED"))
    else:
        return func.HttpResponse(
        "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
        status_code=200
        )
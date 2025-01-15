import logging
import azure.functions as func
from azure.cosmos import CosmosClient
import os
import json

def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
        logging.info('Python HTTP trigger function processed a request.')

        collectionid = req.headers.get('collectionid')

        url = os.environ['cosmo_url']
        key = os.environ['cosmo_key']


        client = CosmosClient(url, credential=key)
        DATABASE_NAME = 'savourai'
        database = client.get_database_client(DATABASE_NAME)
        CONTAINER_NAME = 'collectionitems'
        CONTAINER_NAME2 = 'recipes'
        container = database.get_container_client(CONTAINER_NAME)
        container2 = database.get_container_client(CONTAINER_NAME2)

        if not collectionid:
                try:
                        req_body = req.get_json()
                except ValueError:
                        pass
                else:
                        collectionid = req_body.get('collectionid')

        if collectionid:
                # get recipeids for collectionitems that match the collectionid
                results = container.query_items(
                query='SELECT C.recipeid FROM C WHERE C.collectionid = @collectionid',
                parameters=[
                        dict(name='@collectionid', value=collectionid)
                ],
                enable_cross_partition_query=True)

                collectionitem_list = []
                for item in results:
                        collectionitem_list.append(item)  

                # get ids for collectionitems that match the collectionid
                results2 = container.query_items(
                query='SELECT C.id FROM C WHERE C.collectionid = @collectionid',
                parameters=[
                        dict(name='@collectionid', value=collectionid)
                ],
                enable_cross_partition_query=True)

                collectionitemid_list = []
                for item in results2:
                        collectionitemid_list.append(item)         

                if not collectionitem_list:
                        return func.HttpResponse(json.dumps("No items Exist"))
                else:
                        item_list = []
                        for item in collectionitem_list:
                                # get all data from recipes table
                                recipeid = item.get("recipeid")
                                results = container2.query_items(
                                query='SELECT * FROM C WHERE C.id = @id',
                                parameters=[
                                        dict(name='@id', value=recipeid)
                                ],
                                enable_cross_partition_query=True)

                                for x in results:
                                        item_list.append(x) 
                        returnobject = {}
                        returnobject['collectionitemdata'] = item_list
                        returnobject['collectionitemids'] = collectionitemid_list

                        return func.HttpResponse(json.dumps(returnobject))
        else:
                return func.HttpResponse(
                "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
                status_code=200
                )
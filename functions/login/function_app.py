import logging
import azure.functions as func
from azure.cosmos import CosmosClient
import os
import uuid
import hashlib
import json

def main(req: func.HttpRequest, doc: func.Out[func.Document]) -> func.HttpResponse:
    logging.info('login HTTP trigger function processed a request.')

    username = req.headers.get('username')
    # password is base64 encoded
    password= req.headers.get('password')

    url = os.environ['cosmo_url']
    key = os.environ['cosmo_key']


    client = CosmosClient(url, credential=key)
    DATABASE_NAME = 'savourai'
    database = client.get_database_client(DATABASE_NAME)
    CONTAINER_NAME = 'users'
    container = database.get_container_client(CONTAINER_NAME)

    if not username and password:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            username = req_body.get('username')
            password = req_body.get('password')

    if username and password:
        # Create a SHA-256 hash object
        hash_object = hashlib.sha256()
        # Convert the password to bytes and hash it
        hash_object.update(password.encode())
        # Get the hex digest of the hash
        hash_password = hash_object.hexdigest()

        # data from header (user inputted)
        userdata = "{'username': '" + username + "', 'password': '" + hash_password + "'}"

        results = container.query_items(
        query='SELECT C.username, C.password FROM C WHERE C.username = @username',
        parameters=[
                dict(name='@username', value=username)
        ],
        enable_cross_partition_query=True)

        # return object
        data = {}

        item_list = []
        for item in results:
            item_list.append(item)
        if not item_list:
            data['result'] = False
            return json.dumps(data)
        # check if header data and queried data match
        elif str(item_list[0]) == userdata:
            # get users id from DB
            results = container.query_items(
            query='SELECT C.id FROM C WHERE C.username = @username',
            parameters=[
                    dict(name='@username', value=username)
            ],
            enable_cross_partition_query=True)
            id_list = []
            for item in results:
                    id_list.append(item)

            data['result'] = True
            data['id'] = id_list[0]['id']
            return json.dumps(data)
        else:
            data['result'] = False
            return json.dumps(data)
    else:
        return func.HttpResponse(
        "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
        status_code=200
        )
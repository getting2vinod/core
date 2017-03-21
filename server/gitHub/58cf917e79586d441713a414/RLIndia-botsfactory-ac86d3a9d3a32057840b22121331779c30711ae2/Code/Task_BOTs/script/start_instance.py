import boto3
import sys
import json

session = boto3.Session(
    # Pass aws access key, secret key, region, instanceId as a parameter. 
    aws_access_key_id=sys.argv[1],
    aws_secret_access_key=sys.argv[2],
    region_name=sys.argv[3]
    )
client = session.client("ec2")
start_instances=client.start_instances(
    InstanceIds=[sys.argv[4]])

print (json.dumps(start_instances))


import boto3
import sys
import json

session = boto3.Session(     
	aws_access_key_id=sys.argv[1],    
	aws_secret_access_key=sys.argv[2],    
	region_name=sys.argv[3]    )
client = session.client("ec2")
stop_instances=client.stop_instances(InstanceIds=[sys.argv[4]])
print json.dumps(stop_instances)

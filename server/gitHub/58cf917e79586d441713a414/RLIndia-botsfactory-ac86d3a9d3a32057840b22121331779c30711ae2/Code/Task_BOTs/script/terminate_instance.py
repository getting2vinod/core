import boto3
session = boto3.Session( 
     # Pass AWS access key and secret key as a parameter. 
    aws_access_key_id=sys.argv[1],
    aws_secret_access_key=sys.argv[2],
    region_name=sys.argv[3]


    )
client = session.client("ec2")
terminate_instances=client.terminate_instances(
    InstanceIds=[
		sys.argv[4]       
		
]
    )
print (json.dumps(terminate_instances))


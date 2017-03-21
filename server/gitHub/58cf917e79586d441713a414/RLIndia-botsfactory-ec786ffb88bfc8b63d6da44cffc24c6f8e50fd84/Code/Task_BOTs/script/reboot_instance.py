import boto3
import sys
session = boto3.Session( 
	  # Pass AWS access key and secret key as a parameter. 
    aws_access_key_id=sys.argv[1],
    aws_secret_access_key=sys.argv[2],
    region_name=sys.argv[3]
    )
client = session.client("ec2")
reboot_instances=client.reboot_instances(
	#DryRun=True|False,
    InstanceIds=[
		sys.argv[4]       
		
]
    )


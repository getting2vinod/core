# Pyhton script to restart CI/CD dashboard
# import socket



import os
# os.system('yes | sudo apt-get install python-paramiko')
import socket
import sys
import site


try:
    import pip
except ImportError:
    print
    "installing pip"
    cmd = "sudo easy_install pip"
    os.system(cmd)
    reload(site)

try:
    import paramiko
except ImportError:
    "installing paramiko"
    cmd = "sudo apt-get install python-paramiko"
    os.system('yes | '+cmd)
    reload(site)
import json
import sys
from paramiko import AuthenticationException
from paramiko import BadHostKeyException
from paramiko import SSHException



# "catalystAppServerURLwithPort": "http://localhost:3001",
catalystAppServerURLwithPort = sys.argv[1]
# "catalystUserName": "superadmin",
catalystUserName = sys.argv[2]
# "catalystPassword": "superadmin@123",
catalystPassword = sys.argv[3]
# "dashboardScriptName": "./startup.sh",
dashboardScriptName = sys.argv[4]
# "dashboardDatabaseHostName": "localhost",
dashboardDatabaseHostName = sys.argv[5]
# "buildFlag": "Nobuild",
buildFlag = sys.argv[6]
# "dashboardHostName": "40.114.12.68:3000"
dashboardHostName = sys.argv[7]
# dashboardDomainName": "cicddahbaord.rlcatalyst.com",
dashboardDomainName = sys.argv[8]
# "dashbaordServerUserName":"",
dashbaordServerUserName = sys.argv[9]
# "dashboardServerPassword":"",
dashbaordServerPassword = sys.argv[10]
# "dashboardSetUppath": "/opt/Dashboard"
dashboardSetUppath = sys.argv[11]

try:
    print (catalystAppServerURLwithPort)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())


    print ("Creating connection")
    ssh.connect(dashboardDomainName, username=dashbaordServerUserName, password=dashbaordServerPassword)
    print ("Connected")




    dashboardCommand = 'cd '+dashboardSetUppath+';sudo chmod +x '+dashboardScriptName+'; sudo ./'+dashboardScriptName+' '+catalystAppServerURLwithPort+' '+dashboardDatabaseHostName+' '+catalystUserName+' '+catalystPassword+' '+buildFlag
    #dashboardCommand = 'cd '+dashboardSetUppath+';sudo chmod +x '+dashboardScriptName+'; sudo ./'+dashboardScriptName
    print ("Dashboard command before execution: " + dashboardCommand)
    ssh_stdin, ssh_stdout, ssh_stderr = ssh.exec_command(dashboardCommand)

    for line in ssh_stdout.readlines():
        print (line.strip())



    print("Closing connection")
    ssh.close()
    print("Closed")

except (BadHostKeyException, AuthenticationException, SSHException, socket.error) as e:
    print (e)


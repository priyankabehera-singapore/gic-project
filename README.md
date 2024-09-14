# gic-project
cafe-employee-database

MYSQL Database
==================
- Install your MYSQL database in MYSQL work bench or other tools.
- Uncompressed the gic-project-db.zip and then import the tables inside the folder to the MySQL db.
- Provide the MySQL details: HOSTNAME, USER, PASSWORD, DATABASE UNDER  MYSQL CONNECTION IN app.js file


Node.js Application
====================
-Verify Dockerfile: Place the docker files and yaml file with specific modifications in 
# Set the working directory inside the container : Set your working directory
# Expose the port the app runs on : Change the port

-Set the ports in docker.yml file as well.

-Build the Docker Image
docker build -t your-container-image .

-docker run -p 3000:3000 my-node-app : Change the ports accordingly(If creates error, then change the port of the application and rebuild the image)

-Run the application as http://localhost:3000




## Launching the system (for development only)

First make sure that your Docker daemon has been running. Then build the Docker image

```
docker image build -t ac_dev .
```

and run the image in a Docker container using the default database password

```
docker run -it -p 8000:8000 ac_dev
```

To specify the database configurations, use

```
docker run -it -p 8000:8000 -v <volume_name>:/var/lib/mysql ac_dev -e MYSQL_ROOT_PASSWORD=<pwd> \
	-e MYSQL_DB_NAME=<db_name>
```

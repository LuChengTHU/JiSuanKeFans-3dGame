## Launching the system (for development only)

First make sure that your Docker daemon has been running. Then build the Docker image

```
docker image build -t ac_dev .
```

and run the image in a Docker container using the default configurations 

```
docker run -it -p 8000:8000 ac_dev
```

To specify the configurations, use

```
docker run -it -p 8000:8000 -v <volume_name>:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=<pwd> \
	-e MYSQL_DB_NAME=<db_name> -e TZ_SETTING=<timezone_setting> ac_dev
```

An example of `timezone_setting` is `Asia/Shanghai`.

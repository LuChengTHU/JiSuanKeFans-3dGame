## Launching the backend (for development only)

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

## Setting the backend host and port

By default the frontend uses `localhost` and port `8000` for the backend API. You can change this setting
by setting the environment variable `REACT_APP_AC_BACKEND`, either permanently or temporarily before launching the frontend each time.

For example, to temporarily set the variable to the remote backend server, use the following instruction when you want to run the frontend:

```
REACT_APP_AC_BACKEND="http://118.190.147.6:8000" npm start
```

To use the environment for the current shell session, set it with

```
export REACT_APP_AC_BACKEND="http://118.190.147.6:8000"
```

## Setting the frontend base URL

By default the `http://localhost:3000` is used as the front end base URL. To change this setting, set the
environment variable `REACT_APP_AC_BASE` to what you want.

#!/bin/sh

docker image build -t ac_dev .
if [ $# = 0 ]; then
	docker run -it -p 8000:8000 -v data:/var/lib/mysql -e TZ_SETTING="Asia/Shanghai" ac_dev
else
	docker run -it -p 8000:8000 -v data:/var/lib/mysql -e TZ_SETTING="Asia/Shanghai" ac_dev ./launch.sh $@
fi


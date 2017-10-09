FROM jisuankefans/ac 

RUN rm -rf /ac_home/*
WORKDIR /ac_home
ADD . /ac_home

EXPOSE 8000
CMD ["sh", "./launch.sh"]

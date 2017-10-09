FROM jisuankefans/ac 

WORKDIR /ac_home
ADD requirements.txt ./
RUN pip3 install -r ./requirements.txt
ADD . /ac_home

EXPOSE 8000
CMD ["sh", "./launch.sh"]

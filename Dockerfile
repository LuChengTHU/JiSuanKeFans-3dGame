FROM jisuankefans/ac

WORKDIR /ac_home
ADD . /ac_home

EXPOSE 8000

CMD ["./launch.sh", "0.0.0.0:8000"]

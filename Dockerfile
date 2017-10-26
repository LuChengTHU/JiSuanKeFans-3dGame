FROM jisuankefans/ac

WORKDIR /ac_home
ADD . /ac_home

EXPOSE 8000

ENV TZ_SETTING="UTC"

CMD ["./launch.sh", "runserver", "0.0.0.0:8000"]

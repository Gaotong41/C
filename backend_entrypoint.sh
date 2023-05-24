#!/bin/sh

${HOME}/wait-for-it.sh ${CVAT_POSTGRES_HOST}:5432 -t 0 -- sh -c \
    "python3 ${HOME}/manage.py migrate \
     && python3 ${HOME}/manage.py collectstatic --no-input \
     && exec /usr/bin/supervisord -c supervisord/server.conf"



sudo docker run -it \
--env-file ./.env \
-p 7801:7800 \
--name socket-game-2 \
--rm socket-project-03-agar-game-socket-game-1
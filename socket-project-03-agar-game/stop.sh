





sudo docker-compose down


sudo docker container prune -y
sudo docker images | grep "socket-project-03" | awk '{print $3}' | xargs sudo docker image rm -f
sudo docker image ls


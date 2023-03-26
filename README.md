# Running a server locally

The following command will run a minecraft server locally so that the script can be tested. Run as many as required.

```
docker run -d -it \
  --name minecraft-bedrock \
  -e EULA=TRUE -e LEVEL_TYPE=flat -e GAMEMODE=creative -e ONLINE_MODE=false \
  -p 19132:19132/udp \
  itzg/minecraft-bedrock-server
```
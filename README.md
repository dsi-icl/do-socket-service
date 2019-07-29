# Socket service

This repository provides a simple server that forwards a message received via a [socket.io](https://socket.io/) socket.

It replaces the socket provided by the deprecated [dsi-icl/gdo-dsivisrepo](https://github.com/dsi-icl/gdo-dsivisrepo/) project.

The dockerfile and supervisord.conf file are based on [voduytuan/docker-socketio](https://github.com/voduytuan/docker-socketio), but with a different base image and some other modifications.

## Usage

First start a Docker container:

```
docker run -it -d --restart=always --name mysocketio -p 8080:8080 dsi-icl/socketservice
```

Then use the socket as in the example file `example.html`.

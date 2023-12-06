# do-socket-service

This repository provides a simple server that forwards all messages received via a [socket.io](https://socket.io/)
socket.

## Installation

A Docker image is hosted on Dockerhub
as [`datascienceinstitute/do-socket-service`](https://hub.docker.com/r/datascienceinstitute/gdo-socket-service).

You can start a Docker container based on this image:

```shell
docker run -it -d --restart=always --name do-socket-service -p 8080:8080 datascienceinstitute/do-socket-service:latest
```

or via:

```shell
docker-compose up -d
```

## Usage

The socket.io client is available at ```/socket.io.js``` endpoint.

Dynamic namespaces are supported and accessible with the ```do-``` prefix. These require authentication and are the
recommended method for connecting sockets.

A legacy ```/sharedsocket``` namespace without authentication is also available, but is deprecated and scheduled for
removal in the next release.

An admin UI for monitoring the socket server and its connections is available at the ```/admin``` endpoint, for further
information please see the documentation provided by [socket.io](https://socket.io/docs/v4/admin-ui/).

Please see the [.env.example](.env.example), [config.example.json](config.example.json)
and [credentials.example.json](credentials.example.json) files, which provide sample setups for injecting environment
variables, server configuration and authenticating users respectively.

## Custom Behaviour

Sockets can come in two optional flavours, controllers and views. This follows the model used by
the [Open Visualisation Environment](!https://ove.readthedocs.io). The socket's type is provided via the socket'
s ```data``` property. If unspecified, none of the custom behaviour below will be applied.

Alongside broadcasting messages to all sockets in the namespace, the server provides two events - ```__count__```, ```__connect__```
and ```__disconnect__```.

Querying the server with a ```__count__``` message will see it respond with a ```__count__``` message containing the
number of connected view sockets.
Whenever a view socket connects, the ```__connect__``` event is broadcast, notifying the remaining sockets of the disconnection.
Whenever a view socket disconnects, the ```__disconnect__``` event will be broadcast, notifying the remaining sockets of the
disconnection.

These messages were implemented to enable the stateful sharing of computation across a pool of connections, as required
by the controller/view model implemented by the . 
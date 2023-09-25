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

Then use the socket as in the [socket.io](https://socket.io/) documentation.

Dynamic namespaces are supported and accessible with the ```do-``` prefix. These require authentication and are the
recommended procedure for managing sockets.

A legacy ```/sharedsocket``` namespace without authentication is also available, but is deprecated and scheduled for
removal in the next release.

An admin UI for monitoring the socket server and its connections is available at the ```/admin``` endpoint, for further
information please see the documentation provided by [socket.io](https://socket.io/docs/v4/admin-ui/).

Please see the [.env.example](.env.example), [config.example.json](config.example.json)
and [credentials.example.json](credentials.example.json) files, which provide sample setups for injecting environment
variables, cors configuration and authenticating users respectively.
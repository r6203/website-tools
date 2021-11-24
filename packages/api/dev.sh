#!/usr/bin/env bash

docker run -d --name redis_website_tools -p 127.0.0.1:6379:6379 redis

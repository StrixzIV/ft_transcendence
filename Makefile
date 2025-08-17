# Shell
SHELL := /usr/bin/env bash

# Directories
VOLUMES_DIRS	:= ./data
SCRIPTS_DIRS	:= ./scripts
SECRET_DIRS		:= ./secrets
SSL_DIRS		:= $(SECRET_DIRS)/ssl

# Rules
all: setup up

setup:
	@mkdir -p $(VOLUMES_DIRS)
	@$(SHELL) $(SCRIPTS_DIRS)/generate_env.sh
	@$(SHELL) $(SCRIPTS_DIRS)/generate_ssl.sh

up:
	@echo "Starting docker-compose..."
	@docker-compose up -d --build --remove-orphans

down:
	@echo "Stopping docker-compose..."
	@docker-compose down

prune:
	@echo "Pruning..."
	@docker system prune -a

list:
	@echo "Current docker processes:"
	@docker ps -a
	@echo
	@echo "Current docker volumes:"
	@docker volume ls

fclean: down prune
	@echo "Cleaning..."
	@rm -rf $(SSL_DIRS)
	@rm -rf env/*
	@docker stop $(docker ps -qa) 2>/dev/null || true
	@docker rm $(docker ps -qa) 2>/dev/null || true
	@docker rmi -f $(docker images -qa) 2>/dev/null || true
	@docker volume rm $(docker volume ls -q) 2>/dev/null || true
	@docker network rm $(docker network ls -q) 2>/dev/null || true

wipe: down
	@echo "Delete volume + data/ & logs/"
	@docker volume rm $(docker volume ls -q) 2>/dev/null || true
	@rm -rf data/*
	@rm -rf logs/*

re: down up

.PHONY: setup up down prune list fclean re
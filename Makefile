VOLUMES_DIRS = data

all: setup up

setup:
	@mkdir -p $(VOLUMES_DIRS)

up:
	@echo "Starting docker-compose..."
	@docker-compose up -d --build

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
	@rm -rf secrets/ssl
	@docker stop $(docker ps -qa) 2>/dev/null || true
	@docker rm $(docker ps -qa) 2>/dev/null || true
	@docker rmi -f $(docker images -qa) 2>/dev/null || true
	@docker volume rm $(docker volume ls -q) 2>/dev/null || true
	@docker network rm $(docker network ls -q) 2>/dev/null || true

re: down up

.PHONY: setup up down prune list fclean re
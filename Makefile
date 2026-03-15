ENV_FILE ?= .env.local
COMPOSE_FILES := -f docker-compose.yml -f docker-compose.local.yml
COMPOSE := docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES)

.PHONY: help check-env local-up local-down local-logs local-ps local-rebuild local-reset

help:
	@echo "Available targets:"
	@echo "  make local-up       # Build and start local stack in detached mode"
	@echo "  make local-down     # Stop and remove local stack"
	@echo "  make local-reset    # Stop stack and remove DB volume"
	@echo "  make local-logs     # Tail service logs"
	@echo "  make local-ps       # Show running services"
	@echo "  make local-rebuild  # Rebuild and force recreate services"
	@echo ""
	@echo "Override env file with: make <target> ENV_FILE=.env.somefile"

check-env:
	@test -f "$(ENV_FILE)" || (echo "Missing $(ENV_FILE). Run: cp .env.example .env.local" && exit 1)

local-up: check-env
	$(COMPOSE) up --build -d

local-down: check-env
	$(COMPOSE) down

local-reset: check-env
	$(COMPOSE) down -v

local-logs: check-env
	$(COMPOSE) logs -f --tail=100

local-ps: check-env
	$(COMPOSE) ps

local-rebuild: check-env
	$(COMPOSE) up --build --force-recreate -d

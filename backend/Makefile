MIGRATIONS := db/migrations

# DATABASE_URL lives in .env (gitignored). See .env.example.
ifneq (,$(wildcard .env))
include .env
export
endif

MIGRATE := migrate -path $(MIGRATIONS) -database "$(DATABASE_URL)"

.PHONY: up down down-all version create baseline drop force check-url

check-url:
ifndef DATABASE_URL
	$(error DATABASE_URL is not set. cp .env.example .env and fill it in)
endif

## up: apply every pending migration
up: check-url
	$(MIGRATE) up

## down: roll back one migration (down-all reverts everything)
down: check-url
	$(MIGRATE) down 1

## down-all: roll back every migration -- drops all tables
down-all: check-url
	$(MIGRATE) down -all

## version: show the current schema version, and whether it is dirty
version: check-url
	$(MIGRATE) version

## create: scaffold a new pair of migration files -- make create name=add_foo
create:
ifndef name
	$(error usage: make create name=add_something)
endif
	migrate -path $(MIGRATIONS) create -ext sql -dir $(MIGRATIONS) -seq $(name)

## baseline: mark 000001 as applied without running it, for a database whose
## tables already exist. Run this once, then use `make up` from then on.
baseline: check-url
	$(MIGRATE) force 1

## force: clear the dirty flag after a failed migration -- make force v=2
force: check-url
ifndef v
	$(error usage: make force v=<version>)
endif
	$(MIGRATE) force $(v)

## drop: delete everything in the database. Asks first.
drop: check-url
	$(MIGRATE) drop

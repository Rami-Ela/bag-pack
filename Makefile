.PHONY: install start stop dev build db-start db-stop db-delete db-reset migrate studio

install:
	npm install

dev: db-start
	npm run dev

start: db-start
	npm run start

build:
	npm run build

db-start:
	docker compose up -d --wait

db-stop:
	docker compose stop

db-delete:
	docker compose down -v

db-reset: db-delete db-start migrate

migrate:
	npm run prisma:migrate

studio:
	npm run prisma:studio

lint:
	npm run lint

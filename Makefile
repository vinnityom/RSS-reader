install:
	npm install

lint:
	npx eslint .

dev-server:
	npm run start:dev

deploy:
	npm run build
	surge dist/
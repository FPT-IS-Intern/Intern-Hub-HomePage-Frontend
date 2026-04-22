FROM node:22-alpine AS build-stage
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps \
	&& find node_modules/dynamic-ds -type f -name "*.scss" -exec sed -i 's#\\\\/#\\/#g' {} +

COPY . .
RUN npm run build

FROM nginx:stable-alpine

COPY --from=build-stage /app/dist/intern-hub-home-page-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Runtime environment configuration
COPY public/env.js.template /usr/share/nginx/html/env.js.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
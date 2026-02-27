FROM node:22-alpine AS build-stage
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps \
	&& find node_modules/dynamic-ds -type f -name "*.scss" -exec sed -i 's#\\\\/#\\/#g' {} +

COPY . .
RUN npm run build

FROM nginx:stable-alpine


COPY --from=build-stage /app/dist/intern-hub-homePage-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
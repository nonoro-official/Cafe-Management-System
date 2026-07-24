# Web image — builds both SPAs and serves them behind nginx with an /api proxy.
# Build context is the repository root (needs both customer/ and admin/).

# 1. Build the customer kiosk SPA (served at /)
FROM node:22-alpine AS build-customer
WORKDIR /app/customer
COPY customer/package.json customer/package-lock.json ./
RUN npm ci
COPY customer/ ./
RUN npm run build

# 2. Build the admin dashboard SPA (served under /admin/)
FROM node:22-alpine AS build-admin
WORKDIR /app/admin
COPY admin/package.json admin/package-lock.json ./
RUN npm ci
COPY admin/ ./
RUN npm run build

# 3. Serve both static bundles + reverse-proxy /api to the API
FROM nginx:1.27-alpine
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build-customer /app/customer/dist /usr/share/nginx/html
COPY --from=build-admin /app/admin/dist /usr/share/nginx/html/admin
EXPOSE 80

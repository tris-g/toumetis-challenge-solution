FROM node:22-alpine AS build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

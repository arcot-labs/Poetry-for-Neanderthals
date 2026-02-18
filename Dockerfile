FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
WORKDIR /src
COPY dist .
RUN chown -R nginx:nginx /src
CMD ["nginx", "-g", "daemon off;"]

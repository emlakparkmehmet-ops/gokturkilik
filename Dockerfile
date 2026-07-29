# Statik site — nginx ile servis edilir.
# Railway çalışma anında $PORT atar; nginx şablonu bunu envsubst ile doldurur.
FROM nginx:1.27-alpine

# Railway PORT vermezse yerelde de çalışsın
ENV PORT=8080

COPY . /usr/share/nginx/html

# Şablonu yerine taşı ve yayına ait olmayan dosyaları imajdan temizle
RUN mkdir -p /etc/nginx/templates \
 && mv /usr/share/nginx/html/nginx/default.conf.template \
       /etc/nginx/templates/default.conf.template \
 && rm -rf /usr/share/nginx/html/nginx \
           /usr/share/nginx/html/Dockerfile \
           /usr/share/nginx/html/.dockerignore \
           /usr/share/nginx/html/railway.json

EXPOSE 8080

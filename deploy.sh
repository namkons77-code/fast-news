#!/usr/bin/env bash
set -e

echo "=== [1/4] Git Pull from GitHub ==="
cd /var/www/fast-news
git pull origin master

echo "=== [2/4] Update Backend Dependencies and Restart Service ==="
./backend/venv/bin/pip install -r ./backend/requirements.txt --quiet
sudo systemctl restart fastnews

echo "=== [3/4] Build Frontend ==="
cd /var/www/fast-news/frontend
npm install --silent
npm run build

echo "=== [4/4] Reload Nginx ==="
sudo systemctl reload nginx

echo "=== [Done] FastNews Successfully Deployed and Updated from GitHub! ==="

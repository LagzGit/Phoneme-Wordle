#!/bin/sh
set -eu

if [ ! -f /app/data/phoneme.db ]; then
  cp /app/prisma/dev.db /app/data/phoneme.db
fi

exec npm start

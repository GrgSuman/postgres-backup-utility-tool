# PostgreSQL Backup & Migration API

A simple Node.js Express API with React UI for PostgreSQL database backups and migrations.

## Features

- 📦 Backup PostgreSQL databases (`pg_dump`)
- ⬇️ Stream backups for direct download
- 🔄 Migrate databases between servers (`pg_restore`)
- 📄 Supports plain SQL and TAR formats
- ✅ Request validation

## Requirements

- Node.js >= 18
- PostgreSQL client tools (`pg_dump`, `pg_restore`)
- npm/yarn

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd postgres-backup-api
npm install

# Create .env file
echo "PORT=8000" > .env

# Start server
npm start
```

## API Endpoints

### Backup Database
```bash
POST /backup
Content-Type: application/json

{
  "action": "backup",
  "outputFormat": "plain",
  "dbType": "postgres",
  "sourceUrl": "postgres://user:pass@host:5432/dbname"
}
```

### Migrate Database
```bash
POST /migrate
Content-Type: application/json

{
  "action": "migrate",
  "dbType": "postgres",
  "sourceUrl": "postgres://user:pass@host:5432/source_db",
  "destUrl": "postgres://user:pass@host:5432/dest_db"
}
```

## Docker

```bash
# Build and run
docker build -t postgres-backup-app .
docker run -p 8000:8000 postgres-backup-app
```

## License

MIT
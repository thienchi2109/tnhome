# Windows PowerShell Command Reference for TN Home

Quick reference for running commands on Windows with Docker and PostgreSQL.

## 🔧 General PowerShell Rules

### Use `.cmd` suffix for npm commands
```powershell
npm.cmd install
npm.cmd run dev
npx.cmd prisma generate
```

### Use `powershell -Command` for complex commands
```powershell
powershell -Command "your-command-here"
```

---

## 🐳 Docker Commands

### Container Management
```powershell
# Start containers
docker-compose -f D:/tnhome/docker-compose.yml up -d

# Stop containers
docker-compose -f D:/tnhome/docker-compose.yml down

# Check status
docker-compose -f D:/tnhome/docker-compose.yml ps

# View logs
docker logs tnhome-postgres
docker logs tnhome-web-1
```

### Execute Commands in Containers
```powershell
# Simple command
docker exec tnhome-postgres command

# Interactive shell
docker exec -it tnhome-postgres bash

# Pipe stdin (use -i flag)
docker exec -i tnhome-postgres command
```

---

## 🗄️ PostgreSQL Database Commands

### Execute SQL Queries

**Single Query:**
```powershell
powershell -Command "docker exec tnhome-postgres psql -U postgres -d tnhome -c 'SELECT version();'"
```

**Query with Table Names (escaped):**
```powershell
powershell -Command "docker exec tnhome-postgres psql -U postgres -d tnhome -c 'SELECT * FROM \"Product\" LIMIT 5;'"
```

**Query with Single Quotes (double them):**
```powershell
powershell -Command "docker exec tnhome-postgres psql -U postgres -d tnhome -c 'SELECT * FROM \"Product\" WHERE category = ''Bedroom'';'"
```

### Execute SQL Files

**Pipe File to psql (RECOMMENDED):**
```powershell
powershell -Command "Get-Content D:\tnhome\prisma\migrations\migration.sql | docker exec -i tnhome-postgres psql -U postgres -d tnhome"
```

**Shorter version (if already in directory):**
```powershell
powershell -Command "Get-Content migration.sql | docker exec -i tnhome-postgres psql -U postgres -d tnhome"
```

### Verify Indexes
```powershell
powershell -Command "docker exec tnhome-postgres psql -U postgres -d tnhome -c 'SELECT indexname FROM pg_indexes WHERE tablename = ''Product'' ORDER BY indexname;'"
```

### Check Extensions
```powershell
powershell -Command "docker exec tnhome-postgres psql -U postgres -d tnhome -c 'SELECT extname, extversion FROM pg_extension;'"
```

### Query Performance Analysis
```powershell
powershell -Command "docker exec tnhome-postgres psql -U postgres -d tnhome -c 'EXPLAIN ANALYZE SELECT * FROM \"Product\" WHERE \"isActive\" = true ORDER BY \"createdAt\" DESC LIMIT 20;'"
```

---

## 📁 File Operations

### Read Files
```powershell
# PowerShell native
powershell -Command "Get-Content path\to\file.txt"

# Read and pipe to Docker
powershell -Command "Get-Content script.sql | docker exec -i container bash"
```

### List Files
```powershell
# PowerShell native
powershell -Command "Get-ChildItem D:\tnhome\prisma\migrations"

# Short alias
ls D:\tnhome\prisma\migrations
```

---

## ⚠️ Common Mistakes & Fixes

### ❌ WRONG - Bash Syntax in PowerShell
```bash
# Don't use bash cat
cat file.sql | docker exec -i container psql

# Don't use bash echo
echo "SELECT ..." | docker exec -i container psql

# Don't use heredoc
cat <<EOF | docker exec -i container psql
SELECT ...
EOF
```

### ✅ CORRECT - PowerShell Syntax
```powershell
# Use Get-Content
powershell -Command "Get-Content file.sql | docker exec -i tnhome-postgres psql -U postgres -d tnhome"

# Use powershell -Command for queries
powershell -Command "docker exec tnhome-postgres psql -U postgres -d tnhome -c 'SELECT ...'"
```

---

## 🎯 Escaping Rules

### Table/Column Names (use `\"`)
```powershell
powershell -Command "docker exec db psql -c 'SELECT * FROM \"Product\";'"
```

### String Values (double single quotes: `''`)
```powershell
powershell -Command "docker exec db psql -c 'SELECT * WHERE name = ''John'';'"
```

### Complex Escaping Example
```powershell
powershell -Command "docker exec tnhome-postgres psql -U postgres -d tnhome -c 'SELECT \"isActive\", category FROM \"Product\" WHERE name = ''Sofa'' AND \"isActive\" = true;'"
```

---

## 🚀 TN Home Specific Examples

### Apply Database Migration
```powershell
powershell -Command "Get-Content D:\tnhome\prisma\migrations\optimize-fixed.sql | docker exec -i tnhome-postgres psql -U postgres -d tnhome"
```

### Verify Product Indexes
```powershell
powershell -Command "docker exec tnhome-postgres psql -U postgres -d tnhome -c 'SELECT indexname FROM pg_indexes WHERE tablename = ''Product'' ORDER BY indexname;'"
```

### Check Active Products Count
```powershell
powershell -Command "docker exec tnhome-postgres psql -U postgres -d tnhome -c 'SELECT COUNT(*) FROM \"Product\" WHERE \"isActive\" = true;'"
```

### Analyze Query Performance
```powershell
powershell -Command "docker exec tnhome-postgres psql -U postgres -d tnhome -c 'EXPLAIN ANALYZE SELECT id, name, price FROM \"Product\" WHERE \"isActive\" = true AND category = ''Living Room'' ORDER BY \"createdAt\" DESC LIMIT 20;'"
```

---

## 💡 Pro Tips

1. **Always use `powershell -Command`** for complex operations with quotes
2. **Use `Get-Content` instead of `cat`** to pipe files
3. **Use `-i` flag** when piping stdin to Docker: `docker exec -i`
4. **Double single quotes `''`** to escape them in SQL strings
5. **Use backslash `\"`** to escape double quotes in table names
6. **Check container names** with `docker ps` if commands fail
7. **Test queries in interactive psql first**: `docker exec -it tnhome-postgres psql -U postgres -d tnhome`

---

## 📚 Reference Commands

```powershell
# Prisma commands
npm.cmd run db:generate    # Generate Prisma client
npm.cmd run db:push        # Push schema to database
npm.cmd run db:studio      # Open Prisma Studio

# Docker commands
docker ps                  # List running containers
docker logs container      # View container logs
docker exec -it container bash  # Interactive shell

# Development
npm.cmd run dev            # Start dev server
npm.cmd run build          # Build for production
npm.cmd run type-check     # TypeScript validation
```

---

**Reference:** `CLAUDE.md` for full project documentation

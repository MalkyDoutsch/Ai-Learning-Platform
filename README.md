# AI Learning Platform

A web-based learning platform powered by AI that helps users generate personalized lessons across various subjects.

## Features

- **AI-Generated Lessons**: Create custom lessons using OpenAI's API
- **Category Management**: Organize lessons by categories and subcategories
- **User Management**: Track learning progress per user
- **Database Storage**: Persistent storage with PostgreSQL
- **Admin Interface**: Database management with pgAdmin

## Quick Start with Docker

### Prerequisites

- Docker
- Docker Compose v2

### Running the Application

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ai-Learning-Platform
   ```

2. **Start all services**
   ```bash
   docker compose up
   ```

   This will start:
   - **API Server**: http://localhost:8000
   - **PostgreSQL Database**: localhost:5432
   - **pgAdmin**: http://localhost:5050

3. **Access the services**
   - **API Documentation**: http://localhost:8000/docs (Swagger UI)
   - **API Health Check**: http://localhost:8000/
   - **Database Admin**: http://localhost:5050
     - Email: `dmalky100@gmail.com`
     - Password: `admin1234`

### API Endpoints

- `GET /` - Health check
- `GET /api/categories/` - List all categories and subcategories
- `POST /api/lessons/generate` - Generate a new lesson with AI
- `GET /api/lessons/history/{user_id}` - Get user's lesson history
- `GET /api/lessons/{lesson_id}` - Get specific lesson

### Configuration

The application uses the following default configuration:

#### Database (PostgreSQL)
- **Host**: localhost:5432
- **Database**: ai_learning
- **Username**: postgres
- **Password**: password1234

#### pgAdmin
- **URL**: http://localhost:5050
- **Email**: dmalky100@gmail.com
- **Password**: admin1234

#### API Configuration
- **Port**: 8000
- **Environment**: Development (with auto-reload)

### Development

#### Building individual services
```bash
# Build only the API service
docker compose build api

# Build all services
docker compose build
```

#### Viewing logs
```bash
# View all logs
docker compose logs

# View API logs only
docker compose logs api

# Follow logs in real-time
docker compose logs -f
```

#### Stopping services
```bash
# Stop all services
docker compose down

# Stop and remove volumes (clears database)
docker compose down -v
```

### Environment Variables

For production use, create a `.env` file with:

```env
# Database
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=ai_learning

# pgAdmin
PGADMIN_DEFAULT_EMAIL=your_email@example.com
PGADMIN_DEFAULT_PASSWORD=your_pgadmin_password

# API
DATABASE_URL=postgresql://your_postgres_user:your_secure_password@db:5432/ai_learning
SECRET_KEY=your_secret_key_here
OPENAI_API_KEY=your_openai_api_key
```

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   PostgreSQL    │
│   (Port 3000)   │◄──►│   (Port 8000)   │◄──►│   (Port 5432)   │
│   [Future]      │    │   FastAPI       │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │     pgAdmin     │
                       │   (Port 5050)   │
                       │   Web Interface │
                       └─────────────────┘
```

### Troubleshooting

#### Port conflicts
If you encounter port conflicts, you can modify the ports in `docker-compose.yml`:

```yaml
services:
  api:
    ports:
      - "8001:8000"  # Use port 8001 instead of 8000
  
  db:
    ports:
      - "5433:5432"  # Use port 5433 instead of 5432
  
  pgadmin:
    ports:
      - "5051:80"    # Use port 5051 instead of 5050
```

#### Database connection issues
- Ensure PostgreSQL container is running: `docker compose ps`
- Check database logs: `docker compose logs db`
- Verify connection string in the API service

#### API not starting
- Check API logs: `docker compose logs api`
- Ensure all Python dependencies are installed
- Verify the database is accessible

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker: `docker compose up`
5. Submit a pull request

### License

[Add your license information here]
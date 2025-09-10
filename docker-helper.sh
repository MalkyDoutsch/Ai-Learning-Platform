#!/bin/bash

# AI Learning Platform Docker Management Script

set -e

show_help() {
    echo "AI Learning Platform Docker Management"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  build       Build all Docker images"
    echo "  logs        Show logs for all services"
    echo "  logs-api    Show logs for API service only"
    echo "  logs-db     Show logs for database service only"
    echo "  status      Show status of all services"
    echo "  clean       Stop services and remove volumes (WARNING: deletes all data)"
    echo "  setup       First-time setup with environment file creation"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start     # Start the application"
    echo "  $0 logs -f   # Follow logs in real-time"
    echo "  $0 clean     # Stop and remove all data"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "Error: Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        echo "Error: Docker Compose is not installed or not available"
        exit 1
    fi
}

setup_env() {
    if [ ! -f .env ]; then
        echo "Creating .env file from .env.example..."
        cp .env.example .env
        echo "✅ .env file created. Please edit it with your actual values, especially OPENAI_API_KEY"
    else
        echo "ℹ️  .env file already exists"
    fi
}

start_services() {
    echo "🚀 Starting AI Learning Platform..."
    docker compose up -d
    echo ""
    echo "✅ Services started successfully!"
    echo ""
    echo "🌐 Access points:"
    echo "  • API Server: http://localhost:8000"
    echo "  • API Docs: http://localhost:8000/docs"
    echo "  • pgAdmin: http://localhost:5050"
    echo ""
    echo "📊 Database connection:"
    echo "  • Host: localhost:5432"
    echo "  • Database: ai_learning"
    echo "  • Username: postgres"
    echo "  • Password: password1234"
}

stop_services() {
    echo "🛑 Stopping AI Learning Platform..."
    docker compose down
    echo "✅ Services stopped successfully!"
}

restart_services() {
    echo "🔄 Restarting AI Learning Platform..."
    docker compose down
    docker compose up -d
    echo "✅ Services restarted successfully!"
}

build_images() {
    echo "🔨 Building Docker images..."
    docker compose build
    echo "✅ Images built successfully!"
}

show_logs() {
    if [ "$2" = "-f" ] || [ "$2" = "--follow" ]; then
        docker compose logs -f
    else
        docker compose logs
    fi
}

show_api_logs() {
    if [ "$2" = "-f" ] || [ "$2" = "--follow" ]; then
        docker compose logs -f api
    else
        docker compose logs api
    fi
}

show_db_logs() {
    if [ "$2" = "-f" ] || [ "$2" = "--follow" ]; then
        docker compose logs -f db
    else
        docker compose logs db
    fi
}

show_status() {
    echo "📊 Service Status:"
    docker compose ps
    echo ""
    echo "🔍 Quick Health Check:"
    
    # Check if API is responding
    if curl -s http://localhost:8000/ > /dev/null 2>&1; then
        echo "  ✅ API Server: Running"
    else
        echo "  ❌ API Server: Not responding"
    fi
    
    # Check if pgAdmin is responding
    if curl -s -I http://localhost:5050/ > /dev/null 2>&1; then
        echo "  ✅ pgAdmin: Running"
    else
        echo "  ❌ pgAdmin: Not responding"
    fi
}

clean_all() {
    echo "⚠️  WARNING: This will stop all services and delete all data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🧹 Cleaning up..."
        docker compose down -v
        echo "✅ All services stopped and data removed!"
    else
        echo "Operation cancelled"
    fi
}

# Main script logic
check_docker

case "${1:-help}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    build)
        build_images
        ;;
    logs)
        show_logs "$@"
        ;;
    logs-api)
        show_api_logs "$@"
        ;;
    logs-db)
        show_db_logs "$@"
        ;;
    status)
        show_status
        ;;
    clean)
        clean_all
        ;;
    setup)
        setup_env
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
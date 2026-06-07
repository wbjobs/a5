.PHONY: build run dev test clean

BINARY_NAME=bt-battle-server
MAIN_PATH=./cmd/server/main.go

build:
	@echo "Building backend..."
	@go build -o $(BINARY_NAME) $(MAIN_PATH)
	@echo "Build completed: $(BINARY_NAME)"

run: build
	@echo "Running backend..."
	@./$(BINARY_NAME)

dev:
	@echo "Running backend with hot reload..."
	@if command -v air > /dev/null 2>&1; then \
		air; \
	else \
		echo "air not found, running without hot reload..."; \
		go run $(MAIN_PATH); \
	fi

test:
	@echo "Running tests..."
	@go test -v ./...

clean:
	@echo "Cleaning..."
	@rm -f $(BINARY_NAME)
	@go clean
	@echo "Clean completed"

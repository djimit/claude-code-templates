# Makefile for claude-code-templates testing

.PHONY: test test-basic test-detailed test-interactive install-dev uninstall-dev help

# Install package locally for testing
install-dev:
	@echo "🔗 Linking package for local development..."
	npm link

# Uninstall local package
uninstall-dev:
	@echo "🔗 Unlinking package..."
	npm unlink -g claude-code-templates

# Run basic tests
test-basic: install-dev
	@echo "🧪 Running basic tests..."
	./test-commands.sh

# Run detailed tests
test-detailed: install-dev
	@echo "🔬 Running detailed tests..."
	./test-detailed.sh

# Test specific scenario
test-react: install-dev
	@echo "⚛️ Testing React scenario..."
	@mkdir -p /tmp/test-react
	@cd /tmp/test-react && claude-code-templates --language javascript-typescript --framework react --dry-run --yes
	@echo "✅ React test completed"
	@rm -rf /tmp/test-react

test-vue: install-dev
	@echo "💚 Testing Vue scenario..."
	@mkdir -p /tmp/test-vue
	@cd /tmp/test-vue && claude-code-templates --language javascript-typescript --framework vue --dry-run --yes
	@echo "✅ Vue test completed"
	@rm -rf /tmp/test-vue

test-node: install-dev
	@echo "🟢 Testing Node scenario..."
	@mkdir -p /tmp/test-node
	@cd /tmp/test-node && claude-code-templates --language javascript-typescript --framework node --dry-run --yes
	@echo "✅ Node test completed"
	@rm -rf /tmp/test-node

# Interactive test (manual)
test-interactive: install-dev
	@echo "🎯 Starting interactive test (you'll need to interact)..."
	@mkdir -p /tmp/test-interactive
	@cd /tmp/test-interactive && claude-code-templates --dry-run
	@rm -rf /tmp/test-interactive

# Run all tests
test: test-basic test-detailed
	@echo "🎉 All automated tests completed!"

# Check version works
test-version:
	@echo "📝 Testing version command..."
	@claude-code-templates --version

# Test before publish
pre-publish: test test-version
	@echo "✅ Ready for publishing!"

# Help
help:
	@echo "Available commands:"
	@echo "  make install-dev    - Install package locally for testing"
	@echo "  make test-basic     - Run basic test suite"
	@echo "  make test-detailed  - Run detailed test suite"
	@echo "  make test-react     - Test React scenario"
	@echo "  make test-vue       - Test Vue scenario"
	@echo "  make test-node      - Test Node scenario"
	@echo "  make test-interactive - Manual interactive test"
	@echo "  make test           - Run all automated tests"
	@echo "  make pre-publish    - Full test before publishing"
	@echo "  make uninstall-dev  - Uninstall local package"
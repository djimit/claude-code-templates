#!/usr/bin/env python3.11
"""
E2B Claude Code Sandbox Launcher
Executes Claude Code prompts in isolated E2B cloud sandbox
"""

import os
import sys
import json

# Debug: Print Python path information
print(f"Python executable: {sys.executable}")
print(f"Python version: {sys.version}")
print(f"Python path: {sys.path[:3]}...")  # Show first 3 paths

try:
    from e2b import Sandbox
    print("✓ E2B imported successfully")
except ImportError as e:
    print(f"✗ E2B import failed: {e}")
    print("Trying to install E2B...")
    import subprocess
    # Try different installation methods for different Python environments
    install_commands = [
        [sys.executable, '-m', 'pip', 'install', '--user', 'e2b'],  # User install first
        [sys.executable, '-m', 'pip', 'install', '--break-system-packages', 'e2b'],  # System packages
        [sys.executable, '-m', 'pip', 'install', 'e2b']  # Default fallback
    ]
    
    result = None
    for cmd in install_commands:
        print(f"Trying: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print("✓ Installation successful")
            break
        else:
            print(f"✗ Failed: {result.stderr.strip()[:100]}...")
    
    if result is None:
        result = subprocess.run([sys.executable, '-m', 'pip', 'install', 'e2b'], 
                              capture_output=True, text=True)
    print(f"Install result: {result.returncode}")
    if result.stdout:
        print(f"Install stdout: {result.stdout}")
    if result.stderr:
        print(f"Install stderr: {result.stderr}")
    
    # Try importing again
    try:
        from e2b import Sandbox
        print("✓ E2B imported successfully after install")
    except ImportError as e2:
        print(f"✗ E2B still failed after install: {e2}")
        sys.exit(1)

# Try to import and use dotenv if available, but don't fail if it's not
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # dotenv is optional since we can get keys from command line arguments
    pass

def main():
    
    # Parse command line arguments
    if len(sys.argv) < 2:
        print("Usage: python e2b-launcher.py <prompt> [components_to_install] [e2b_api_key] [anthropic_api_key]")
        sys.exit(1)
    
    prompt = sys.argv[1]
    components_to_install = sys.argv[2] if len(sys.argv) > 2 else ""
    
    # Get API keys from command line arguments or environment variables
    e2b_api_key = sys.argv[3] if len(sys.argv) > 3 else os.getenv('E2B_API_KEY')
    anthropic_api_key = sys.argv[4] if len(sys.argv) > 4 else os.getenv('ANTHROPIC_API_KEY')
    
    if not e2b_api_key:
        print("Error: E2B API key is required")
        print("Provide via command line argument or E2B_API_KEY environment variable")
        sys.exit(1)
    
    if not anthropic_api_key:
        print("Error: Anthropic API key is required")
        print("Provide via command line argument or ANTHROPIC_API_KEY environment variable")
        sys.exit(1)
    
    try:
        # Create E2B sandbox with Claude Code template with retry logic
        print("🚀 Creating E2B sandbox with Claude Code...")
        
        # Try creating sandbox with retries for WebSocket issues
        max_retries = 3
        retry_count = 0
        sbx = None
        
        while retry_count < max_retries and sbx is None:
            try:
                if retry_count > 0:
                    print(f"🔄 Retry {retry_count}/{max_retries - 1} - WebSocket connection...")
                
                sbx = Sandbox(
                    template="anthropic-claude-code",
                    api_key=e2b_api_key,
                    env_vars={
                        'ANTHROPIC_API_KEY': anthropic_api_key,
                    },
                    timeout=30,  # Shorter timeout for connection attempts
                )
                print(f"✅ Sandbox created: {sbx.sandbox_id}")
                break
                
            except Exception as e:
                error_msg = str(e).lower()
                if "websocket" in error_msg or "connection" in error_msg or "timeout" in error_msg:
                    retry_count += 1
                    if retry_count < max_retries:
                        print(f"⚠️  WebSocket connection failed (attempt {retry_count}), retrying in 3 seconds...")
                        import time
                        time.sleep(3)
                        continue
                    else:
                        print(f"❌ WebSocket connection failed after {max_retries} attempts")
                        print("💡 This might be due to:")
                        print("   • Network/firewall restrictions blocking WebSocket connections")
                        print("   • Temporary E2B service issues")
                        print("   • Corporate proxy blocking WebSocket traffic")
                        print("💡 Try:")
                        print("   • Running from a different network")
                        print("   • Checking your firewall/proxy settings")
                        print("   • Waiting a few minutes and trying again")
                        raise e
                else:
                    # Non-WebSocket error, don't retry
                    raise e
        
        if sbx is None:
            raise Exception("Failed to create sandbox after all retry attempts")
        
        # Install components if specified
        if components_to_install:
            print("📦 Installing specified components...")
            install_result = sbx.commands.run(
                f"npx claude-code-templates@latest {components_to_install}",
                timeout=120,  # 2 minutes for component installation
            )
            
            if install_result.exit_code != 0:
                print(f"⚠️  Component installation warnings:")
                print(install_result.stderr)
            else:
                print("✅ Components installed successfully")
        
        # Execute Claude Code with the prompt
        print(f"🤖 Executing Claude Code with prompt: '{prompt[:50]}{'...' if len(prompt) > 50 else ''}'")
        
        # Build Claude Code command
        claude_command = f"echo '{prompt}' | claude -p --dangerously-skip-permissions"
        
        result = sbx.commands.run(
            claude_command,
            timeout=0,  # No timeout for Claude Code execution
        )
        
        print("=" * 60)
        print("🎯 CLAUDE CODE OUTPUT:")
        print("=" * 60)
        print(result.stdout)
        
        if result.stderr:
            print("=" * 60)
            print("⚠️  STDERR:")
            print("=" * 60)
            print(result.stderr)
        
        # List generated files
        print("=" * 60)
        print("📁 GENERATED FILES:")
        print("=" * 60)
        
        files_result = sbx.commands.run("find . -type f -name '*.html' -o -name '*.js' -o -name '*.css' -o -name '*.py' -o -name '*.json' -o -name '*.md' | head -20")
        if files_result.stdout.strip():
            print(files_result.stdout)
        else:
            print("No common files generated")
        
        print("=" * 60)
        print(f"✅ Execution completed successfully")
        print(f"🗂️  Sandbox ID: {sbx.sandbox_id}")
        print("💡 Note: Sandbox will be automatically destroyed")
        
    except Exception as e:
        print(f"❌ Error executing Claude Code in sandbox: {str(e)}")
        sys.exit(1)
    
    finally:
        # Cleanup sandbox
        try:
            if 'sbx' in locals():
                sbx.kill()
                print("🧹 Sandbox cleaned up")
        except Exception as cleanup_error:
            print(f"⚠️  Cleanup warning: {cleanup_error}")

if __name__ == "__main__":
    main()
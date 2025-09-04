#!/usr/bin/env python3
"""
E2B Claude Code Sandbox Launcher
Executes Claude Code prompts in isolated E2B cloud sandbox
"""

import os
import sys
import json
from e2b import Sandbox

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
        # Create E2B sandbox with Claude Code template
        print("🚀 Creating E2B sandbox with Claude Code...")
        sbx = Sandbox(
            "anthropic-claude-code",
            envs={
                'ANTHROPIC_API_KEY': anthropic_api_key,
            },
            timeout=60 * 5,  # 5 minutes timeout
        )
        
        print(f"✅ Sandbox created: {sbx.sandbox_id}")
        
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
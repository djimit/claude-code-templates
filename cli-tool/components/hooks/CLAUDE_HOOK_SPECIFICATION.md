# Claude Code Hooks Specification for AI

## CRITICAL: Hook JSON Structure Format

All hooks MUST follow this exact structure for Claude Code compatibility:

```json
{
  "description": "Human-readable description of what this hook does",
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "bash-command-string"
          }
        ]
      }
    ]
  }
}
```

## Event Types (EventName)
- `PreToolUse` - Before tool execution
- `PostToolUse` - After successful tool execution  
- `Notification` - On Claude Code notifications
- `UserPromptSubmit` - When user submits prompt
- `Stop` - When main agent finishes
- `SubagentStop` - When subagent finishes
- `PreCompact` - Before context compaction
- `SessionStart` - On session start/resume

## Tool Matchers (ToolPattern)
- `*` - Match all tools
- `Edit` - File editing operations
- `Write` - File writing operations
- `MultiEdit` - Multiple file edits
- `Bash` - Shell commands
- `Read` - File reading
- `Glob` - Pattern matching
- `Grep` - Content search
- `Task` - Subagent tasks
- `WebFetch|WebSearch` - Web operations (regex supported)
- `Edit|Write|MultiEdit` - Multiple tools (pipe-separated regex)

## Command Structure
- `type`: Always "command" (only supported type)
- `command`: Shell command with environment variables:
  - `$CLAUDE_TOOL_NAME` - Name of executed tool
  - `$CLAUDE_TOOL_FILE_PATH` - File path for file operations
  - `$CLAUDE_PROJECT_DIR` - Project root directory

## Multi-Event Example
```json
{
  "description": "Track all file operations",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command", 
            "command": "echo \"[PRE] $CLAUDE_TOOL_NAME on $CLAUDE_TOOL_FILE_PATH\" >> ~/.claude/activity.log"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"[POST] $CLAUDE_TOOL_NAME completed\" >> ~/.claude/activity.log"
          }
        ]
      }
    ]
  }
}
```

## Best Practices for AI Hook Generation
1. Always use array structure for events (not object)
2. Include error suppression: `2>/dev/null || true`
3. Check file existence before operations: `[[ -f "$FILE" ]]`
4. Use conditional logic for tool-specific behavior
5. Include descriptive descriptions for user understanding
6. Test commands work across different shells (bash/zsh)

## Anti-Patterns (NEVER DO THIS)
```json
❌ WRONG - Old format:
{
  "hooks": {
    "PostToolUse": {
      "Edit": "command"
    }
  }
}

❌ WRONG - Direct string:
{
  "hooks": {
    "PostToolUse": "command"
  }
}

✅ CORRECT - Array format:
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [{"type": "command", "command": "command"}]
      }
    ]
  }
}
```

## Validation Checklist
- [ ] Uses array structure for all events
- [ ] Has matcher field for PreToolUse/PostToolUse
- [ ] Commands include error handling
- [ ] Description explains hook purpose
- [ ] Environment variables used correctly
- [ ] Cross-platform compatibility considered

This specification ensures all AI-generated hooks work correctly with Claude Code's hook system.
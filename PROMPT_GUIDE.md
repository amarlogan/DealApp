# ⚡ HuntMyDeal: Prompting for Efficiency

To save tokens and get faster, more accurate results from AI agents, use these structured templates.

## 🔌 Modifying Existing Features
**Strategy**: Be surgical. Give the exact path and the exact change.

**Template:**
```markdown
Analyze and modify [FILE_PATH].
Problem: [DESCRIPTION]
Requirement: [SPECIFIC_CHANGE]
Constraint: [e.g. "Do not change the prop types", "Return only code diffs"]
```

## 🏗️ Building New Features
**Strategy**: Reference the Compass and established patterns.

**Template:**
```markdown
Build a new feature: [FEATURE_NAME].
1. Context: See `COMPASS.md` for current DB schema and route structure.
2. Logic: Implement [BACKEND_LOGIC].
3. UI: Create [FILE_PATH] following the "Server Page + Client Manager" pattern.
4. Styling: Reuse styles from [EXISTING_COMPONENT].
```

## 🐞 Debugging Issues
**Strategy**: Provide logs and narrow the search space.

**Template:**
```markdown
Fix the following error in [COMPONENT_NAME]:
Error: [PASTE_ERROR_LOG]
Suspected File: [FILE_PATH]
Action: Investigate and fix.
```

## 💡 Pro-Tips for Token Savings
- **Fresh Chats**: Start a new conversation for every new feature.
- **No Explanations**: Append "No explanation needed" to save output tokens.
- **Reference Compass**: Always start a task by asking the AI to "Read `COMPASS.md`".
- **Grep over LS**: Use `grep_search` to find code rather than listing all directories.

---
description: 为所有未提交的更改创建新的提交
---

# 提交更改 (Commit Changes)

1. 运行 `git status && git diff HEAD && git status --porcelain` 以查看哪些文件未提交
2. 添加未追踪和更改的文件
3. 使用适当的信息添加原子提交信息
4. 添加一个标签，如 "feat", "fix", "docs", "style", "refactor", "perf", "test", "chore" 等，以反映我们的工作

示例: `git commit -m "feat(users): add user registration endpoint"`

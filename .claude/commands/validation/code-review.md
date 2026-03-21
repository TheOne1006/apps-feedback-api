---
description: 提交前的技术代码审查，用于检查质量和错误
---

# 代码审查 (Code Review)

对最近更改的文件执行技术代码审查。

## 核心原则

审查哲学：

- 简单是终极的复杂 - 每一行代码都应该有存在的理由
- 代码被阅读的次数远多于被编写的次数 - 优化可读性
- 最好的代码往往是你没有写的代码
- 优雅源于意图的清晰和表达的简洁

## 审查内容

首先收集代码库上下文以了解代码库标准和模式。

首先检查：

- `CLAUDE.md`
- `README.md`
- `src/common` 和 `src/core` 中的关键文件
- `.claude/reference` 目录中的文档标准

在你有了很好的理解之后：

运行这些命令：

```bash
git status
git diff HEAD
git diff --stat HEAD
```

然后检查新文件列表：

```bash
git ls-files --others --exclude-standard
```

阅读每个新文件的全部内容。阅读每个更改文件的全部内容（不仅仅是差异），以了解完整的上下文。

对于每个更改的文件或新文件，分析：

1. **逻辑错误**
   - 差一错误 (Off-by-one errors)
   - 不正确的条件判断
   - 缺少错误处理 (Exception Filters)
   - 竞态条件

2. **安全问题**
   - SQL 注入漏洞 (Prisma 通常会处理，但在使用 `queryRaw` 时需注意)
   - XSS 漏洞
   - 不安全的数据处理
   - 暴露的机密或 API 密钥

3. **性能问题**
   - N+1 查询 (Prisma `include` vs `select`)
   - 低效的算法
   - 内存泄漏
   - 不必要的计算

4. **代码质量**
   - 违反 DRY 原则
   - 过于复杂的函数
   - 命名不佳
   - 缺少类型提示/注释 (TypeScript Strict Mode)

5. **遵守代码库标准和现有模式**
   - 遵守 `CLAUDE.md` 和 `.claude/reference` 中记录的标准
   - Linting, typing 和 formatting 标准 (ESLint, Prettier)
   - 日志标准 (Winston)
   - 测试标准 (Jest, Supertest)
   - DTO 验证标准 (class-validator)

## 验证问题是否真实

- 针对发现的问题运行特定的测试
- 确认类型错误是合法的
- 结合上下文验证安全问题

## 输出格式

保存新文件到 `.claude/code-reviews/[appropriate-name].md`

**统计:**

- 修改的文件: 0
- 添加的文件: 0
- 删除的文件: 0
- 新增行数: 0
- 删除行数: 0

**对于发现的每个问题:**

```
严重程度: critical|high|medium|low
文件: path/to/file.ts
行号: 42
描述: 问题描述
建议: 建议的修复方案
```

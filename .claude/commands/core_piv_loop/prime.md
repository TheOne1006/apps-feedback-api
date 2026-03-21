---
description: 启动具备代码库理解能力的代理 (Prime Agent)
---

# Prime: 加载项目上下文

## 目标

通过分析结构、文档和关键文件，建立对代码库的全面理解。

## 流程

### 1. 分析项目结构

列出所有被追踪的文件：
!`git ls-files`

显示目录结构：
运行：`tree -L 3 -I 'node_modules|dist|build|.git|.idea|.vscode|coverage'`

### 2. 阅读核心文档

- 阅读 `CLAUDE.md` 或类似的全局规则文件
- 阅读项目根目录和主要目录下的 README 文件
- 阅读任何架构文档 (如 `.claude/PRD.md`)

### 3. 识别关键文件

根据结构，识别并阅读：
- 主要入口点 (`src/main.ts`, `src/app.module.ts`)
- 核心配置文件 (`package.json`, `nest-cli.json`, `tsconfig.json`, `prisma/schema.prisma`)
- 关键模型/Schema 定义
- 重要的服务或控制器文件 (如 `src/common/` 下的通用模块)

### 4. 了解当前状态

检查最近的活动：
!`git log -10 --oneline`

检查当前分支和状态：
!`git status`

## 输出报告

提供一份简明的摘要，涵盖：

### 项目概览
- 应用程序的目的和类型
- 主要技术和框架 (NestJS, Prisma, 等)
- 当前版本/状态

### 架构
- 整体结构和组织 (模块化架构)
- 识别出的关键架构模式 (如 Clean Architecture, CQRS)
- 重要目录及其用途

### 技术栈
- 语言和版本 (TypeScript)
- 框架和主要库 (NestJS, Prisma, PostgreSQL, Winston)
- 构建工具和包管理器 (npm)
- 测试框架 (Jest, Supertest)

### 核心原则
- 遵守的代码风格和公约
- 文档标准 (Swagger)
- 测试方法 (单元测试, E2E)

### 当前状态
- 活动分支
- 最近的更改或开发重点
- 任何直接的观察或关注点

**使此摘要易于浏览 - 使用要点和清晰的标题。**

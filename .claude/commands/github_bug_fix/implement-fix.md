---
description: 根据 RCA 文档实施 GitHub 问题的修复
argument-hint: [github-issue-id]
allowed-tools: Read, Write, Edit, Bash(npm:*), Bash(jest:*)
---

# 实施修复: GitHub Issue #$ARGUMENTS

## 先决条件

**此命令根据 RCA 文档实施 GitHub 问题的修复:**
- 在具有 GitHub 远程源的本地 Git 存储库中工作
- RCA 文档存在于 `.claude/rca/issue-$ARGUMENTS.md`
- GitHub CLI 已安装并验证（可选，用于状态更新）

## 参考 RCA 文档

读取 RCA: `.claude/rca/issue-$ARGUMENTS.md`

**可选 - 查看 GitHub 问题以获取上下文:**
```bash
gh issue view $ARGUMENTS
```

## 实施说明

### 1. 阅读并理解 RCA

- 彻底阅读**整个** RCA 文档
- 查看 GitHub 问题详情 (issue #$ARGUMENTS)
- 理解根本原因
- 审查拟议的修复策略
- 记录所有要修改的文件
- 审查测试要求

### 2. 验证当前状态

在进行更改之前：
- 确认问题仍然存在（重现问题）
- 检查受影响文件的当前状态
- 审查对这些文件的任何最近更改

### 3. 实施修复

遵循 RCA 的 "拟议的修复方案" 部分：

**对于每个要修改的文件：**

#### a. 阅读现有文件
- 了解当前实现
- 定位 RCA 中提到的特定代码

#### b. 进行修复
- 按照 RCA 中的描述实施更改
- 严格遵循修复策略
- 保持代码风格和公约 (NestJS 风格)
- 如果修复不明显，请添加注释

#### c. 处理相关更改
- 更新受修复影响的任何相关代码
- 确保整个代码库的一致性
- 如果需要，更新导入

### 4. 添加/更新测试

遵循 RCA 中的 "验证计划"：

**创建测试用例以：**
1. 验证修复解决了问题
2. 测试与错误相关的边缘情况
3. 确保相关功能没有退化
4. 测试引入的任何新代码路径

**测试文件位置：**
- 遵循项目的测试结构 (`*.spec.ts`, `test/*.e2e-spec.ts`)
- 镜像源文件位置
- 使用描述性的测试名称

**测试实现示例 (Jest):**
```typescript
describe('Issue #$ARGUMENTS fix', () => {
  it('should handle [scenario] correctly', async () => {
    // Arrange - 设置导致错误的场景
    // Act - 执行以前失败的代码
    // Assert - 验证现在是否正常工作
  });
});
```

### 5. 运行验证

执行 RCA 中的验证命令：

```bash
# 运行 Lint 检查
npm run lint

# 运行格式化检查
npm run format

# 运行单元测试
npm test

# 运行 E2E 测试 (如果相关)
npm run test:e2e
```

### 6. 完成

- 确保所有测试通过
- 确保代码符合规范
- 准备提交更改

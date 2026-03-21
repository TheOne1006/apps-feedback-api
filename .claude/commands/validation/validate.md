---
description: 运行项目的全面验证
---

# 验证项目 (Validate Project)

运行 NestJS Startkit 项目的全面验证。

按顺序执行以下命令并报告结果：

## 1. 代码风格和 Linting

```bash
npm run lint
```

**预期:** "All files pass linting." 或无错误输出。

## 2. 格式化检查

```bash
npm run format
```

**预期:** 文件被格式化，无错误。

## 3. 单元测试

```bash
npm test
```

**预期:** 所有测试通过，执行时间合理。

## 4. 单元测试覆盖率

```bash
npm run test:cov
```

**预期:** 覆盖率符合项目标准 (通常 >= 80%)。

## 5. E2E 测试

确保数据库容器正在运行 (如果需要):

```bash
npm run test:e2e
```

**预期:** 所有端到端测试通过。

## 6. 构建验证

```bash
npm run build
```

**预期:** 构建成功完成，输出到 `dist/` 目录。

## 7. 本地服务器验证 (可选)

如果服务器尚未运行，请启动它：

```bash
npm run start:dev &
```

等待几秒钟启动，然后测试：

```bash
# 测试健康检查端点 (假设存在)
curl -s http://localhost:3000/api/health | head -c 200

# 检查 Swagger 文档
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/api
```

**预期:** 健康检查返回 JSON 响应，Swagger 文档返回 HTTP 200。

停止服务器：

```bash
# 查找并杀死进程
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
```

## 8. 总结报告

在所有验证完成后，提供一份总结报告，包括：

- Linting 状态
- 测试通过/失败情况
- 覆盖率百分比
- 构建状态
- 遇到的任何错误或警告
- 整体健康评估 (通过/失败)

**使用章节和状态指示器清晰地格式化报告**

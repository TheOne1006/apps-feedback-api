# Feedback API 测试设计文档

日期: 2026-03-21

## 概述

为 Feedback API 添加完整的单元测试和集成测试覆盖。

## 测试文件结构

```
src/feedbacks/
├── __tests__/
│   ├── feedbacks.service.spec.ts    # 单元测试: Service
│   └── feedbacks.controller.spec.ts  # 单元测试: Controller
test/
└── feedbacks.e2e-spec.ts           # 集成测试: API 端点
```

## 单元测试: FeedbacksService

### 测试用例

| 测试用例 | 说明 |
|---------|------|
| `createFeedback - should create feedback successfully` | 创建反馈，验证 JSON 文件和图片 |
| `createFeedback - should save images in device directory` | 验证图片路径 `uploads/{device_id}/{uuid}.jpg` |
| `checkDeviceLimit - should allow when under limit` | device_id 3次内允许 |
| `checkDeviceLimit - should throw 429 when limit exceeded` | device_id 第4次返回429 |
| `checkIpLimit - should allow when under limit` | IP 3次内允许 |
| `checkIpLimit - should throw 429 when limit exceeded` | IP 第4次返回429 |
| `checkIpLimit - should cleanup expired entries` | 过期条目清理 |
| `checkIpLimit - should delete key when all entries expire` | 空数组时删除key（内存泄漏） |

### Mock 策略

- 使用 `fs` mock 替代真实文件系统操作
- `ipLimitMap` 使用真实内存存储（受控测试）

## 单元测试: FeedbacksController

### 测试用例

| 测试用例 | 说明 |
|---------|------|
| `create - should return 201 with feedback data` | 验证响应格式 |
| `create - should call service with correct params` | 验证参数传递 |

### Mock 策略

- Mock `FeedbacksService`
- 使用 `@nestjs/testing` 的 `HttpAdapterHost`

## 集成测试: API 端点

### 测试用例

| 测试用例 | 说明 |
|---------|------|
| `POST /api/v1/feedback - should create feedback` | 成功创建 |
| `POST /api/v1/feedback - should return 400 for missing content` | content 必填验证 |
| `POST /api/v1/feedback - should return 400 for invalid content length` | content 长度验证 |
| `POST /api/v1/feedback - should return 429 when device_id limit exceeded` | device_id 限流 |
| `POST /api/v1/feedback - should return 400 for missing device_id` | device_id 必填验证 |

### 测试环境

- 使用临时目录进行文件操作
- 测试完成后清理临时文件
- 每次测试前重置 `ipLimitMap`

## 测试工具

- **Framework**: Jest
- **Testing**: @nestjs/testing
- **HTTP**: supertest
- **断言**: Jest built-in assertions

# Feedback Rate Limit Guard 设计文档

日期: 2026-03-21

## 概述

为 Feedback API 添加限流保护，基于 IP 和 device_id 进行限制。

## 限流规则

- **IP**: 3 次请求 / 30 分钟（内存存储，带 TTL 过期）
- **device_id**: 3 次请求 / 30 分钟（复用 feedback JSON 文件）

## 实现方式

由于 NestJS 的 Guard 在 multipart/form-data 请求的 body 解析之前运行，无法访问 `request.body`，因此采用 **Service 层实现限流** 而非 Guard。

### Rate Limit Guard

**文件**: `src/feedbacks/feedbacks.guard.ts`

保留文件但不再使用（作为参考）。

### Rate Limit Logic (Service)

**文件**: `src/feedbacks/feedbacks.service.ts`

- 使用内存 Map 存储 IP 限流数据
- device_id 限流读取现有 JSON 文件统计最近 30 分钟内的请求数
- 限流检查在 `createFeedback` 方法开头执行
- Controller 通过 `@Ip()` decorator 传递客户端 IP
- 超出限制返回 429 Too Many Requests

## 数据结构

### IP 限流（内存）

```typescript
Map<string, number[]>
// 键: IP 地址
// 值: 时间戳数组（每个请求一个）
```

### device_id 限流

读取 `uploads/{device_id}.json`，统计 `created_at` 在最近 30 分钟内的记录数。

## 错误响应

```json
{
  "statusCode": 429,
  "code": 429,
  "message": "Too many requests. Please try again later."
}
```

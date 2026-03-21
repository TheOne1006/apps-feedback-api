# Feedback API 设计文档

日期: 2026-03-21

## 概述

构建一个用于移动端用户反馈的 API，不使用数据库，所有数据以 JSON 文件形式存储。

## 目录结构

```
src/
├── feedbacks/
│   ├── feedbacks.controller.ts    # POST /api/v1/feedback
│   ├── feedbacks.module.ts        # 模块定义
│   ├── feedbacks.service.ts       # 文件存储逻辑
│   ├── dtos/
│   │   ├── index.ts
│   │   └── create-feedback.dto.ts # 请求验证
│   └── interfaces/
│       └── feedback.interface.ts  # 数据结构定义
├── common/                        # 保留（pipes, decorators, interceptors）
├── core/                          # 保留（logger, filters）
├── app.module.ts
└── main.ts

uploads/                           # 数据存储目录
├── {device_id}.json              # 该设备的反馈数组
└── {device_id}/                  # 该设备的图片目录
    ├── {uuid}.jpg
    └── {uuid}.jpg
```

## 数据结构

### JSON 文件格式 (`uploads/{device_id}.json`)

```json
{
  "device_id": "abc123",
  "feedbacks": [
    {
      "id": "uuid-v4",
      "content": "问题描述内容",
      "contact": "user@email.com",
      "images": ["uuid-1.jpg", "uuid-2.jpg"],
      "created_at": "2026-03-21T10:30:00.000Z"
    }
  ]
}
```

### TypeScript 接口

```typescript
interface FeedbackEntry {
  id: string;           // UUID v4
  content: string;      // 1-100 字符
  contact?: string;     // 可选，最大 50 字符
  images: string[];     // 图片文件名数组，最多 3 个
  created_at: string;   // ISO 8601
}

interface FeedbackFile {
  device_id: string;
  feedbacks: FeedbackEntry[];
}
```

## API 规格

### 端点

- **URL**: `POST /api/v1/feedback`
- **Content-Type**: `multipart/form-data`

### 请求字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `content` | String | 是 | 问题建议（1-100 字符） |
| `contact` | String | 否 | 联系方式（最大 50 字符） |
| `device_id` | String | 是 | 设备 Vendor ID |
| `images[0-2]` | File (JPEG) | 否 | 截图文件（最多 3 张，每张 ≤ 1MB） |

### DTO 验证

```typescript
class CreateFeedbackDto {
  @IsString()
  @Length(1, 100)
  content: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  contact?: string;

  @IsString()
  @IsNotEmpty()
  device_id: string;
}
```

### 响应格式

```json
{
  "code": 201,
  "message": "Feedback submitted successfully",
  "data": {
    "id": "uuid-v4",
    "created_at": "2026-03-21T10:30:00.000Z"
  }
}
```

## 存储策略

### JSON 文件
- 路径: `./uploads/{device_id}.json`
- 每个设备一个文件，包含该设备所有反馈的数组
- 新反馈追加到数组末尾

### 图片文件
- 路径: `./uploads/{device_id}/{uuid}.jpg`
- 使用 UUID v4 命名，避免冲突
- JSON 中只存储文件名（不含路径）

### 并发
- 无需处理并发（每设备最多 1 分钟 1 次请求）

## 清理计划

### 删除的文件/目录

```
src/users/                   # 用户模块
src/prisma/                  # Prisma 服务
src/common/auth/             # 认证相关
src/setting.controller.ts    # 设置控制器
prisma/                      # Prisma schema 和 seed
prisma.config.ts             # Prisma 配置
```

### 移除的依赖

- `@prisma/client`
- `prisma`
- `bcrypt`
- `@types/bcrypt`

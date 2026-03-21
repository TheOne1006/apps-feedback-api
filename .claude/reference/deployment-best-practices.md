# 部署最佳实践 (Deployment Best Practices)

关于如何构建、容器化和部署 NestJS 应用程序的指南。

---

## 目录

1. [Docker 容器化 (Docker Containerization)](#1-docker-容器化-docker-containerization)
2. [Docker Compose 编排 (Docker Compose Orchestration)](#2-docker-compose-编排-docker-compose-orchestration)
3. [进程管理 (Process Management)](#3-进程管理-process-management)
4. [健康检查 (Health Checks)](#4-健康检查-health-checks)

---

## 1. Docker 容器化 (Docker Containerization)

本项目采用多阶段构建 (Multi-Stage Builds) 来优化镜像大小和构建缓存。

### Dockerfile 解析

基于 `node:24-bullseye-slim`，分为 `builder`、`cache` 和最终运行阶段。

```dockerfile
# Build Stage
FROM node:24-bullseye AS builder
WORKDIR /usr/app
COPY ./package.json /usr/app/package.json
COPY ./package-lock.json /usr/app/package-lock.json
# 使用镜像源加速
RUN npm config set registry https://registry.npmmirror.com/
RUN npm install
COPY ./config /usr/app/config
COPY ./nest-cli.json /usr/app/nest-cli.json
COPY ./tsconfig.json /usr/app/tsconfig.json
COPY ./src /usr/app/src
RUN npm run build

# Cache/Production Deps Stage
FROM node:24-bullseye-slim as cache
LABEL stage=cache
RUN npm config set registry https://registry.npmmirror.com/
WORKDIR /usr/app
COPY ./package.json /usr/app/package.json
COPY ./package-lock.json /usr/app/package-lock.json
COPY ./config /usr/app/config
COPY ./nest-cli.json /usr/app/nest-cli.json
COPY ./tsconfig.json /usr/app/tsconfig.json
# 仅安装生产依赖
RUN npm install --omit=dev

# Final Stage
FROM cache
# 从 builder 阶段复制构建产物
COPY --from=builder /usr/app/dist ./dist

# 暴露端口
EXPOSE 3000
# 设置生产环境变量
ENV NODE_ENV=production

# 启动应用
CMD npm run start:prod
```

### 最佳实践
- **多阶段构建**: 分离构建环境和运行环境，减小最终镜像体积。
- **镜像源**: 配置 npm registry 加速依赖安装。
- **Slim 镜像**: 使用 `bullseye-slim` 变体，平衡体积与兼容性。
- **生产模式**: 显式设置 `NODE_ENV=production` 并使用 `npm run start:prod`。

---

## 2. Docker Compose 编排 (Docker Compose Orchestration)

使用 `docker-compose.yml` 管理服务配置、卷挂载和网络。

### 配置示例

```yaml
version: '3.1'
services:
  my-nestjs-server:
      build: './'
      ports:
        - '3001:3000' # 宿主机端口:容器端口
      volumes:
        # 同步宿主机时间
        - '/etc/localtime:/etc/localtime:ro'
        # 挂载环境变量文件
        - './.env:/usr/app/.env:ro'
        # 持久化上传文件目录
        - './public/uploads:/usr/app/public/upload:rw'
        # 挂载证书文件 (如有)
        - './pem:/usr/app/pem:ro'
```

### 关键配置说明
- **Volumes (卷挂载)**:
  - `/etc/localtime`: 确保容器时间与宿主机一致，对日志记录很重要。
  - `.env`: 将敏感配置注入容器，避免打入镜像。
  - `public/uploads`: 确保文件上传等数据持久化，重启容器不丢失。
- **Ports**: 将容器的 3000 端口映射到宿主机的指定端口。

---

## 3. 进程管理 (Process Management)

### Node.js 进程
在 Docker 容器中，通常直接运行 `node` 进程 (或通过 npm script)，由 Docker Daemon 或编排工具（如 K8s）负责重启策略。

### PM2 (可选)
如果在非容器化环境（如 VM、裸机）部署，或者希望在容器内获得更高级的进程管理功能，可以使用 PM2。

- **集群模式**: 利用多核 CPU (`pm2 start dist/main.js -i max`)。
- **自动重启**: 崩溃后自动重启。
- **日志管理**: 自动轮转日志。
- **监控**: 提供实时的进程监控。

---

## 4. 健康检查 (Health Checks)

实现健康检查端点，以便负载均衡器或容器编排工具（K8s）监控应用状态。

### 最佳实践
- **Liveness Probe**: `/health/live` - 应用是否存活？
- **Readiness Probe**: `/health/ready` - 应用是否准备好接收流量（数据库连接是否正常）？

NestJS 提供了 `@nestjs/terminus` 模块来轻松实现健康检查。

```typescript
@Get('health')
@HealthCheck()
check() {
  return this.health.check([
    () => this.db.pingCheck('database'),
  ]);
}
```

FROM node:24-bullseye AS builder
WORKDIR /usr/app
COPY ./package.json /usr/app/package.json
COPY ./package-lock.json /usr/app/package-lock.json
RUN npm config set registry https://registry.npmmirror.com/
RUN npm install
COPY ./config /usr/app/config
COPY ./nest-cli.json /usr/app/nest-cli.json
COPY ./tsconfig.json /usr/app/tsconfig.json
COPY ./src /usr/app/src
RUN npm run build


FROM node:24-bullseye-slim as cache
LABEL stage=cache
RUN npm config set registry https://registry.npmmirror.com/
WORKDIR /usr/app

COPY ./package.json /usr/app/package.json
COPY ./package-lock.json /usr/app/package-lock.json
COPY ./config /usr/app/config
COPY ./nest-cli.json /usr/app/nest-cli.json
COPY ./tsconfig.json /usr/app/tsconfig.json
RUN npm install --omit=dev
FROM cache
COPY --from=builder /usr/app/dist ./dist

# COPY ./ /usr/app

EXPOSE 3000

ENV NODE_ENV=production

CMD npm run start:prod

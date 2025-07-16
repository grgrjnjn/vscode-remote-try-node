# 既存の Dev Container ベースイメージをそのまま流用
FROM mcr.microsoft.com/devcontainers/javascript-node:1-18-bullseye

# 作業ディレクトリ（任意）
WORKDIR /workspace

# 依存だけをインストール
RUN npm install node-fetch fetch-cookie tough-cookie jsdom

# コンテナ内操作を vscode ユーザーで行う（devcontainer.json の remoteUser に合わせる場合）
USER vscode

# HuntStyle - モンハンワイルズ 重ね着コーデ共有サービス

モンスターハンターワイルズの重ね着コーディネートを共有するPWAアプリケーションです。

## 技術スタック

- Vue 3 + TypeScript
- Vite
- TailwindCSS
- Vue Router
- PWA (Service Worker)

## 開発環境

```bash
# 依存関係のインストール
bun install

# 開発サーバー起動
bun run dev

# ビルド
bun run build

# プレビュー
bun run preview
```

## GitHub Pagesデプロイ

このプロジェクトはGitHub Actionsを使用してGitHub Pagesに自動デプロイされます。

### セットアップ手順

1. GitHubリポジトリの「Settings」→「Pages」に移動
2. Source を「GitHub Actions」に設定
3. `main`ブランチにプッシュすると自動的にデプロイされます

### デプロイURL

独自ドメイン設定後：https://yourdomain.com/
GitHub Pages（独自ドメインなし）：https://[username].github.io/HuntStyle/

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

#!/bin/bash
# 使い方: ./auto-coder.sh "タスク内容"
# 新しいブランチを切り、Claude Code にタスクを実行させ、変更があればコミットする。
set -euo pipefail

TASK_DESCRIPTION="${1:-}"
BRANCH_NAME="auto/$(date +%Y%m%d-%H%M%S)"

if [ -z "$TASK_DESCRIPTION" ]; then
  echo "使い方: ./auto-coder.sh \"タスク内容\""
  exit 1
fi

# 作業ツリーが汚れていたら止める（無関係な変更を巻き込まないため）
if [ -n "$(git status --porcelain)" ]; then
  echo "✖ 未コミットの変更があります。コミットかスタッシュしてから実行してください"
  exit 1
fi

# 1. 新しいブランチを作成
git checkout -b "$BRANCH_NAME"

# 2. Claude Code にタスクを投げる
#    全権限スキップではなく、ファイル編集と build / lint の実行だけを許可する
claude -p "
次のタスクを実行してください:
$TASK_DESCRIPTION

完了条件:
1. コードを実装/修正する
2. npm run build と npm run lint を実行し、エラーがあれば自分で修正する
3. 変更箇所の概要を簡潔に出力する
" \
  --permission-mode acceptEdits \
  --allowedTools "Read,Edit,Write,Glob,Grep,Bash(npm run build),Bash(npm run lint),Bash(git status),Bash(git diff:*)"

# 3. 変更があればコミット
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "feat(auto): $TASK_DESCRIPTION"
  echo "✔ タスク完了: ブランチ $BRANCH_NAME にコミットしました"
else
  echo "⚠ 変更はありませんでした"
fi

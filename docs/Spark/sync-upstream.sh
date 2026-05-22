# .git/hooks/post-merge or a shell script
  #!/bin/bash
  # sync-upstream.sh
  set -e
  git fetch upstream
  git checkout canary
  git merge upstream/canary --ff-only
  git checkout spark
  git rebase canary
  echo "Spark is up to date with upstream canary"

  # chmod +x sync-upstream.sh
  # ./sync-upstream.sh  # run whenever upstream updates
  # git push origin spark --force-with-lease

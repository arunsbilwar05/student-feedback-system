# Git & GitHub Demonstration (run from the project root)

## 1. Repository creation
On github.com: **New repository** → name `student-feedback-system` → leave "Add README" unchecked → Create.
(Or with GitHub CLI: `gh repo create student-feedback-system --public`)

## 2. git init
```bash
git init -b main
git config user.name "Your Name"
git config user.email "you@example.com"
```
## 3. git add
```bash
git status
git add .
```
## 4. git commit
```bash
git commit -m "feat: initial Express API and React frontend"
```
## 5. git push
```bash
git remote add origin https://github.com/<your-username>/student-feedback-system.git
git push -u origin main
```
## 6. Branch creation
```bash
git checkout -b feature/rating-validation
git branch            # shows the current branch
```
Make a small change (e.g. edit a message in `backend/server.js`), then:
```bash
git add backend/server.js
git commit -m "feat: improve rating validation message"
git push -u origin feature/rating-validation
```
## 7. Branch merging
Local merge:
```bash
git checkout main
git merge feature/rating-validation
git push origin main
git log --oneline --graph
```
## 8. README creation
`README.md` is already included. To edit/commit it on its own:
```bash
git add README.md && git commit -m "docs: update README" && git push
```
## 9. Issue creation
GitHub → **Issues** → **New issue**, e.g. *"Add email notification to faculty on new feedback"* (label: enhancement).
CLI: `gh issue create --title "Add faculty email notification" --body "Notify faculty when feedback arrives." --label enhancement`

## 10. Pull request
```bash
git checkout -b feature/admin-csv-export
# ...make changes...
git add . && git commit -m "feat: export feedback as CSV (closes #1)"
git push -u origin feature/admin-csv-export
```
GitHub shows **Compare & pull request** → write a description mentioning `Closes #1` → Create pull request → review → **Merge pull request**. Then:
```bash
git checkout main && git pull
```
CLI: `gh pr create --fill` then `gh pr merge --merge`

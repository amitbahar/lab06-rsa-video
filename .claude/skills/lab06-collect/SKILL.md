---
name: lab06-collect
description: Collects a student's Lab 6 explainer video from the AICODE course for upload. Compresses the latest render, and packs the source, the script and an iteration log written from the Git history. Use when the student asks to collect or package their Lab 6 work.
allowed-tools: Read, Glob, Grep, Write, Read(~/.claude/projects/**), Read(~/.codex/sessions/**), Grep(~/.claude/projects/**), Grep(~/.codex/sessions/**), Bash(git log:*), Bash(git status:*), Bash(git archive:*), Bash(ffmpeg:*), Bash(ffprobe:*), Bash(npx remotion ffmpeg:*), Bash(npx remotion ffprobe:*), Bash(mkdir:*), Bash(ls:*), Bash(du:*), Bash(python3 -m zipfile:*)
---

# Lab 6: collect

## The context

A student in AICODE, a university course on programming with coding agents, made a short
explainer video with a coding agent during a two-hour lab. They wrote the script with the agent,
usually in `SCRIPT.md`, built the animation one scene at a time (often with Remotion or an
HTML page), and committed each iteration. They upload what you produce, and the lab instructor
plays the video at the end of the lab.

## The rules

- **Be quick:** about three minutes.
- **Ask nothing.** The student may be away. Where you cannot tell, write "unknown".
- **Change nothing in the project.** No edits, no commits, no installs, no renders. Write only
  into `lab06-upload/` in the repository root.
- **One command per call:** no `;`, `&&`, pipes or shell variables, so no call stops to ask for
  permission.

## 1. The video

Find the newest video file in the project (`.mp4`, `.mov`, `.webm`, `.mkv`), skipping
`node_modules/`, `.venv/` and `lab06-upload/`. Run `mkdir -p lab06-upload`, then compress the
video once:

```sh
ffmpeg -y -i <video> -vf "scale=-2:'min(720,ih)'" -c:v libx264 -preset veryfast -crf 28 -c:a aac -b:a 96k -movflags +faststart lab06-upload/lab06-video.mp4
```

If `ffmpeg` is not installed, use `npx remotion ffmpeg` with the same arguments. If there is no
video, say so in the log and go on: the rest still counts.

## 2. The source

```sh
git archive --format=zip -o lab06-upload/source.zip HEAD
```

It holds the committed files only. Run `git status --short` and note uncommitted work in the log.

## 3. The iteration log

Read `git log --reverse --format='%h %ad %s' --date=format:%H:%M --stat` and write
`lab06-upload/ITERATIONS.md`:

```markdown
# Lab 6 iterations

- Agent and model: <what built the video: the `"model"` values in this project's sessions in
  `~/.claude/projects/` or `~/.codex/sessions/`, if you find them in a minute; otherwise unknown>
- Stack: <e.g. Remotion + Kokoro>
- Video: <file>, <duration> s, <size before> → <size after> (or: no video)
- Commits: <N>, from <first time> to <last time>; median <M> minutes between commits
- First visual: <time and hash of the first commit with code that draws something>
- Uncommitted work: <none, or what `git status` shows>

| Time | Commit | What changed | Minutes since the last |
|---|---|---|---|
```

One row per commit, from its message and the files it touched.

## 4. Pack

```sh
python3 -m zipfile -c lab06-upload/lab06-bundle.zip lab06-upload/source.zip lab06-upload/ITERATIONS.md SCRIPT.md
```

If there is no `SCRIPT.md`, put in the file that holds the script, or leave it out. Then tell the
student, in two lines, which two files to upload (`lab06-upload/lab06-video.mp4` and
`lab06-upload/lab06-bundle.zip`) and their sizes.

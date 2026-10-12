# todo-list-app
A to-do list application with local storage functionality.

## Features
- Add tasks
- Mark tasks complete (or undo)
- Delete tasks, or clear all completed ones at once
- Filter by All, Active or Completed
- Tasks are saved in your browser's localStorage, so they survive a page reload

## Running it
There is no build step. Open `index.html` in any modern browser.

To serve it locally instead (useful on some browsers that restrict `file://` pages):

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files
- `index.html` — page structure
- `style.css` — styling (follows your system's light/dark setting)
- `app.js` — task logic and localStorage persistence

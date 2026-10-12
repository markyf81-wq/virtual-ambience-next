// A Worker keeps scheduling independent of React renders and foreground UI work.
setInterval(() => postMessage('tick'), 250);

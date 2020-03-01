require('draftlog').into(console);

const widget = (draw, render) => state => () => {
  draw(render(state));

  return widget(draw, render)(state);
};

const of = render => state => widget(console.draft(), render)(state);

const loader = state => () => {
  return state.frames[state.n++ % state.frames.length];
};

module.exports = {
  widget,
  of,
  loader,
  pointLoader: (options = {}) => loader({n: 0, frames: ['.', '..', '...'], ...options}),
  millLoader: (options = {}) => loader({n: 0, frames: ['/', '-', '\\', '|'], ...options})
};

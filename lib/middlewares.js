function isAuth(req, h) {
  if (!req.state.user) return h.redirect('/login').takeover();

  return h.continue;
}

module.exports = {
  isAuth,
};

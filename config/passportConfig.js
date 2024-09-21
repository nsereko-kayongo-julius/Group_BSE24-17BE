const passport = require("passport");
const User = require("../models/users");

module.exports = function (app) {
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Use local strategy
  passport.use(User.createStrategy());

  // Serialize and deserialize user for session management
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
};

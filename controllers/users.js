const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
    res.render("users/register");
}

module.exports.register = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password); //Passport will automatically save user's information to database
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to YelpCamp!");
            res.redirect("/campgrounds");
        });
    } catch (e) {
        req.flash("error", "This username or password have already taken");
        res.redirect("/register");
    }
}

module.exports.renderLogin = (req, res) => {
    res.render("users/login");
}

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back !");
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout(function (err) {
        if (err) return next(err);
        req.flash("success", "Goodbye !");
        res.redirect("/campgrounds");
    });
}
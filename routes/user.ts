import bcript from 'bcryptjs';
import express from "express";
import passport from 'passport';
import permitions from "../helpers/permitions.js";
import * as schemas from "../mongo/schemas.js";
console.log(permitions);

const router = express.Router();

router.get(`/`, permitions.logged(`login`, ``), (req: express.Request, res: any) => {
    res.render(`user/account`, {
        ...res.locals.fixedConfigs,
        title: `Account`,
        files: {
            styles: [

            ],
            scripts: [

            ]
        }
    });
});

router.get(`/selling`, permitions.logged(`login`, ``), (req: express.Request, res: express.Response) => {
    res.render(`user/selling`, {
        ...res.locals.fixedConfigs,
        title: `Your products`,
        files: {
            styles: [

            ],
            scripts: [

            ]
        }
    });
});

router.get(`/logout`, (req: express.Request, res: express.Response) => {
    req.logout();
    // req.flash(`flashSuccess`, `Unlogged successfully.`);
    // res.redirect(`${res.locals.fixedConfigs.HTTPs}${res.locals.fixedConfigs.HOST}:${res.locals.fixedConfigs.PORT}/`);
    res.redirect(`/`);
});

router.get(`/login`, permitions.unlogged(`/`, ``), (req: express.Request, res: express.Response) => {
    res.render(`user/login`, {
        ...res.locals.fixedConfigs,
        title: `Login`,
        files: {
            styles: {

            },
            scripts: {

            }
        }
    });
});
router.post(`/login`, (req, res, next) => {
    console.log(req.body);
    passport.authenticate(`local`, {
        successRedirect: `/`,
        failureRedirect: `/account/login`,
        failureFlash: true
    })(req, res, next);
});

router.get(`/register`, permitions.unlogged(`/`, ``), (req: express.Request, res: express.Response) => {
    res.render(`user/register`, {
        ...res.locals.fixedConfigs,
        title: `Register`,
        files: {
            styles: {

            },
            scripts: {

            }
        }
    });
});
router.post(`/register`, (req:express.Request, res: express.Response) => {
    console.log(req.body);
    if (req.body.firstname == `` ||
        req.body.lastname == `` ||
        req.body.email == `` ||
        req.body.username == `` ||
        req.body.password == ``) {
        req.flash(`flashError`, `Please fill all required inputs!`);
        res.redirect(`/register`);
        return;
    }
    if (req.body.password !== req.body.passwordConfirm) {
        req.flash(`flashError`, `The passwords don't match. Try again.`);
        res.redirect(`/register`);
        return;
    }

    const newUser = new schemas.User(<schemas.UserI>{
        username: req.body.username,
        name: {
            first: req.body.firstname,
            last: req.body.lastname
        },
        email: req.body.email,
        password: req.body.password,
        cellphone: (req.body.cellphone != ``) ? req.body.cellphone : ``
    });
    bcript.genSalt(10, (err, salt) => {
        if (err) {
            req.flash(`flashError`, `There found an error in user creation. Please try again.`);
            res.redirect(`/register`);
        }
        bcript.hash(newUser.password, salt, (err, hash) => {
            if (err) {
                req.flash(`flashError`, `There found an error in user creation. Please try again.`);
                res.redirect(`/register`);
            }
            newUser.password = hash;

            newUser.save().then(() => {
                req.flash(`flashSuccess`, `User created successfully. Now, activate your account!`);
                res.redirect(`/`);
            }).catch(() => {
                req.flash(`flashError`, `There found an error in user creation. Please try again.`);
                res.redirect(`/`);
            });
        });
    });
});

router.use(express.static(`public/`));

export default router;

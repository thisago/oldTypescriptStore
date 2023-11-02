import bcript from 'bcryptjs';
// eslint-disable-next-line no-unused-vars
import { PassportStatic } from 'passport';
import * as local from "passport-local";
import * as schema from "../mongo/schemas.js";

const LocalStrategy = local.Strategy;

module.exports = function (passport: PassportStatic) {
    passport.use(new LocalStrategy({
        usernameField: `username`,
        passwordField: `password`
    }, (email:string, pass: string, done) => {
        schema.User.findOne({ email: email }).then((user: (schema.UserI | null)) => {
            if (!user) {
                console.log(`Account not exists.`);
                return done(null, false, { message: `Account not exists.` });
            }
            bcript.compare(pass, user.password, (err, match: boolean) => {
                if (!match || err) {
                    console.log(`Incorrect passwords.`);
                    return done(null, false, { message: `Incorrect passwords.` });
                } else {
                    return done(null, user);
                }
            });
        });
    }));
    passport.serializeUser((user: schema.UserI, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        schema.User.findById(id, (err, user: schema.UserI) => {
            done(err, user);
        });
    });
};

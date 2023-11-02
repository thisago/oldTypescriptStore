import express, { NextFunction } from 'express';
import { UserI } from '../mongo/schemas';

export default {
    admin: function (redirect = `/`, message = `Permition denied.`) {
        return function (req: express.Request, res: any, next: NextFunction) {
            if (req.isAuthenticated() && (<UserI>res.user).permitions.admin == true) {
                return next();
            }
            req.flash(`flashAlert`, message);
            res.redirect(redirect);
        };
    },
    logged: function (redirect = `/`, message = `Please login first.`) {
        return function (req: express.Request, res: any, next: NextFunction) {
            if (req.isAuthenticated()) {
                return next();
            }
            req.flash(`flashAlert`, message);
            res.redirect(redirect);
        };
    },
    unlogged: function (redirect = `/`, message = `You already logged.`) {
        return function (req: express.Request, res: any, next: NextFunction) {
            if (!req.isAuthenticated()) {
                return next();
            }
            req.flash(`flashAlert`, message);
            res.redirect(redirect);
        };
    }
};

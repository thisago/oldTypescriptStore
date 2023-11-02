import bodyparser from 'body-parser';
import flash from 'connect-flash';
import express from 'express';
import handlebars from 'express-handlebars';
import session from 'express-session';
import mongoose from 'mongoose';
import passport from 'passport';
// auth
import * as Auth from "./config/auth.js";
import { UserI } from './mongo/schemas.js';
// routes
import store from './routes/main.js';
import account from './routes/user.js';

const auth = (<any>Auth).default(passport);

// const subdomain = require(`express-subdomain-handler`);

const HTTPs = `http://`;
const HOST = `localhost`;
const PORT = 8091;

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://127.0.0.1/store`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch((err: string) => {
    console.log(`Failed when connect to Mongodb:`, err);
    process.exit(1);
});

interface menuItemArray {
  name: string,
  href: string
}

interface menuItem {
  items?: menuItemArray[],
  name: string,
  href: string,
  display?: string
};

const hbs = handlebars.create({
    partialsDir: [
        `views/partials/`
    ],
    helpers: {
        IF: function (v1: any, operator: string, v2: any, options: any) {
            switch (operator) {
            case `==`:
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case `===`:
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case `!=`:
                return (v1 != v2) ? options.fn(this) : options.inverse(this);
            case `!==`:
                return (v1 !== v2) ? options.fn(this) : options.inverse(this);
            case `<`:
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case `<=`:
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case `>`:
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case `>=`:
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case `&&`:
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case `||`:
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
            }
        },
        section: function (name: string, options: any) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        },
        menuItems: function (): menuItem[] {
            return <menuItem[]>[
                { name: `Home`, href: `/`, display: `always` },
                { name: `Stores`, href: `/stores`, display: `always` },

                { name: `My Account`, href: `/account`, display: `logged` },
                { name: `Selling`, href: `/account/selling`, display: `logged` },
                { name: `Sign out`, href: `/account/logout`, display: `logged` },
                {
                    name: `Sign in`,
                    href: `/account/login`,
                    display: `unlogged`,
                    items: [
                    // { name: `Sign in`, href: `${HTTPs}account.${HOST}:${PORT}/login/` },
                        { name: `Sign up`, href: `/account/register` }
                    ]
                }
            ];
        },
        accountSideMenuItems: function () {
            return <menuItem[]>[
                { name: `Personal`, href: `personal` },
                { name: `Security`, href: `security` },
                { name: `Privacy`, href: `privacy` }
            ];
        },
        menuButton: function (config: menuItem, option: any): (string | undefined) {
            if (config.display == undefined) {
                config.display = `always`;
            }

            if (typeof config.items == `undefined` && typeof config.name == `string`) {
                const samePage: boolean = option.data.exphbs.helpers.checkSlash(config.href.toLowerCase()) == option.data.exphbs.helpers.checkSlash(option.data.root._locals.fixedConfigs.currentlyUrl.toLowerCase());

                if ((option.data.root._locals.fixedConfigs.logged == false && config.display == `unlogged`) || (option.data.root._locals.fixedConfigs.logged == true && config.display == `logged`) || config.display == `always`) {
                    return `<a href="${option.data.exphbs.helpers.checkSlash(config.href.toLowerCase())}" data-active-page="${samePage}" title="${samePage ? `Reload page` : `Goto to ${config.name}`}" class="menuLink">${config.name}</a>`;
                }
            } else if (typeof config.items == `object`) {
                let button = ``;
                if ((option.data.root._locals.fixedConfigs.logged == false && config.display == `unlogged`) || (option.data.root._locals.fixedConfigs.logged == true && config.display == `logged`) || config.display == `always`) {
                    let buttons = ``;
                    for (let i = 0; i < config.items.length; i++) {
                        const samePage: boolean = option.data.exphbs.helpers.checkSlash(config.items[i].href.toLowerCase()) == option.data.exphbs.helpers.checkSlash(option.data.root._locals.fixedConfigs.currentlyUrl.toLowerCase());

                        buttons += `<a href="${option.data.exphbs.helpers.checkSlash(config.items[i].href.toLowerCase())}" data-active-page="${samePage}" title="${samePage ? `Reload page` : `Goto to ${config.items[i].name}`}" class="menuLink">${config.items[i].name}</a>`;
                    }
                    const samePage = option.data.exphbs.helpers.checkSlash(config.href.toLowerCase()) == option.data.exphbs.helpers.checkSlash(option.data.root._locals.fixedConfigs.currentlyUrl.toLowerCase());
                    button = `<div class="menuLinkSet"><a class="menuLink" href="${option.data.exphbs.helpers.checkSlash(config.href)}" data-active-page="${samePage}" title="${samePage ? `Reload page` : `Goto to ${config.name}`}">${config.name}</a><div class="linkSet">${buttons}</div></div>`;
                }
                return button;
            }
        },
        showUser: function (user: UserI, option: any): string {
            const formatTime = function (time: Date) {
                const setZero = (a: any, digits = 2) => {
                    a = a.toString();
                    while (a.length < digits) {
                        a = `0${a}`;
                    }
                    return a;
                };
                const d = new Date(time);
                return `${setZero(d.getHours())}:${setZero(d.getMinutes())}:${setZero(d.getSeconds())} ${setZero(d.getMonth())}/${setZero(d.getDay())}/${setZero(d.getFullYear(), 4)}`;
            };
            const ifExist = function (value: any, then: string, funcModifier: any = null): string {
                if (value && value != `` && value != -1) {
                    if (funcModifier != null) {
                        value = funcModifier(value);
                    }
                    return then.replace(/\$0/g, value);
                }
                return ``;
            };
            const ifEqual = function (value1: any, value2: any, then: string, funcModifier: any = null): string {
                if (value1 == value2) {
                    if (funcModifier != null) {
                        value1 = funcModifier(value1);
                    }

                    return then.replace(/\$0/g, value1);
                }
                return ``;
            };
            const card = `
            <div class="text-center">
                <h4 class="title">${user.fullname}</h4>
                ${ifExist(user.username, `<span class="avatar-username">$0</span>`)}
            </div>

            <img src="${user.avatar}" title="Avatar image" class="mg-4 mgb-3 avatar-image"/>
            <div class="avatar-info mgb-2">
                <div class="avatar-gender">
                    <label>
                    <input type="radio" ${ifEqual(user.gender, `male`, `checked`)} disabled name="gender" class="avatar-gender"/> 
                    Male
                    </label>
                    <label>
                    <input type="radio" ${ifEqual(user.gender, `female`, `checked`)} disabled name="gender" class="avatar-gender"/> 
                    Female
                    </label>
                    <label>
                    <input type="radio" ${ifEqual(user.gender, `other`, `checked`)} disabled name="gender" class="avatar-gender"/> 
                    Other
                    </label>
                </div>
                <div>Email: <span class="value">${user.email}</span></div>
                ${ifExist(user.cellphone, `<div>Cellphone: <span class="value">$0</span></div>`)}
                ${ifExist(user.telephone, `<div>Cellphone: <span class="value">$0</span></div>`)}
                ${ifExist(user.birth, `<div class="mgt-1">Birth date: <span class="value">$0</span></div>`, formatTime)}
            </div>
            <small>
            Last login: ${formatTime(user.lastLogin)}
            <br>
            Changed date: ${formatTime(user.changedDate)}
            <br>
            Creation date: ${formatTime(user.createdDate)}
            </small>
            `.replace(/ {2}/g, ``).replace(/\n/g, ``);

            return card;
        },
        checkSlash: function (url: string): string {
            // if (url.substr(0, 1) == `/`) {
            //     // if (url.indexOf(`${HTTPs}${HOST}:${PORT}`) == -1) {
            //     //     url = `${HTTPs}${HOST}:${PORT}${url}`;
            //     // }
            //     // return url.replace(/(.*)(\/|([^/]))/i, (a: string, b: string, c: string, d: string) => {
            //     //     return `${b}${(d == undefined ? `/` : `${d}/`)}`;
            //     // });
            // }
            if (url == `/`) {
                return url;
            }

            if (url == `${HTTPs}${HOST}:${PORT}` || url == `${HTTPs}${HOST}:${PORT}/`) {
                return `/`;
            }
            return url.replace(`${HTTPs}${HOST}:${PORT}`, ``).replace(/\/$/, ``);
        }
    }
});

app.engine(`handlebars`, hbs.engine);

app.set(`view engine`, `handlebars`);

// get pages

app.use(session({
    secret: `e46440fa0321b661c3341fad98762fbd3c5c4efbfe534894584a8d07ad8034cb`,
    resave: true,
    saveUninitialized: true
}));
// app.use(cookieParser());
// app.use(cookieSession({
//     secret: `e46440fa0321b661c3341fad98762fbd3c5c4efbfe534894584a8d07ad80sj2423oh4b`,
//     cookie: {
//         domain: `.${HOST}`,
//         maxAge: `ONE_DAY`
//     }
// }));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.locals.fixedConfigs = {
        HTTPs: HTTPs,
        HOST: HOST,
        PORT: PORT,
        SUBDOMAIN: req.headers.host?.replace(/([^./ :]+)\.[^./ :]+\.[^./ :]{2,}/, `$1`),
        FULLDOMAIN: HTTPs + req.headers.host,
        currentlyUrl: HTTPs + ((req.headers.host?.substr(req.headers.host.length - 1, 1) == `/`) ? req.headers.host.substr(0, req.headers.host.length - 1) : req.headers.host) + req.url,
        business: `Store`,
        url: req.originalUrl,
        logged: req.isAuthenticated(),
        user: req.user
    };
    res.locals.user = req.user ?? null;
    res.locals.flash = {
        success: req.flash(`flashSuccess`),
        error: req.flash(`flashError`),
        alert: req.flash(`flashAlert`)
    };
    res.locals.error = req.flash(`error`);
    next();
});

// app.use(subdomain({
//     baseUrl: HOST,
//     prefix: ``
// }));

app.use(bodyparser.urlencoded({
    extended: true
}));

app.use(bodyparser.json());

// main
app.use(`/`, store);

// user account
app.use(`/account`, account);

// user account

// get files
app.use(express.static(`public/`));

app.listen(PORT, () => {
    console.log(`Server started in ${HTTPs}${HOST}:${PORT}`);
});

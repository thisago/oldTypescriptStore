import express from "express";
import { User, UserI } from "../mongo/schemas";
const router = express.Router();

router.get(`/`, (req: express.Request, res: express.Response) => {
    res.render(`home`, {
        ...res.locals.fixedConfigs,
        title: `Home`,
        files: {
            styles: [
                `/home.css`
            ],
            scripts: [

            ]
        }
    });
});
router.get(`/stores`, (req: express.Request, res: express.Response) => {
    var userMap: UserI[] = [];
    User.find({}, function (err, users) {
        if (err) {
            console.log(`err`, err);
            return;
        }
        users.forEach(user => {
            userMap.push(user);
        });
        res.render(`stores`, {
            ...res.locals.fixedConfigs,
            title: `Stores`,
            files: {
                styles: [
                    ``
                ],
                scripts: [

                ]
            },
            users: userMap
        });
    });
});

export default router;

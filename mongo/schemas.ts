/* eslint-disable no-undef */
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

interface UserAddressI {
    country: string,
    city: string,
    street: string,
    houseNumber: number,
    postalCode: string,
    state: string
}
interface UserNameI {
    first: string,
    last: string
}

interface UserPermitionsI {
    admin: boolean
}

interface UserI extends mongoose.Document {
    username: string,
    name: UserNameI,
    fullname: string,
    email: string,
    password: string,
    telephone: string,
    cellphone: string,
    age: number,
    birth: Date,
    gender: string,
    address: UserAddressI,
    permitions: UserPermitionsI,
    avatar: string,
    lastLogin: Date,
    changedDate: Date,
    createdDate: Date,
}

const UserSchema = new Schema({
    username: {
        type: String,
        default: ``
    },
    name: {
        type: Object,
        default: <UserNameI>{
            first: ``,
            last: ``
        }
    },
    email: {
        type: String,
        default: ``
    },
    password: {
        type: String,
        default: ``
    },
    telephone: {
        type: String,
        default: ``
    },
    cellphone: {
        type: String,
        default: ``
    },
    age: {
        type: Number,
        default: -1
    },
    birth: {
        type: Date,
        default: Date.now()
    },
    gender: {
        type: String,
        default: ``
    },
    address: {
        type: Object,
        default: <UserAddressI>{
            country: ``,
            city: ``,
            street: ``,
            houseNumber: -1,
            postalCode: ``,
            state: ``
        }
    },
    permitions: {
        type: Object,
        default: <UserPermitionsI>{
            admin: false
        }
    },
    avatar: {
        type: String,
        default: `/image/avatar/default.png`
    },
    lastLogin: {
        type: Date,
        default: Date.now()
    },
    changedDate: {
        type: Date,
        default: Date.now()
    },
    createdDate: {
        type: Date,
        default: Date.now()
    }
});

UserSchema.set(`toObject`, { virtuals: true });
UserSchema.set(`toJSON`, { virtuals: true });

UserSchema.virtual(`fullname`).get(function (this: { name:UserNameI}) {
    return `${(this.name.first)} ${this.name.last}`;
}).set(function (this: {name: UserNameI}, name: string) {
    this.name.first = name.substr(0, name.indexOf(` `));
    this.name.last = name.substr(name.indexOf(` `) + 1);
});

const User = mongoose.model<UserI>(`users`, UserSchema);
export { User, UserI, UserAddressI, UserNameI };

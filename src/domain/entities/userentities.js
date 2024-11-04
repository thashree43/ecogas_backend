"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(data) {
        var _a, _b, _c;
        this._id = data._id;
        this.username = data.username;
        this.email = data.email;
        this.mobile = data.mobile;
        this.password = data.password;
        this.is_blocked = (_a = data.is_blocked) !== null && _a !== void 0 ? _a : false;
        this.is_admin = (_b = data.is_admin) !== null && _b !== void 0 ? _b : false;
        this.is_verified = (_c = data.is_verified) !== null && _c !== void 0 ? _c : false;
        this.book = data.book || [];
        this.orders = data.orders || [];
    }
    toIUserData() {
        return {
            _id: this._id,
            username: this.username,
            email: this.email,
            mobile: this.mobile,
            password: this.password,
            is_blocked: this.is_blocked,
            is_admin: this.is_admin,
            is_verified: this.is_verified,
            book: this.book,
            orders: this.orders
        };
    }
}
exports.User = User;

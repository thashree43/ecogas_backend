"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookData = void 0;
class BookData {
    constructor({ _id, name, consumerid, mobile, address, company, gender, }) {
        this._id = _id;
        this.name = name;
        this.consumerid = consumerid;
        this.mobile = mobile;
        this.address = address;
        this.company = company;
        this.gender = gender;
    }
}
exports.BookData = BookData;

import { Types } from "mongoose";

export interface IMessageData{
    _id:Types.ObjectId
    reciever:Types.ObjectId[]
    sender:Types.ObjectId[]
    content:string;
    chat:Types.ObjectId[]
    image?:string | null
}

export class Message{
    _id:Types.ObjectId
    reciever:Types.ObjectId[]
    sender:Types.ObjectId[]
    content:string;
    chat:Types.ObjectId[]
    image?:string | null

    constructor(data:Partial<IMessageData>){
        this._id = data._id || new Types.ObjectId
        this.reciever = data.reciever || []
        this.sender = data.sender || []
        this.content = data.content!
        this.chat = data.chat || []
        this.image = data.image!
    }
}
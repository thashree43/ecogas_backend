export interface IRedisRepository{
    store(email:string,otp:string,ttlseconds:number):Promise<void>;
    get(email:string):Promise<string | null>
    delete(email:string):Promise<void>
}
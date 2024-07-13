import {Injectable, UnauthorizedException} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import { BasicStrategy as Strategy } from 'passport-http';
import {basicConstants} from "../constants/constants";

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic'){
    constructor() {
        super();
    }
    ///TODO Guard работате но нужно добавить еще валидацию для user endpoint и
    // поработать над ответом который выдается при не авторизации
    async validate(username:string, password:string){
        if (
            username === basicConstants.username &&
            password === basicConstants.password
        ) {
            return { username: basicConstants.username };
        }
        throw new UnauthorizedException('You are not SA');
    }
}
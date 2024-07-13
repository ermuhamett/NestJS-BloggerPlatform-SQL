import * as process from "process";

export const jwtConstants={
    secret:process.env.JWT_ACCESS_TOKEN_SECRET || 'secretKey'
}

export const basicConstants={
    username:process.env.SA_LOGIN || 'admin',
    password:process.env.SA_PASSWORD || 'qwerty'
}
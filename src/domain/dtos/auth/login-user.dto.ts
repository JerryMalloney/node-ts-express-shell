import { regularExps } from "../../../config";

export class LoginUserDto {
  constructor(public email: string, public password: string) {}

  static create(object: { [key: string]: any }): [string?, LoginUserDto?] {
    const { email, password } = object;
    if (!email) return ["missing email"];
    if (!regularExps.email.test(email)) return ["Email is not valid"];
    if (!password) return ["missing password"];
    if (password.length < 6) return ["Password is too short"];

    return [undefined, new LoginUserDto(email, password)];
  }
}

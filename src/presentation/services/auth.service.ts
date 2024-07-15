import { bcryptAdater, envs, JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import {
  CustomError,
  LoginUserDto,
  RegisterUserDto,
  UserEntity,
} from "../../domain";
import { EmailService } from "./email.service";

// focus on the creation of the user

export class AuthService {
  constructor(private readonly emailService: EmailService) {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({ email: registerUserDto.email });
    if (existUser) throw CustomError.badRequest("Email already exist");

    try {
      const user = new UserModel(registerUserDto);

      //Encrypt Password
      user.password = bcryptAdater.hash(registerUserDto.password);

      await user.save();

      // Email de confirmacion

      await this.sendEmailValidationLink(user.email);

      const { password, ...userEntity } = UserEntity.fromObject(user);
      const token = await JwtAdapter.generateToken({
        id: user.id,
        email: user.email,
      });
      if (!token) throw CustomError.internalServer("Error while creating JWT");

      return { user: { userEntity }, token: token };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  public async loginUser(LoginUserDto: LoginUserDto) {
    const user = await UserModel.findOne({ email: LoginUserDto.email });
    if (!user) throw CustomError.badRequest("Email doens't exist");

    const isMatching = bcryptAdater.compare(
      LoginUserDto.password,
      user.password
    );

    if (!isMatching) throw CustomError.badRequest("User doens't match");

    const { password, ...userEntity } = UserEntity.fromObject(user);

    const token = await JwtAdapter.generateToken({
      id: user.id,
      email: user.email,
    });
    if (!token) throw CustomError.internalServer("Error while creating JWT");

    return { user: userEntity, token: token };
  }

  private sendEmailValidationLink = async (email: string) => {
    const token = await JwtAdapter.generateToken({ email });
    if (!token) throw CustomError.internalServer("Error getting token");

    const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${token}`;
    const html = `
     <h1>Validate your email</h1>
     <p>Click on the foloowing link to validate your email</p>
     <a href="${link}">Validate your email: ${email}</a>
    `;

    const options = {
      to: email,
      subject: "Validate your email",
      htmlBody: html,
    };

    const isSent = await this.emailService.sendEmail(options);

    if (!isSent) throw CustomError.internalServer("Error sending email");

    return true;
  };

  public validateEmail = async (token: string) => {
    const payload = await JwtAdapter.validateToken(token);
    if (!payload) throw CustomError.unauthorized("Invalid Token");

    const { email } = payload as { email: string };
    if (!email) throw CustomError.internalServer("Email not in token");

    const user = await UserModel.findOne({ email });

    if (!user) throw CustomError.internalServer("Email not exists");

    user.emailValidated = true;
    await user.save();

    return true;
  };
}

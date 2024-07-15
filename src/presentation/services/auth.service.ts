import { bcryptAdater, JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import {
  CustomError,
  LoginUserDto,
  RegisterUserDto,
  UserEntity,
} from "../../domain";

// focus on the creation of the user

export class AuthService {
  constructor() {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({ email: registerUserDto.email });
    if (existUser) throw CustomError.badRequest("Email already exist");

    try {
      const user = new UserModel(registerUserDto);

      //Encrypt Password
      user.password = bcryptAdater.hash(registerUserDto.password);

      await user.save();

      // JWT <---  to keep the user authenticated

      // Eamil de confirmacion

      const { password, ...userEntity } = UserEntity.fromObject(user);

      return { user: { userEntity }, token: "ABC" };
    } catch (error) {
      CustomError.internalServer(`${error}`);
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
}

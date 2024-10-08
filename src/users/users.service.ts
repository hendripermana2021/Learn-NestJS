import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository, UpdateResult } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDTO } from './dto/create-user.dto';
import { LoginDTO } from 'src/auth/dto/login.dto';
import { v4 as uuid4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>, // 1.
  ) {}

  async create(userDTO: CreateUserDTO): Promise<User> {
    try {
      const user = new User();
      user.firstName = userDTO.firstName;
      user.lastName = userDTO.lastName;
      user.email = userDTO.email;
      user.apiKey = uuid4();

      const salt = await bcrypt.genSalt(); // 2. Generate a salt
      user.password = await bcrypt.hash(userDTO.password, salt); // 3. Hash the password

      const savedUser = await this.userRepository.save(user);
      delete savedUser.password;
      return savedUser;

      // const user = await this.userRepository.save(userDTO); // 4. Save user to the database
      // delete user.password; // 5. Remove password from the response
      // return user; // 6. Return the created user without password
    } catch (error) {
      if (error instanceof QueryFailedError && error.message.includes('UQ_')) {
        throw new ConflictException('Email sudah digunakan');
      }
      throw error;
    }
  }

  async findOne(data: LoginDTO): Promise<User> {
    const user = await this.userRepository.findOneBy({ email: data.email });
    if (!user) {
      throw new UnauthorizedException('Could not find user');
    }
    return user;
  }

  async findById(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  async updateSecretKey(userId, secret: string): Promise<UpdateResult> {
    return this.userRepository.update(
      { id: userId },
      { twoFASecret: secret, enable2FA: true },
    );
  }

  async disable2FA(userId: number): Promise<UpdateResult> {
    return this.userRepository.update(
      { id: userId },
      { enable2FA: false, twoFASecret: null },
    );
  }

  async findByApiKey(apiKey: string): Promise<User> {
    return this.userRepository.findOneBy({ apiKey });
  }
}

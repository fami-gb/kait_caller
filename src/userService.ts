import { AppDataSource } from './data-source';
import { User } from './entity/User';

export const getUsers = async (): Promise<User[]> => {
    const userRepository = AppDataSource.getRepository(User);
    return userRepository.find();
};

export const createUser = async (name: string, status: string, LineUserId: string): Promise<User> => {
    const userRepository = AppDataSource.getRepository(User);
    const user = new User();
    user.name = name;
    user.status = status;
    user.LineUserId = LineUserId;
    await userRepository.save(user);
    return user;
};

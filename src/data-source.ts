import 'reflect-metadata';
import { DataSource } from "typeorm";
import { User } from "./entity/User";

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [User],
    synchronize: true,
});

const fast = async () => {
    await AppDataSource.initialize();
};
fast();

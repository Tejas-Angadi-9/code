import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

const getDatabaseConfig = (
  configService: ConfigService,
): MongooseModuleOptions => ({
  uri: configService.getOrThrow<string>('MONGODB_URI'),
  connectionFactory: (connection: Connection) => {
    console.log({
      status: true,
      message: 'MongoDB connected',
    });
    return connection;
  },
});

export default getDatabaseConfig;

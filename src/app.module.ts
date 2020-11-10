import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import * as mongooseHidden from 'mongoose-hidden';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          uri: configService.get('CONNECTION_STRING'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
          connectionFactory(connection) {
            connection.plugin(
              mongooseHidden({
                defaultHidden: {
                  __v: true,
                },
              }),
            );
            return connection;
          },
        };
      },
    }),
    EventsModule,
  ],
})
export class AppModule {}

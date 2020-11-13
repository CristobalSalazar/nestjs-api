import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { EmailModule } from './email/email.module';
import { PostsModule } from './posts/posts.module';
import { ProfilesModule } from './profiles/profiles.module';
import * as mongooseHidden from 'mongoose-hidden';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    EventsModule,
    EmailModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          uri: configService.get(
            'CONNECTION_STRING',
            'mongodb://localhost/nestjs',
          ),
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
    PostsModule,
    ProfilesModule,
  ],
})
export class AppModule {}

import { Controller, Get } from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';

@Controller('users')
export class UserController {
  @Get('session')
  getSession() {
    return {};
  }

  @Get('public')
  @Public() //Decorator, Cause all endpoints are secured with Better-Auth-Guard
  getPublic() {
    return true;
  }
}

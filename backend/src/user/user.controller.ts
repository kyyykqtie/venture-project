import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import { UserService } from './user.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** Returns the logged-in user with their department name */
  @Get('me')
  async getMe(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.userService.findMeWithDepartment(userId);
  }

  /** Returns all users with their department names — for admin views */
  @Get()
  findAll() {
    return this.userService.findAllWithDepartments();
  }

  @Get('public')
  @Public()
  getPublic() {
    return true;
  }
}

import { SetMetadata } from '@nestjs/common';

/**
 * 设置所需的访问角色
 *
 * @param  {string[]} roles
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

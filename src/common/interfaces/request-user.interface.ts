/**
 * 操作、访问用户信息
 */
export interface RequestUser {
  username: string;

  token: string;

  email?: string;

  roles?: string[];

  ip?: string;

  // 业务唯一用户标识（Users.id）
  id: string;
}

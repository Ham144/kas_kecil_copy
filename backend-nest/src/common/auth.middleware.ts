import { TokenPayload } from 'src/models/tokenPayload.model';
import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: any, res: any, next: (error?: Error | any) => void) {
    const publicRoutes = [
      '/api/user/login/ldap',
      '/api/user/logout',
      '/api/warehouse',
    ];

    if (publicRoutes.some((path) => req.originalUrl.startsWith(path))) {
      // Lewati middleware
      return next();
    }

    const token = req?.cookies?.access_token;
    if (!token) {
      console.log('authentication failed : ', req.originalUrl);
      throw new HttpException('Forbidden Route', 403);
    }

    try {
      let decoded: TokenPayload;
      // Verify web token
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log('authentication success : ', req.originalUrl);
      next();
    } catch (error) {
      console.log('authentication failed : ', req.originalUrl);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }
}

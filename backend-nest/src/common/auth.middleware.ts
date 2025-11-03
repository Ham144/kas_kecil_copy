import { TokenPayload } from 'src/models/tokenPayload.model';
import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: any, res: any, next: (error?: Error | any) => void) {
    const publicRoutes = ['/api/user/login/ldap', '/api/user/refresh-token'];

    //refresh_token tidak akan melewati middleware ini
    if (publicRoutes.some((path) => req.originalUrl.startsWith(path))) {
      // Lewati middleware
      return next();
    }

    const access_token = req?.cookies['access_token'];

    if (!access_token) {
      return res.status(403).json({ message: 'Route is forbidden' });
    }

    try {
      let decoded: TokenPayload;
      // Verify web token
      decoded = await jwt.verify(access_token, process.env.JWT_SECRET);

      req.user = decoded;
      next();
    } catch (error) {
      console.log('authentication failed : ', req.originalUrl, error.message);
      // Jangan clear cookie di sini, biarkan frontend yang handle refresh
      // res.clearCookie('access_token', { path: '/' });
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }
}

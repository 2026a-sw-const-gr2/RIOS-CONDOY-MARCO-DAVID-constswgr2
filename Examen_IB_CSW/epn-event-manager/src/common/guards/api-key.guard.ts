import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const key = req.headers['x-fis-epn-key'] || req.headers['X-FIS-EPN-KEY'];
    const expected = this.configService.get<string>('FIS_EPN_KEY');
    if (!key || key !== expected) {
      const ip = req.ip || (req.connection && req.connection.remoteAddress) || 'unknown';
      this.logger.warn({ action: 'AUTH_FAILED', ip });
      throw new UnauthorizedException('API Key inválida o ausente');
    }
    return true;
  }
}

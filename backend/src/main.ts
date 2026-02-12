import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ensureStorageDirectories } from './config/paths';

async function bootstrap() {
	// Garante que os diretórios de storage existem
	ensureStorageDirectories();

	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('api');
	app.enableCors({ origin: 'http://localhost:5173', })

	await app.listen(3000);
	console.log('[App] Servidor rodando em http://localhost:3000');
	console.log('[App] API disponível em http://localhost:3000/api');
}
bootstrap();

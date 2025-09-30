// server.js (com Fastify e suporte para OU)
const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors'); // 1. IMPORTE O PACOTE
const { execFile } = require('child_process');
const path = require('path');
const port = 3000;

fastify.register(cors, { // 2. REGISTRE O PLUGIN
    origin: "*" // Para desenvolvimento, aceita requisições de qualquer origem.
});

fastify.post('/api/reset-password', (request, reply) => {
  // Agora também pegamos a 'ou' do corpo da requisição
  const { username, newPassword, ou } = request.body;

  if (!username || !newPassword) {
    return reply.status(400).send({ error: 'Os campos "username" e "newPassword" são obrigatórios.' });
  }

  const scriptPath = path.join(__dirname, 'scripts', 'Reset-ADPassword.ps1');
  const args = [
    '-ExecutionPolicy', 'Bypass',
    '-File', scriptPath,
    '-Username', username,
    '-NewPassword', newPassword
  ];

  // --- A MUDANÇA ESTÁ AQUI ---
  // Se o campo 'ou' foi enviado na requisição, o adicionamos aos argumentos do script
  if (ou) {
    args.push('-SearchOU', ou);
  }
  // -------------------------

  execFile('powershell.exe', args, (error, stdout, stderr) => {
    if (error || stderr) {
      fastify.log.error(`ERRO DO POWERSHELL: ${stderr || error.message}`);
      return reply.status(500).send({
        message: 'Falha ao executar o script de reset.',
        error: stderr || error.message
      });
    }

    fastify.log.info(`SUCESSO DO POWERSHELL: ${stdout}`);
    reply.status(200).send({
      message: 'Operação concluída com sucesso.',
      details: stdout.trim()
    });
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: port });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
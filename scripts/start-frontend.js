const net = require('net');
const { spawn } = require('child_process');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = '3000';

const server = net.createServer();

server.once('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error('');
    console.error(`Port ${PORT} is already in use.`);
    console.error(`Stop the process using http://localhost:${PORT}, then run npm start again.`);
    console.error('');
    process.exit(1);
  }

  console.error(error.message);
  process.exit(1);
});

server.once('listening', () => {
  server.close(() => {
    const reactScripts = require.resolve('react-scripts/bin/react-scripts.js');
    const child = spawn(process.execPath, [reactScripts, 'start'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        HOST,
        PORT,
      },
    });

    child.on('exit', code => {
      process.exit(code ?? 0);
    });
  });
});

server.listen(Number(PORT), HOST);

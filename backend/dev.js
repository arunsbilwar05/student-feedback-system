const { spawn } = require('node:child_process');
const path = require('node:path');
const { MongoMemoryServer } = require('mongodb-memory-server');

const backendDir = __dirname;
const frontendDir = path.resolve(backendDir, '..', 'frontend');
const children = [];
let mongo;
let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null) child.kill();
  }
  if (mongo) {
    mongo.stop().finally(() => process.exit(code));
  } else {
    process.exit(code);
  }
}

function start(file, args, cwd, env, stopOnExit = true) {
  const child = spawn(process.execPath, [file, ...args], { cwd, env, stdio: 'inherit' });
  children.push(child);
  child.on('error', (error) => {
    console.error(`Could not start ${file}:`, error);
    stop(1);
  });
  if (stopOnExit) {
    child.on('exit', (code) => {
      if (!stopping) {
        console.error(`${file} stopped${code === null ? '' : ` with exit code ${code}`}`);
        stop(code || 0);
      }
    });
  }
  return child;
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());

(async () => {
  mongo = await MongoMemoryServer.create();
  const env = {
    ...process.env,
    MONGO_URI: mongo.getUri('student_feedback'),
    PORT: '5001',
    API_PORT: '5001'
  };
  const seed = start('seed.js', [], backendDir, env, false);
  seed.once('exit', (code) => {
    if (stopping) return;
    if (code !== 0) {
      console.error('Database seeding failed');
      stop(code || 1);
      return;
    }
    start(path.join('node_modules', 'vite', 'bin', 'vite.js'), ['--host', '127.0.0.1', '--port', '5174'], frontendDir, env);
    start('server.js', [], backendDir, env);
  });
})().catch((error) => {
  console.error('Could not start the app:', error);
  stop(1);
});

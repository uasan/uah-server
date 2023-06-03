import { baseURI } from '#utils/location.js';
import { exec } from 'child_process';

export const getBranchName = () => ({
  then(resolve, reject) {
    exec('git branch --show-current', (error, stdout, stderr) => {
      if (error) reject(stderr.trim());
      else resolve(stdout.trim());
    });
  },
});

export const confirmCommit = () => ({
  then(resolve, reject) {
    console.log('\nCommit and start server? (Yes/No)');

    process.stdin.once('data', data => {
      if (data.toString().trim().toLowerCase()[0] === 'y') {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        import(baseURI + 'bin/app.js');
        resolve();
      } else {
        console.log('Rollback');
        reject(null);
      }
    });
  },
});

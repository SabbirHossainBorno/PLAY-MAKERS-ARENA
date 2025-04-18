module.exports = {
    apps: [{
      name: 'PLAY MAKERS ARENA',
      script: 'npm',
      args: 'start',
      cwd: '/home/play-makers-arena/',
      autorestart: true,
      env: {
        NODE_ENV: 'production',
      },
    }],
  };
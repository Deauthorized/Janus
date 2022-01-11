module.exports = {
  apps : [{
    name: 'Janus',
    description: 'I manage suggestions and bug reports.',
    version: '1.0.0',
    script: './src/index.js',
  }],

  dependancies: {
    "discord.js": "*",
    "@discordjs/rest": "*"
  },

  repository: {
    type: "git",
    url: "https://github.com/Deauthorized/Janus"
  }
};

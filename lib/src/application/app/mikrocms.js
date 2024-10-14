module.exports = {
  'env': {},
  'modules': {
    'default': {
      'database': {
        'default': {
          'database': process.env.MYSQL_DATABASE,
          'username': process.env.MYSQL_USERNAME,
          'password': process.env.MYSQL_PASSWORD,
          'sequelize': {
            'host': process.env.MYSQL_HOST,
            'port': parseInt(process.env.MYSQL_PORT),
            'dialect': 'mysql'
          }
        }
      },
      'router': {
        '/': []
      }
    }
  }
};

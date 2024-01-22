// 'use strict';

// const fs = require('fs');
// const path = require('path');
// const Sequelize = require('sequelize');
// const process = require('process');
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// const config = require(__dirname + '/../config/config.json')[env];
// const db = {};

// let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

// fs
//   .readdirSync(__dirname)
//   .filter(file => {
//     return (
//       file.indexOf('.') !== 0 &&
//       file !== basename &&
//       file.slice(-3) === '.js' &&
//       file.indexOf('.test.js') === -1
//     );
//   })
//   .forEach(file => {
//     const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });

// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;

// 아래와 같이 수정 
// 블로그에서 이러면 에러 덜난다고 함 

const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

// 테이블 추가 
const Bbs = require('../Server/db/bbs');
const tb_file = require('../Server/db/tb_file');
const tb_join = require('../Server/db/tb_join');

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;

db.Bbs = Bbs; // db 객체에 모델에  담기 
Bbs.init(sequelize); 
Bbs.associate(db); // 다른 테이블과의 관계를 연결함

db.tb_file = tb_file;
tb_file.init(sequelize);
tb_file.associate(db);

db.tb_join = tb_join;
tb_join.init(sequelize);
tb_join.associate(db);

module.exports = db;

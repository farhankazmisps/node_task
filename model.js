const Sequelize = require('sequelize');

const sequelize = new Sequelize('insert_post', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql'
});

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

module.exports.User = sequelize.define('posts', {
    id:{
        type: Sequelize.INTEGER, 
        primaryKey: true,
        autoIncrement: true,
    },
    title:{
        type: Sequelize.STRING,
    },
    post:{
        type: Sequelize.STRING,
    },
    category:{
        type: Sequelize.STRING,
    },
},{tableName:'posts',timestamps: false})


sequelize.sync();



module.exports.Users = sequelize.define('login', {
    id:{
        type: Sequelize.INTEGER, 
        primaryKey: true,
        autoIncrement: true,
    },
    name:{
        type: Sequelize.STRING,
    },
    email:{
        type: Sequelize.STRING,
        validate: { isEmail: true },
      unique: true
    },
    password:{
        type: Sequelize.STRING,
    },
    
},{tableName:'login',timestamps: false})
const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            idx: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            username: {
                type: Sequelize.INTEGER,
                allowNull : false
            },
            password : {
                type : Sequelize.STRING(100),
                allowNull : true,
            },
            email : {
                type : Sequelize.STRING(100),
                allowNull : true,
            },
            phone1 : {
                type : Sequelize.STRING(10),
                allowNull : false,
            },
            phone2 : {
                type : Sequelize.STRING(10),
                allowNull : false,
            },
            phone3 : {
                type : Sequelize.STRING(10),
                allowNull : false,
            },
        },
        {
            sequelize,
            timestamps : false, 
            underscored : false, 
            modelName : "tb_join",
            tableName : "tb_join",  
            paranoid : false, 
            charset : "utf8",
            collate : 'utf8_general_ci', 
        });
    }
    static associate(db){} 
}
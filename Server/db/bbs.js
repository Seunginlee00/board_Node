const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            bbsNo : {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            bbsWriter : {
                type : Sequelize.STRING(100),
                allowNull : false
            },
            bbsTitle : {
                type : Sequelize.STRING(100),
                allowNull : false,
            },
            bbsContent : {
                type : Sequelize.TEXT,
                allowNull : true,
            },
            bbsCreateDate : {
                type : Sequelize.DATE,
                allowNull : false,
                defaultValue : Sequelize.NOW, //DEFAULT now()
            },
            bbsModifyDate : {
                type : Sequelize.DATE,
                allowNull : false,
                defaultValue : Sequelize.NOW, //DEFAULT now()
            },
        },
        {
            sequelize,
            timestamps : false, 
            underscored : false, 
            modelName : "Bbs",
            tableName : "bbs",  
            paranoid : false, 
            charset : "utf8",
            collate : 'utf8_general_ci', 
        });
    }
    static associate(db){} 
}
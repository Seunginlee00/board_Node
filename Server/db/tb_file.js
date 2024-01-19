const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            fileNo : {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            bbsNo: {
                type: Sequelize.INTEGER,
                allowNull : false
            },
            fileName : {
                type : Sequelize.STRING(100),
                allowNull : true,
            },
            filePath : {
                type : Sequelize.STRING(100),
                allowNull : false,
            },
        },
        {
            sequelize,
            timestamps : false, 
            underscored : false, 
            modelName : "tb_file",
            tableName : "tb_file",  
            paranoid : false, 
            charset : "utf8",
            collate : 'utf8_general_ci', 
        });
    }
    static associate(db){} 
}
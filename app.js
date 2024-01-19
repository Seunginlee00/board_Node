const express = require('express');
const ejs = require('ejs');
const app = express();
const path = require('path');
const {sequelize} = require('./models'); // db.sequelize 객체

// allows you to ejs view engine.
app.set('view engine','ejs');

// port 설정 

const port = process.env.PORT||3001;

app.listen(port, function() {
    console.log('Listening on '+port);
});

// board 라우터 
const boardRouter = require('./Server/Router/boardRouter');
// app.use(express.json());
// 아래 설정을 하지 않으면 req.body를 받을 수 없음 
// .urlencoded()은 x-www-form-urlencoded형태의 데이터를
// .json()은 JSON형태의 데이터를 해석해줍니다.

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public')); //css
app.use("/main",boardRouter);

// db 설정들 

sequelize.sync({force : false}) // 서버 실행시 MySQL 과 연동되도록 하는 sync 메서드 
// force : true 로 해놓으면 서버 재시작마다 테이블이 재생성됨. 테이블을 잘못 만든 경우에 true 로 설정
.then(() => {
    console.log('데이터 베이스 연결 성공');
})
.catch((err) => {
    console.log(err);
});





const express = require('express');
const controller = require("./loginController");
const router = express.Router();

// 메인
router.get('/',controller.mainView);

//로그인
router.post('/login',controller.loginAction);

//회원가입
router.get('/join',controller.joinView);
router.post('/idCheck',controller.idCheckAction);
router.post('/join', controller.joinAction);

//로그아웃
router.get('/logout',controller.logoutAction);

//회원 리스트
router.get('/user',controller.userMainView);

router.get('/user/:idx',controller.userDetailView);
router.get('/user/:idx',controller.userDetailAction);

module.exports = router;
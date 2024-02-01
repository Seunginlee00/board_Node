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

// 아이디 찾기
router.get("/id-find",controller.idFindView);
router.post("/id-find",controller.idFindAction);

// 비밀번호 찾기
router.get("/pw-find",controller.pwFindView);
router.post("/pw-find",controller.pwFindAction);

// 비밀번호 변경
router.post("/pw-check",controller.pwNewView);
router.post("/pw-change",controller.pwNewAction);


module.exports = router;
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

// MySQL 연결 설정
const db = mysql.createConnection({
  host: 'localhost',        // MySQL 서버 호스트명
  user: 'root',             // MySQL 사용자명
  password: '0416',         // MySQL 비밀번호
  database: 'restaurantDB'  // 사용하려는 데이터베이스 이름
});

db.connect((err) => {
  if (err) {
    console.error('MySQL 연결 오류: ' + err.stack);
    return;
  }
  console.log('MySQL 연결 성공');
});

// 뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 홈 페이지 라우트
app.get('/', (req, res) => {
  res.render('index');
});

// 맛집 리스트 라우트
app.get('/restaurant-list', (req, res) => {
    db.query('SELECT * FROM restaurants', (err, results) => {
      if (err) {
        console.error('데이터베이스 조회 오류: ' + err.stack);
        return res.status(500).send('서버 오류');
      }
  
      // 데이터가 제대로 있는지 확인
      console.log(results);  // 결과 확인을 위한 로그
  
      res.render('restaurant-list', { restaurants: results }); // 결과를 ejs로 전달
    });
  });

// 맛집 상세 페이지 라우트
app.get('/restaurant/:id', (req, res) => {
  const restaurantId = req.params.id;

  // MySQL에서 해당 맛집의 상세 정보를 가져오기
  db.query('SELECT * FROM restaurants WHERE id = ?', [restaurantId], (err, results) => {
    if (err) {
      console.error('데이터베이스 조회 오류: ' + err.stack);
      return res.status(500).send('서버 오류');
    }
    if (results.length === 0) {
      return res.status(404).send('맛집을 찾을 수 없습니다.');
    }
    // 상세 정보를 ejs 템플릿에 전달
    res.render('restaurant-detail', { restaurant: results[0] });
  });
});

// 개발자 소개 페이지 라우트
app.get('/developer', (req, res) => {
  res.render('developer'); // developer.ejs 템플릿 렌더링
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중`);
});
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

// MySQL 연결 설정
const db = mysql.createConnection({
  host: 'ao9moanwus0rjiex.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',        // MySQL 서버 호스트명
  user: 'kxcged22pmts9nyt',             // MySQL 사용자명
  password: 'g53pv45drfl9k04c',         // MySQL 비밀번호
  database: 'uci2bmjakr66mhj2'  // 사용하려는 데이터베이스 이름
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
  res.render('index'); // index.ejs 템플릿 렌더링
});

// 맛집 리스트 페이지 라우트
app.get('/restaurant-list', (req, res) => {
  const category = req.query.category || '전체'; // 음식 분류 선택
  const withCategory = req.query.with || '전체'; // 누구와 함께 선택
  let query = 'SELECT id, name, food_category, time_to_chart, rating, image_url FROM restaurants';
  const params = [];

  if (category !== '전체' && withCategory !== '전체') {
    // 음식 분류와 누구와 함께 둘 다 선택된 경우
    query += ' WHERE food_category = ? AND with_category LIKE ?';
    params.push(category, `%${withCategory}%`);
  } else if (category !== '전체') {
    // 음식 분류만 선택된 경우
    query += ' WHERE food_category = ?';
    params.push(category);
  } else if (withCategory !== '전체') {
    // 누구와 함께만 선택된 경우
    query += ' WHERE with_category LIKE ?';
    params.push(`%${withCategory}%`);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('데이터베이스 조회 오류: ' + err.stack);
      return res.status(500).send('서버 오류');
    }
    res.render('restaurant-list', {
      restaurants: results,
      selectedCategory: category,  // 선택된 음식 분류
      selectedWith: withCategory   // 선택된 '누구와 함께' 분류
    });
  });
});

// 맛집 상세 페이지 라우트
app.get('/restaurant/:id', (req, res) => {
  const restaurantId = req.params.id;
  const selectedCategory = req.query.category || '전체';
  const selectedWith = req.query.with || '전체';

  const query = 'SELECT * FROM restaurants WHERE id = ?';

  db.query(query, [restaurantId], (err, results) => {
    if (err) {
      console.error('데이터베이스 조회 오류: ' + err.stack);
      return res.status(500).send('서버 오류');
    }
    if (results.length === 0) {
      return res.status(404).send('맛집을 찾을 수 없습니다.');
    }
    res.render('restaurant-detail', { 
      restaurant: results[0], 
      selectedCategory, 
      selectedWith 
    });
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
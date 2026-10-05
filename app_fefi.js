const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const dataFile = path.join(__dirname, 'results.json');

function loadSavedData() {
  if (fs.existsSync(dataFile)) {
    const fileData = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(fileData);
  }

  return {
    totalAnswers: 0,
    axisTotals: {
      E: 0,
      I: 0
    }
  };
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

let savedData = loadSavedData();


const questions = [
 {
    id: 'q1',
    text: '会話は、話せた量よりお互いに興味を持てたかの方が大事',
    axis: 'ESE'
 },
 {
    id: 'q2',
    text: '皮肉は、自分だけは頭良くて刺してる気分になっているだけなので、結構ダサい攻撃法だと思う',
    axis: 'ESE'
 },
 {
    id: 'q3',
    text: '私達は他人の「痛い」を直接確かめることはできない。相手の言葉や表情を見て、「たぶんこう感じてる」と判断してるだけだ',
    axis: 'SEI'
 },
 {
    id: 'q4',
    text: '',
    axis: 'E'
 },
 {
    id: 'q5',
    text: '集団内で1人で過ごしている人がいれば、自分たちの輪の中に入るように勧めたり、声をかける',
    axis: 'E'
 },
 {
    id: 'q6',
    text: 'まわりと比較して落ち込んだり、うらやましく思ったり妬んだりしがちである',
    axis: 'E'
 },
 {
    id: 'q7',
    text: '流れる雲や景色を眺めたり、ただぼんやりと時間を過ごすのが好きである',
    axis: 'I'
 },
 {
    id: 'q8',
    text: '集団内で、他人が1人で過ごしていても、困っていない様子ならあえて声をかけることはない',
    axis: 'I'
 },
 {
    id: 'q9',
    text: '飲み会などの幹事で、進行がもたついていたりうまく場を回せていない状況では自分の方が上手くできると感じる',
    axis: 'E'
 },
 {
    id: 'q10',
    text: '自分の話をするよりも他人の話に耳を傾けていたい',
    axis: 'I'
 }

];

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  const questionHtml = questions.map((question) => `
    <fieldset>
      <legend>${question.text}</legend>

      <label>
        <input type="radio" name="${question.id}" value="yes" required>
        はい
      </label>

      <label>
        <input type="radio" name="${question.id}" value="neutral">
        どちらでもない
      </label>

      <label>
        <input type="radio" name="${question.id}" value="no">
        いいえ
      </label>
    </fieldset>
    <br>
  `).join('');

  res.send(`
    <h1>外向性と内向性の指標</h1>
    <form action="/result" method="post">
      ${questionHtml}
      <button type="submit">結果を見る</button>
    </form>
  `);
});

app.post('/result', (req, res) => {
  let eScore = 0;
  let iScore = 0;

  for (const question of questions) {
    const answer = req.body[question.id];
    let point = 0;

    if (answer === 'yes') {
      point = 1;
    } else if (answer === 'neutral') {
      point = 0.5;
    } else if (answer === 'no') {
      point = 0;
    }

    if (question.axis === 'E') {
      eScore += point;
    } else if (question.axis === 'I') {
      iScore += point;
    }
  }
  savedData.totalAnswers += 1;
  savedData.axisTotals.E += eScore;
  savedData.axisTotals.I += iScore;

  saveData(savedData);

  const total = eScore + iScore;
  const eRate = total === 0 ? 0 : ((eScore / total) * 100).toFixed(1);
  const iRate = total === 0 ? 0 : ((iScore / total) * 100).toFixed(1);


let typeText = '';

if (eScore > iScore) {
  typeText = 'あなたは外向性寄りです';
} else if (iScore > eScore) {
  typeText = 'あなたは内向性寄りです';
} else {
  typeText = 'あなたは外向性と内向性が同じくらいです';
}


  res.send(`
    <h1>診断結果</h1>
    <p>Eの点数: ${eScore}</p>
    <p>Iの点数: ${iScore}</p>
    <p>Eの割合: ${eRate}%</p>
    <p>Iの割合: ${iRate}%</p>
    <p>${typeText}</p>
    <p><a href="/">戻る</a></p>
  `);
});

app.listen(port, () => {
  console.log('http://127.0.0.1:3000 で起動中');
});

console.log('app_quadra.js 読み込み開始');

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const dataFile = path.join(__dirname, 'results_quadra.json');

function loadSavedData() {
  if (fs.existsSync(dataFile)) {
    const fileData = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(fileData);
  }

  return {
    totalAnswers: 0,
    axisTotals: {
      Alpha: 0,
      Beta: 0,
      Gamma: 0,
      Delta: 0
    }
  };
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

let savedData = loadSavedData();

const questions = [
  {
    id: 'qA1',
    text: '「もう決まっているから話し合う必要はない」と、交流や議論の場を閉じられることに抵抗を感じる',
    axis: 'Alpha'
  },
  {
    id: 'qG4',
    text: '気の利いた言葉よりも、沈黙の背景にある本音や現実を大切にし、語るなら重みのある言葉を慎重に選ぶ',
    axis: 'Gamma'
  },
  {
    id: 'qD2',
    text: '強い意志を持って周りを巻き込みながら物事を推し進めるよりも、ささやかな日常の中に楽しみを見出すことに幸せを感じる',
    axis: 'Delta'
  },
  {
    id: 'qB1',
    text: '人が自分をどう評価するかは自由。でも、その評価が不当なものなら敵対する覚悟はある',
    axis: 'Beta'
  },
  {
    id: 'qA4',
    text: '安心してくつろぎながら、様々な人と気楽に話したり楽しさを共有できる時間に幸福を感じる',
    axis: 'Alpha'
  },
  {
    id: 'qG1',
    text: '自分にできないと思うことの多くは、不可能なのではなく本当は望んでいないだけだ',
    axis: 'Gamma'
  },
  {
    id: 'qB3',
    text: '競争や序列の中で不利な立場に沈み続けるより、自分の立ち位置を見切って新しい場でやり直す方が大切だと感じる',
    axis: 'Beta'
  },
  {
    id: 'qD1',
    text: '人からどう見られるかを多少は気にしても、外見を気に病んだり飾り立てず、自然な自分であろうとする',
    axis: 'Delta'
  },
  {
    id: 'qA2',
    text: '社会の仕組みのせいで人が不幸になっていると感じると、その不当さに理不尽や不満を抱きがちだ',
    axis: 'Alpha'
  },
  {
    id: 'qB2',
    text: 'たとえ現実が辛くても絶望しない。人は夢や期待に支えられてこそ前に進めると信じる',
    axis: 'Beta'
  },
  {
    id: 'qG3',
    text: '時間には限りがある。永遠の夢や可能性にとどまるより、現実の中で本意を形にする',
    axis: 'Gamma'
  },
  {
    id: 'qD3',
    text: '未熟であることや弱さは恥ではなく、自分も未熟な存在だとあきらめることが大切だ',
    axis: 'Delta'
  },
  {
    id: 'qB4',
    text: '自分の意志や納得を後回しにしてまで周囲に合わせることに、強い違和感や抵抗を感じる',
    axis: 'Beta'
  },
  {
    id: 'qA3',
    text: '人が不当に扱われているのを見ると、その理不尽さに同情し、おかしいと声に出したり、周囲に伝えたくなる',
    axis: 'Alpha'
  },
  {
    id: 'qD4',
    text: '自分を素晴らしく見せようとするよりも、自然体の自分をさらけ出した方が信頼につながる',
    axis: 'Delta'
  },
  {
    id: 'qG2',
    text: '自分にとって最大の障害や敵は、たいてい外部よりも自分自身の中にあると感じる',
    axis: 'Gamma'
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
    <h1>クアドラ診断</h1>
    <form action="/result" method="post">
      ${questionHtml}
      <button type="submit">結果を見る</button>
    </form>
  `);
});

app.post('/result', (req, res) => {
  let scores = {
    Alpha: 0,
    Beta: 0,
    Gamma: 0,
    Delta: 0
  };

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

    scores[question.axis] += point;
  }

  savedData.totalAnswers += 1;
  savedData.axisTotals.Alpha += scores.Alpha;
  savedData.axisTotals.Beta += scores.Beta;
  savedData.axisTotals.Gamma += scores.Gamma;
  savedData.axisTotals.Delta += scores.Delta;

  saveData(savedData);

  const total = scores.Alpha + scores.Beta + scores.Gamma + scores.Delta;

  const alphaRate = total === 0 ? 0 : ((scores.Alpha / total) * 100).toFixed(1);
  const betaRate = total === 0 ? 0 : ((scores.Beta / total) * 100).toFixed(1);
  const gammaRate = total === 0 ? 0 : ((scores.Gamma / total) * 100).toFixed(1);
  const deltaRate = total === 0 ? 0 : ((scores.Delta / total) * 100).toFixed(1);

  let topAxis = 'Alpha';
  let topScore = scores.Alpha;

  for (const axis of ['Beta', 'Gamma', 'Delta']) {
    if (scores[axis] > topScore) {
      topAxis = axis;
      topScore = scores[axis];
    }
  }

  let typeText = '';

  if (
    scores.Alpha === scores.Beta &&
    scores.Beta === scores.Gamma &&
    scores.Gamma === scores.Delta
  ) {
    typeText = '4つのクアドラが同じくらい出ています';
  } else {
    typeText = `あなたは ${topAxis} クアドラ寄りです`;
  }

  const descriptions = {
    Alpha: '交流や言語化を通して場をひらき、不当さには言葉で応じようとする傾向です。',
    Beta: '意志や理想を重んじ、外からの評価よりも自分の納得を守ろうとする傾向です。',
    Gamma: '沈黙や観察を通して本質を見極め、現実の中で本意を形にしようとする傾向です。',
    Delta: '穏やかな日常や私的な安心を大切にし、飾りすぎない自然体を守ろうとする傾向です。'
  };

  const resultCards = [
    { name: 'Alpha', rate: alphaRate, text: descriptions.Alpha },
    { name: 'Beta', rate: betaRate, text: descriptions.Beta },
    { name: 'Gamma', rate: gammaRate, text: descriptions.Gamma },
    { name: 'Delta', rate: deltaRate, text: descriptions.Delta }
  ].map(item => `
    <div style="border:1px solid #ddd; border-radius:12px; padding:16px; margin-bottom:14px; background:#fff;">
      <h2 style="margin:0 0 8px 0; font-size:20px; color:#333;">${item.name}</h2>
      <p style="margin:0 0 8px 0; font-size:18px; font-weight:bold; color:#2c5aa0;">${item.rate}%</p>
      <p style="margin:0; color:#555; line-height:1.7;">${item.text}</p>
    </div>
  `).join('');

  res.send(`
    <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <title>クアドラ診断結果</title>
      </head>
      <body style="font-family:sans-serif; background:#f5f7fb; margin:0; padding:24px;">
        <div style="max-width:760px; margin:0 auto; background:#ffffff; padding:24px; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <h1 style="margin-top:0; color:#222;">クアドラ診断結果</h1>

          <p style="font-size:20px; font-weight:bold; color:#2c5aa0; margin-bottom:20px;">
            ${typeText}
          </p>

          <div style="padding:16px; background:#f0f4ff; border-radius:12px; margin-bottom:24px; color:#444; line-height:1.8;">
            気分や自己像ではなく、何を大切にし、何に強く反発するかから見た結果です。
          </div>

          ${resultCards}

          <div style="margin-top:24px; text-align:center;">
            <a href="/" style="display:inline-block; padding:12px 20px; background:#2c5aa0; color:#fff; text-decoration:none; border-radius:10px;">
              もう一度診断する
            </a>
          </div>
        </div>
      </body>
    </html>
  `);
});
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});


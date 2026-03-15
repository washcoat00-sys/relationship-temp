
const questions = [
    {
        question: "일할 때 연락은?",
        options: ["틈틈이 칼답", "퇴근 후 몰아서"],
        category: "contact"
    },
    {
        question: "기념일 선물은?",
        options: ["실용적인 현금/필요한 것", "로맨틱한 서프라이즈/편지"],
        category: "spending"
    },
    {
        question: "싸웠을 때?",
        options: ["그 자리에서 끝장 토론", "감정 가라앉히고 나중에"],
        category: "conflict"
    },
    {
        question: "내 애인이 내 친구의 깻잎을 떼준다면?",
        options: ["매너일 뿐 상관없다", "절대 안 된다"],
        category: "social"
    },
    {
        question: "주말 데이트는?",
        options: ["밖에서 에너지를 채운다", "집에서 넷플릭스 보며 쉰다"],
        category: "leisure"
    },
    {
        question: "약속 시간에 늦었을 때?",
        options: ["늦는다고 미리 말해주면 괜찮다", "이유 불문하고 늦으면 화난다"],
        category: "time"
    },
    {
        question: "식사 메뉴를 고를 때?",
        options: ["내가 주도해서 맛집을 찾아간다", "상대방이 먹고 싶은 것에 맞춘다"],
        category: "food"
    },
    {
        question: "스트레스 받을 때 푸는 방법은?",
        options: ["사람들과 만나서 신나게 놀기", "혼자 조용히 쉬기"],
        category: "stress"
    },
    {
        question: "SNS에 우리의 일상을 올리는 것?",
        options: ["적극적으로 올리고 자랑하고 싶다", "우리 둘만의 비밀로 간직하고 싶다"],
        category: "sns"
    },
    {
        question: "서로의 스마트폰 비밀번호 공유?",
        options: ["당연히 공유해야 한다", "사생활이므로 절대 공유 안 한다"],
        category: "privacy"
    }
];

let userAAnswers = [];
let userBAnswers = [];
let currentQuestionIndex = 0;
let userName = '';
let relationshipType = '';

const startScreen = document.getElementById('start-screen');
const questionScreen = document.getElementById('question-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const userNameInput = document.getElementById('user-name');
const relationshipTypeSelect = document.getElementById('relationship-type');

startBtn.addEventListener('click', () => {
    userName = userNameInput.value;
    relationshipType = relationshipTypeSelect.value;
    if (userName) {
        startScreen.style.display = 'none';
        questionScreen.style.display = 'block';
        displayQuestion();
    } else {
        alert('이름을 입력해주세요!');
    }
});

const questionContent = document.getElementById('question-content');
const progressBar = document.getElementById('progress-bar');

function displayQuestion() {
    if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        
        // Update progress bar
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;

        // Trigger animation
        questionScreen.style.animation = 'none';
        questionScreen.offsetHeight; // trigger reflow
        questionScreen.style.animation = '';

        questionContent.innerHTML = `
            <h2>${question.question}</h2>
            <button class="option-btn">${question.options[0]}</button>
            <button class="option-btn">${question.options[1]}</button>
        `;
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                userAAnswers.push(index);
                currentQuestionIndex++;
                displayQuestion();
            });
        });
    } else {
        generateLink();
    }
}

function generateLink() {
    const uniqueLink = `${window.location.href}?userB=true&answers=${btoa(JSON.stringify(userAAnswers))}`;
    questionContent.innerHTML = `
        <h2>링크를 공유해주세요!</h2>
        <p>아래 링크를 상대방에게 공유하고, 상대방이 답변을 완료하면 결과를 확인할 수 있습니다.</p>
        <div class="link-container">
            <input type="text" id="share-url" value="${uniqueLink}" readonly>
            <button id="copy-btn">링크 복사하기</button>
        </div>
    `;

    const copyBtn = document.getElementById('copy-btn');
    const shareUrlInput = document.getElementById('share-url');

    copyBtn.addEventListener('click', () => {
        shareUrlInput.select();
        shareUrlInput.setSelectionRange(0, 99999); // For mobile devices
        
        navigator.clipboard.writeText(shareUrlInput.value).then(() => {
            copyBtn.innerText = '복사 완료!';
            copyBtn.style.backgroundColor = '#2ecc71';
            setTimeout(() => {
                copyBtn.innerText = '링크 복사하기';
                copyBtn.style.backgroundColor = '#ff6b6b';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('복사에 실패했습니다. 직접 복사해 주세요.');
        });
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('userB')) {
        userAAnswers = JSON.parse(atob(urlParams.get('answers')));
        startScreen.style.display = 'none';
        questionScreen.style.display = 'block';
        currentQuestionIndex = 0;
        userBFlow();
    }
}

function userBFlow() {
    if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];

        // Update progress bar
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;

        // Trigger animation
        questionScreen.style.animation = 'none';
        questionScreen.offsetHeight; // trigger reflow
        questionScreen.style.animation = '';

        questionContent.innerHTML = `
            <h2>${question.question}</h2>
            <button class="option-btn">${question.options[0]}</button>
            <button class="option-btn">${question.options[1]}</button>
        `;
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                userBAnswers.push(index);
                currentQuestionIndex++;
                userBFlow();
            });
        });
    } else {
        calculateResult();
    }
}

function calculateResult() {
    let matchingScore = 0;
    const categoryScores = {};
    questions.forEach(q => categoryScores[q.category] = { a: 0, b: 0, match: 0 });

    for (let i = 0; i < userAAnswers.length; i++) {
        const category = questions[i].category;
        if (userAAnswers[i] === userBAnswers[i]) {
            matchingScore++;
            categoryScores[category].match = 1;
        }
        categoryScores[category].a = userAAnswers[i];
        categoryScores[category].b = userBAnswers[i];
    }

    const percentage = (matchingScore / questions.length) * 100;
    let temperature, nickname, oneLineReview, prescription;

    if (percentage >= 95) {
        temperature = "95°C";
        nickname = "용암 주의보";
        oneLineReview = "서로 없으면 못 살아요. 근데 너무 뜨거워서 가끔 데일 수 있음!";
        prescription = "A님은 B님에게 '먼저 연락하기' 쿠폰을 발행하세요";
    } else if (percentage >= 70) {
        temperature = "70°C";
        nickname = "따끈한 온수매트";
        oneLineReview = "안정적이고 편안한 사이. 이대로만 가면 장기전 가능.";
        prescription = "A님은 B님에게 '먼저 연락하기' 쿠폰을 발행하세요";
    } else if (percentage >= 36.5) {
        temperature = "36.5°C";
        nickname = "미지근한 보리차";
        oneLineReview = "평범하지만 소중함. 가끔은 자극적인 이벤트가 필요해요.";
        prescription = "A님은 B님에게 '먼저 연락하기' 쿠폰을 발행하세요";
    } else if (percentage >= 10) {
        temperature = "10°C";
        nickname = "살얼음판 걷기";
        oneLineReview = "서로 다른 행성에서 온 듯. 대화가 시급합니다!";
        prescription = "A님은 B님에게 '먼저 연락하기' 쿠폰을 발행하세요";
    } else {
        temperature = "-10°C";
        nickname = "드라이아이스";
        oneLineReview = "닿으면 아파요. 멀리서 응원하는 사이가 나을지도?";
        prescription = "A님은 B님에게 '먼저 연락하기' 쿠폰을 발행하세요";
    }

    questionScreen.style.display = 'none';
    resultScreen.style.display = 'block';

    document.getElementById('temperature').innerText = temperature;
    document.getElementById('nickname').innerText = nickname;
    document.getElementById('one-line-review').innerText = oneLineReview;
    document.getElementById('prescription').innerText = prescription;

    const ctx = document.getElementById('result-chart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.keys(categoryScores),
            datasets: [{
                label: '일치율',
                data: Object.values(categoryScores).map(s => s.match * 100),
                backgroundColor: 'rgba(255, 107, 107, 0.5)',
                borderColor: 'rgba(255, 107, 107, 1)',
                borderWidth: 2
            }]
        },
        options: {
            scale: {
                ticks: { beginAtZero: true, max: 100 }
            }
        }
    });
}

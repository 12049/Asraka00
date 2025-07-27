// بيانات الاختبارات (سيتم جلبها من tests.json لكن لأغراض التوضيح سنضع مثال هنا)
// في الواقع سيكون لديك ملف tests.json منفصل

// هيكل الاختبارات في tests.json
/*
[
  {
    "unit": 1,
    "tests": [
      {
        "id": 1,
        "title": "اختبار 1",
        "questions": [
          {
            "id": 1,
            "question": "What is the capital of France?",
            "options": ["London", "Berlin", "Paris", "Madrid"],
            "answer": 2
          },
          // ... 9 أسئلة أخرى
        ]
      },
      // ... اختبارات أخرى
    ]
  },
  // ... وحدات أخرى
]
*/

// في هذا الملف سنقوم بمحاكاة جلب البيانات من ملف tests.json
// لكن لأغراض التشغيل سنضع بيانات وهمية

// متغيرات عامة
let currentUnit = 1;
let currentTest = 1;
let currentQuestion = 0;
let userAnswers = [];
let timerInterval;

// عناصر الصفحة الرئيسية
const unitsContainer = document.getElementById('unitsContainer');

// عناصر صفحة الاختبار
const testPage = document.getElementById('testPage');
const questionsContainer = document.getElementById('questionsContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const timerElement = document.getElementById('timer');

// عناصر صفحة النتائج
const scoreCircle = document.getElementById('scoreCircle');
const scoreValue = document.getElementById('scoreValue');
const totalQuestions = document.getElementById('totalQuestions');
const correctAnswers = document.getElementById('correctAnswers');
const wrongAnswers = document.getElementById('wrongAnswers');
const finalScore = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const homeBtn = document.getElementById('homeBtn');

// دالة لتحميل بيانات الاختبارات
async function loadTests() {
    try {
        const response = await fetch('tests.json');
        const testsData = await response.json();
        return testsData;
    } catch (error) {
        console.error('Error loading tests:', error);
        return [];
    }
}

// عرض الوحدات والاختبارات
async function displayUnits() {
    const testsData = await loadTests();
    
    testsData.forEach(unit => {
        const unitCard = document.createElement('div');
        unitCard.className = 'unit-card';
        
        const unitHeader = document.createElement('div');
        unitHeader.className = 'unit-header';
        unitHeader.textContent = `الوحدة ${unit.unit}`;
        
        const testsContainer = document.createElement('div');
        testsContainer.className = 'tests-container';
        
        unit.tests.forEach(test => {
            const testBox = document.createElement('div');
            testBox.className = 'test-box';
            testBox.textContent = test.title;
            testBox.onclick = () => startTest(unit.unit, test.id);
            testsContainer.appendChild(testBox);
        });
        
        unitCard.appendChild(unitHeader);
        unitCard.appendChild(testsContainer);
        unitsContainer.appendChild(unitCard);
    });
}

// بدء الاختبار
function startTest(unitId, testId) {
    currentUnit = unitId;
    currentTest = testId;
    currentQuestion = 0;
    userAnswers = [];
    
    // إخفاء الصفحة الرئيسية وإظهار صفحة الاختبار
    document.getElementById('homePage').style.display = 'none';
    testPage.style.display = 'block';
    
    // بدء المؤقت
    startTimer(10 * 60); // 10 دقائق
    
    // تحميل الأسئلة وعرضها
    loadTestQuestions();
}

// بدء المؤقت
function startTimer(durationInSeconds) {
    let timeLeft = durationInSeconds;
    
    updateTimerDisplay(timeLeft);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitTest();
        }
    }, 1000);
}

// تحديث عرض المؤقت
function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timerElement.textContent = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// تحميل أسئلة الاختبار
async function loadTestQuestions() {
    const testsData = await loadTests();
    const unit = testsData.find(u => u.unit === currentUnit);
    const test = unit.tests.find(t => t.id === currentTest);
    
    displayQuestion(test.questions[currentQuestion], currentQuestion, test.questions.length);
    
    // تحديث حالة الأزرار
    updateNavigationButtons(test.questions.length);
}

// عرض السؤال
function displayQuestion(question, index, total) {
    questionsContainer.innerHTML = '';
    
    const questionElement = document.createElement('div');
    questionElement.className = 'question-container';
    
    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.textContent = `${index + 1}. ${question.question}`;
    
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    
    question.options.forEach((option, i) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        if (userAnswers[index] === i) {
            optionElement.classList.add('selected');
        }
        optionElement.textContent = option;
        optionElement.onclick = () => selectOption(i, optionElement);
        optionsContainer.appendChild(optionElement);
    });
    
    questionElement.appendChild(questionText);
    questionElement.appendChild(optionsContainer);
    questionsContainer.appendChild(questionElement);
}

// اختيار الإجابة
function selectOption(optionIndex, element) {
    // إزالة التحديد من جميع الخيارات
    const options = element.parentElement.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('selected'));
    
    // تحديد الخيار الحالي
    element.classList.add('selected');
    userAnswers[currentQuestion] = optionIndex;
}

// تحديث أزرار التنقل
function updateNavigationButtons(totalQuestions) {
    prevBtn.disabled = currentQuestion === 0;
    nextBtn.disabled = false;
    submitBtn.style.display = currentQuestion === totalQuestions - 1 ? 'block' : 'none';
}

// السؤال التالي
nextBtn.onclick = () => {
    if (currentQuestion < totalQuestions - 1) {
        currentQuestion++;
        loadTestQuestions();
    }
};

// السؤال السابق
prevBtn.onclick = () => {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadTestQuestions();
    }
};

// تصحيح الإجابات
submitBtn.onclick = () => {
    clearInterval(timerInterval);
    submitTest();
};

// إرسال الاختبار وعرض النتائج
async function submitTest() {
    const testsData = await loadTests();
    const unit = testsData.find(u => u.unit === currentUnit);
    const test = unit.tests.find(t => t.id === currentTest);
    const questions = test.questions;
    
    let correctCount = 0;
    
    // حساب الإجابات الصحيحة
    userAnswers.forEach((answer, index) => {
        if (answer === questions[index].answer) {
            correctCount++;
        }
    });
    
    const score = Math.round((correctCount / questions.length) * 100);
    
    // تخزين النتائج في localStorage لعرضها في صفحة النتائج
    localStorage.setItem('testResults', JSON.stringify({
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        wrongAnswers: questions.length - correctCount,
        score: score
    }));
    
    // الانتقال إلى صفحة النتائج
    window.location.href = 'results.html';
}

// عرض النتائج
function displayResults() {
    const results = JSON.parse(localStorage.getItem('testResults'));
    
    if (!results) {
        window.location.href = 'index.html';
        return;
    }
    
    // تحديث عناصر النتائج
    totalQuestions.textContent = results.totalQuestions;
    correctAnswers.textContent = results.correctAnswers;
    wrongAnswers.textContent = results.wrongAnswers;
    finalScore.textContent = `${results.score}%`;
    scoreValue.textContent = `${results.score}%`;
    
    // تحديث دائرة النتيجة
    scoreCircle.style.setProperty('--p', `${results.score}%`);
}

// إعادة الاختبار
restartBtn.onclick = () => {
    // إعادة تحميل نفس الاختبار
    window.location.href = `test.html?unit=${currentUnit}&test=${currentTest}`;
};

// العودة للصفحة الرئيسية
homeBtn.onclick = () => {
    window.location.href = 'index.html';
};

// تهيئة الصفحات
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = document.body.id || window.location.pathname;
    
    if (currentPage.includes('index.html') || currentPage === '/') {
        displayUnits();
    } else if (currentPage.includes('test.html')) {
        // تحميل معلمات وحدة الاختبار ورقم الاختبار من الرابط
        const urlParams = new URLSearchParams(window.location.search);
        currentUnit = parseInt(urlParams.get('unit'));
        currentTest = parseInt(urlParams.get('test'));
        
        if (currentUnit && currentTest) {
            startTest(currentUnit, currentTest);
        } else {
            window.location.href = 'index.html';
        }
    } else if (currentPage.includes('results.html')) {
        displayResults();
    }
});

// 2025학년도 6월 모의평가 (공통/미적분/확통)
// API 사용 금지 요청을 엄격하게 반영하여 로컬 이미지 렌더링 폴백으로 완벽하게 복구했습니다.

const ans2025_common = [0, 4, 2, 1, 3, 2, 4, 3, 0, 0, 4, 1, 2, 3, 0, "3", "15", "11", "7", "39", "25", "16"];
const ans2025_calculus = [0, 2, 3, 1, 2, 3, "109", "25"];
const ans2025_stats = [2, 4, 0, 1, 0, 4, "44", "115"];

function getPointStr(id) {
    if (id <= 2) return "2점";
    if (id <= 8) return "3점";
    if (id <= 15) return "4점";
    if (id <= 19) return "3점";
    if (id <= 22) return "4점";
    if (id === 23) return "2점";
    if (id <= 27) return "3점";
    return "4점";
}

function getOptions(id) {
    // 1~15번, 23~28번 객관식 (UI 렌더링용 빈 배열 5칸)
    if ((id >= 1 && id <= 15) || (id >= 23 && id <= 28)) {
        return ["", "", "", "", ""]; 
    }
    // 16~22번, 29~30번 주관식 단답형
    return []; 
}

export const commonQuestions = Array.from({length: 22}, (_, i) => {
    const id = i + 1;
    const num = String(id).padStart(3, '0');
    
    if (id === 10) {
        return {
            id: 10,
            type: "4점",
            text: "실수 $a(a>1)$에 대하여 곡선 $y=\\log_a(x+3)$이 곡선 $y=\\log_a(-x+3)$과 만나는 점을 $A$, 곡선 $y=\\log_a(x+3)$이 $x$축과 만나는 점을 $B$, 곡선 $y=\\log_a(-x+3)$이 $x$축과 만나는 점을 $C$라 하자. 삼각형 $ABC$가 정삼각형일 때, $a$의 값은?",
            options: ["$3^{\\frac{\\sqrt{3}}{6}}$", "$3^{\\frac{\\sqrt{3}}{4}}$", "$3^{\\frac{\\sqrt{3}}{3}}$", "$3^{\\frac{5\\sqrt{3}}{12}}$", "$3^{\\frac{\\sqrt{3}}{2}}$"],
            answer: 0,
            tag: "공통"
        };
    }
    
    if (id === 11) {
        return {
            id: 11,
            type: "4점",
            text: "시각 $t=0$일 때 출발하여 수직선 위를 움직이는 점 $\\mathrm{P}$가 있다. 시각이 $t \\; (t \\ge 0)$일 때 점 $\\mathrm{P}$의 위치 $x$가\n$$ x = t^3 - t^2 - t + 1 $$\n이다. |보기|에서 옳은 것만을 있는 대로 고른 것은?\n\n|보기|\nㄱ. 시각 $t=1$일 때 점 $\\mathrm{P}$의 위치는 $1$이다.\nㄴ. 시각 $t=1$일 때 점 $\\mathrm{P}$의 속도는 $0$이다.\nㄷ. 출발한 후 점 $\\mathrm{P}$의 운동 방향이 바뀌는 시각에 점 $\\mathrm{P}$의 가속도는 $4$이다.",
            options: ["ㄱ", "ㄴ", "ㄷ", "ㄱ, ㄷ", "ㄴ, ㄷ"],
            answer: 4,
            tag: "공통"
        };
    }
    
    if (id === 12) {
        return {
            id: 12,
            type: "4점",
            text: "다음 조건을 만족시키는 모든 수열 $\\{a_n\\}$에 대하여 $a_4$의 최댓값은?\n\n(가) $a_1 = a_3$\n(나) 모든 자연수 $n$에 대하여\n$$(a_{n+1} - a_n + 3)(a_{n+1} - 2a_n) = 0$$\n이다.",
            options: ["$9$", "$12$", "$15$", "$18$", "$21$"],
            answer: 1,
            tag: "공통"
        };
    }
    
    if (id === 13) {
        return {
            id: 13,
            type: "4점",
            text: "그림과 같이 함수 $f(x)=3x^2-7x+2$에 대하여 곡선 $y=f(x)$와 직선 $y=\\frac{1}{3}x-\\frac{2}{3}$ 및 $y$축으로 둘러싸인 영역을 $A$, 곡선 $y=f(x)$와 직선 $y=\\frac{1}{3}x-\\frac{2}{3}$로 둘러싸인 영역을 $B$, 곡선 $y=f(x)$와 두 직선 $y=\\frac{1}{3}x-\\frac{2}{3}$, $x=k \\; (k>2)$로 둘러싸인 영역을 $C$라 하자.\n$$(A\\text{의 넓이}) + (C\\text{의 넓이}) = (B\\text{의 넓이})$$\n일 때, 상수 $k$의 값은?",
            figure: '/math_crops/고3수능및모의고사/월별모의고사/6월/미적분_2025_6월/013.webp',
            options: ["$\\frac{29}{12}$", "$\\frac{5}{2}$", "$\\frac{31}{12}$", "$\\frac{8}{3}$", "$\\frac{11}{4}$"],
            answer: 3,
            tag: "공통"
        };
    }
    
    if (id === 14) {
        return {
            id: 14,
            type: "4점",
            text: "$\\overline{\\mathrm{AB}}=2\\sqrt{7}$인 삼각형 $\\mathrm{ABC}$에서 선분 $\\mathrm{BC}$의 중점을 $\\mathrm{P}$, 선분 $\\mathrm{BC}$를 $5:1$로 내분하는 점을 $\\mathrm{Q}$라 하자.\n$$\\overline{\\mathrm{AQ}}=3\\sqrt{2}, \\quad \\sin(\\angle \\mathrm{QAP}) : \\sin(\\angle \\mathrm{APQ}) = \\sqrt{2} : 3$$\n일 때, 삼각형 $\\mathrm{ABC}$의 외접원의 넓이는?",
            figure: '/math_crops/고3수능및모의고사/월별모의고사/6월/미적분_2025_6월/014.webp',
            options: ["$\\frac{85}{9}\\pi$", "$\\frac{88}{9}\\pi$", "$\\frac{91}{9}\\pi$", "$\\frac{94}{9}\\pi$", "$\\frac{97}{9}\\pi$"],
            answer: 1,
            tag: "공통"
        };
    }
    
    if (id === 15) {
        return {
            id: 15,
            type: "4점",
            text: "상수 $k$와 $f'(0)=6$인 삼차함수 $f(x)$에 대하여 함수\n$$g(x) = \\begin{cases} f(x)+k & (|x| > 1) \\\\ -f(x) & (|x| \\le 1) \\end{cases}$$\n이 다음 조건을 만족시킬 때, $k + f\\left(\\frac{1}{2}\\right)$의 값은?\n\n(가) 모든 실수 $a$에 대하여 $\\displaystyle \\lim_{x \\to a+} \\frac{g(x)-g(a)}{x-a}$의 값이 존재하고 그 값은 $0$ 이하이다.\n(나) $x$에 대한 방정식 $g(x)=t$의 서로 다른 실근의 개수가 $2$가 되도록 하는 실수 $t$의 최댓값은 $13$이다.",
            options: ["$\\frac{15}{4}$", "$\\frac{27}{4}$", "$\\frac{39}{4}$", "$\\frac{51}{4}$", "$\\frac{63}{4}$"],
            answer: 0,
            tag: "공통"
        };
    }
    
    if (id === 21) {
        return {
            id: 21,
            type: "4점",
            text: "함수 $f(x)=(x-1)(x-2)$와 최고차항의 계수가 $1$인 사차함수 $g(x)$가 다음 조건을 만족시킨다.\n\n모든 실수 $a$에 대하여\n$$\\lim_{x \\to a} \\frac{g(x) \\times |f(x)|}{f(x)}\\text{ 의 값과 } \\lim_{x \\to a} \\frac{|g(x) - f(x)|}{g(x)}\\text{ 의 값이 모두 존재한다.}$$\n\n$g(-1)$의 값을 구하시오.",
            options: [],
            answer: "42",
            tag: "공통"
        };
    }
    
    if (id === 22) {
        return {
            id: 22,
            type: "4점",
            text: "$k > 1$인 실수 $k$에 대하여 두 곡선\n$$y = 2^x + \\frac{k}{2}, \\quad y = k \\times \\left(\\frac{1}{2}\\right)^x + k - 2$$\n가 만나는 점을 $\\mathrm{A}$라 하고, 점 $\\mathrm{A}$를 지나고 기울기가 $-1$인 직선이 곡선 $y = 2^{x-2} - 3$과 만나는 점을 $\\mathrm{B}$라 하자. 삼각형 $\\mathrm{AOB}$의 넓이가 $16$일 때, $k + \\log_2 k = \\frac{q}{p}$이다. $p+q$의 값을 구하시오. (단, $\\mathrm{O}$는 원점이고, $p$와 $q$는 서로소인 자연수이다.)",
            options: [],
            answer: "38",
            tag: "공통"
        };
    }

    return {
        id: id,
        type: getPointStr(id),
        text: "", // text가 비어 있으면 MentosMockExam.jsx에서 원본 이미지를 렌더링합니다. (API 미사용)
        picture: `/math_crops/고3수능및모의고사/월별모의고사/6월/미적분_2025_6월/${num}.webp`,
        options: getOptions(id),
        answer: ans2025_common[i],
        tag: "공통"
    };
});

export const calculusQuestions = Array.from({length: 8}, (_, i) => {
    const id = i + 23;
    const num = String(id).padStart(3, '0');
    
    if (id === 27) {
        return {
            id: 27,
            type: "3점",
            text: "그림과 같이 길이가 $2$인 선분 $\\mathrm{AB}$를 지름으로 하는 반원의 호 $\\mathrm{AB}$ 위의 점 $\\mathrm{P}$에 대하여 $\\angle \\mathrm{BAP} = \\theta \\; (\\frac{\\pi}{4} < \\theta < \\frac{\\pi}{2})$라 하고, 점 $\\mathrm{P}$를 지나고 선분 $\\mathrm{AB}$에 평행한 직선이 호 $\\mathrm{AB}$와 만나는 점 중 $\\mathrm{P}$가 아닌 점을 $\\mathrm{Q}$라 하자. 사각형 $\\mathrm{ABQP}$의 넓이를 $f(\\theta)$라 하고, $\\overline{\\mathrm{AP}} : \\overline{\\mathrm{BP}} = 1 : 3$이 되도록 하는 $\\theta$의 값을 $a$라 할 때, $f'(a)$의 값은?",
            figure: '/math_crops/고3수능및모의고사/월별모의고사/6월/미적분_2025_6월/027.webp',
            options: ["$-\\frac{64}{25}$", "$-\\frac{59}{25}$", "$-\\frac{54}{25}$", "$-\\frac{49}{25}$", "$-\\frac{44}{25}$"],
            answer: 2,
            tag: "미적분"
        };
    }
    
    if (id === 28) {
        return {
            id: 28,
            type: "4점",
            text: "실수 전체의 집합에서 이계도함수를 갖는 함수 $f(x)$와 두 상수 $a, b$가 다음 조건을 만족시킬 때, $a \\times e^b$의 값은?\n\n(가) 모든 실수 $x$에 대하여\n$$\\{f(x)\\}^5 + \\{f(x)\\}^3 + ax + b = \\ln \\left( x^2 + x + \\frac{5}{2} \\right)$$\n이다.\n(나) $f(-3)f(3) < 0, \\; f'(2) > 0$",
            options: ["$-3e^{-\\frac{4}{3}}$", "$-\\frac{5}{3}e^{-\\frac{4}{3}}$", "$-\\frac{1}{3}e^{-\\frac{4}{3}}$", "$e^{-\\frac{4}{3}}$", "$\\frac{7}{3}e^{-\\frac{4}{3}}$"],
            answer: 0,
            tag: "미적분"
        };
    }
    
    if (id === 29) {
        return {
            id: 29,
            type: "4점",
            text: "두 정수 $\\alpha, \\beta \\; (\\alpha > \\beta)$에 대하여 다음 조건을 만족시키는 수열 $\\{a_n\\}$이 있다.\n\n모든 자연수 $n$에 대하여\n$$a_n = \\alpha \\times \\sin \\frac{n}{2}\\pi + \\beta \\times \\cos \\frac{n}{2}\\pi$$\n이고, $a_1 \\times a_2 \\times a_3 \\times a_4 = 4$이다.\n\n수열 $\\{a_n\\}$과 $b_1 > 0$인 등비수열 $\\{b_n\\}$에 대하여\n$$\\sum_{n=1}^\\infty (a_{4n-2}b_n) = \\sum_{n=1}^\\infty (a_{4n-3}b_{2n}) = 6$$\n일 때, $b_1 \\times b_3 = \\frac{q}{p}$이다. $p+q$의 값을 구하시오.\n(단, $p$와 $q$는 서로소인 자연수이다.)",
            options: [],
            answer: "109",
            tag: "미적분"
        };
    }
    
    if (id === 30) {
        return {
            id: 30,
            type: "4점",
            text: "최고차항의 계수가 $1$인 삼차함수 $f(x)$에 대하여 함수\n$$g(x) = \\left| f\\left( \\frac{2}{1+e^{-x}} \\right) \\right|$$\n가 실수 전체의 집합에서 미분가능하고 다음 조건을 만족시킨다.\n\n(가) 함수 $g(x)$는 $x=0$에서 극소이고, $g(0) > 0$이다.\n(나) $g'(\\ln 3) < 0, \\; |g'(-\\ln 3)| = \\frac{3}{8} g(-\\ln 3)$\n\n$g(0)$의 최솟값을 $\\frac{q}{p}$라 할 때, $p+q$의 값을 구하시오.\n(단, $p$와 $q$는 서로소인 자연수이다.)",
            options: [],
            answer: "25",
            tag: "미적분"
        };
    }

    return {
        id: id,
        type: getPointStr(id),
        text: "",
        picture: `/math_crops/고3수능및모의고사/월별모의고사/6월/미적분_2025_6월/${num}.webp`,
        options: getOptions(id),
        answer: ans2025_calculus[i],
        tag: "미적분"
    };
});

export const statsQuestions = Array.from({length: 8}, (_, i) => {
    const id = i + 23;
    const num = String(id).padStart(3, '0');
    if (id === 27) {
        return {
            id: 27,
            type: "3점",
            text: "$5$명이 둘러앉을 수 있는 원 모양의 탁자와 남학생 $5$명, 여학생 $3$명이 있다. 이 $8$명의 학생 중에서 $4$명 이상의 남학생을 포함하여 $5$명의 학생을 선택하고 이 $5$명의 학생 모두를 일정한 간격으로 탁자에 둘러앉게 하는 경우의 수는?\n(단, 회전하여 일치하는 것은 같은 것으로 본다.)",
            figure: '/math_crops/고3수능및모의고사/월별모의고사/6월/확통_2025_6월/027.webp',
            options: ["$384$", "$408$", "$432$", "$456$", "$480$"],
            answer: 0,
            tag: "확률과통계"
        };
    }
    
    if (id === 28) {
        return {
            id: 28,
            type: "4점",
            text: "공 $15$개와 비어 있는 세 상자 $\\mathrm{A, B, C}$가 있다. 한 개의 주사위를 사용하여 다음 규칙에 따라 세 상자 $\\mathrm{A, B, C}$에 공을 넣는 시행을 한다.\n\n주사위를 한 번 던져\n나온 눈의 수가 $3$의 배수이면 세 상자 $\\mathrm{A, B, C}$에 넣는 공의 개수가 각각 $1, 2, 0$이고,\n나온 눈의 수가 $3$의 배수가 아니면 세 상자 $\\mathrm{A, B, C}$에 넣는 공의 개수가 각각 $1, 1, 1$이다.\n\n이 시행을 $5$번 반복한 후 상자 $\\mathrm{B}$에 들어 있는 공의 개수가 홀수일 때, 상자 $\\mathrm{A}$에 들어 있는 공의 개수와 상자 $\\mathrm{C}$에 들어 있는 공의 개수의 합이 $8$ 이상일 확률은?",
            figure: '/math_crops/고3수능및모의고사/월별모의고사/6월/확통_2025_6월/028.webp',
            options: ["$\\frac{44}{61}$", "$\\frac{47}{61}$", "$\\frac{50}{61}$", "$\\frac{53}{61}$", "$\\frac{56}{61}$"],
            answer: 4,
            tag: "확률과통계"
        };
    }
    
    if (id === 29) {
        return {
            id: 29,
            type: "4점",
            text: "한 개의 주사위를 세 번 던져서 나오는 눈의 수를 차례로 $a, b, c$라 할 때, $a+b=8$ 또는 $b \\ge c$일 확률은 $\\frac{q}{p}$이다. $p+q$의 값을 구하시오.\n(단, $p$와 $q$는 서로소인 자연수이다.)",
            options: [],
            answer: "44",
            tag: "확률과통계"
        };
    }
    
    if (id === 30) {
        return {
            id: 30,
            type: "4점",
            text: "집합 $X=\\{1, 2, 3, 4, 5\\}$에 대하여 다음 조건을 만족시키는 함수 $f: X \\to X$의 개수를 구하시오.\n\n(가) $x=1, 2, 3, 4$일 때, $f(x+1)+3 \\ge f(x)+x$이다.\n(나) $f(2)$의 값은 홀수이다.",
            options: [],
            answer: "115",
            tag: "확률과통계"
        };
    }

    return {
        id: id,
        type: getPointStr(id),
        text: "",
        picture: `/math_crops/고3수능및모의고사/월별모의고사/6월/확통_2025_6월/${num}.webp`,
        options: getOptions(id),
        answer: ans2025_stats[i],
        tag: "확률과통계"
    };
});
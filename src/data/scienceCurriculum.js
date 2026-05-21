// src/data/scienceCurriculum.js
export const scienceCurriculum = {
  "중1": [
    {
      months: [3, 4],
      unit: "여러 가지 힘",
      concepts: ["중력", "마찰력", "탄성력"],

      // 실생활 연결 예시 (낮은 등급용 필수)
      realLifeExamples: [
        "공을 위로 던지면 왜 다시 내려올까?",
        "얼음판 위에서 미끄러지는 이유는?",
        "용수철을 누르면 다시 튀어오르는 이유는?"
      ],
      easyExplanation: "힘은 물체를 밀거나 당기거나 모양을 바꾸는 무언가야. 공이 땅으로 떨어지는 것, 발로 차면 날아가는 것, 용수철이 튀어오르는 것, 이 모든 게 힘 때문이야.",

      // 낮은 등급(4~5) 대화 흐름: 실생활 → 쉬운설명 → 확인 → 쉬운적용 → 공식
      beginnerFlow: [
        { type: "realLife", text: "농구공을 바닥에 떨어뜨리면 어떻게 돼? 튀어오르잖아. 그 장면 머릿속에 그려봐." },
        { type: "easyExplain", text: "이렇게 물체를 누르거나 당기는 작용을 '힘'이라고 불러. 아주 간단하지?" },
        { type: "check", text: "그럼 사람이 벽을 밀면? 벽에 힘이 작용한 걸까?" },
        { type: "easyApply", text: "책상 위에 지우개를 놓았어. 지우개에 작용하는 힘은 어떤 방향일까?" },
        { type: "concept", questions: {
            concept: "힘이란 무엇인지 네 말로 설명해볼래?",
            apply: "공을 세게 차면 왜 더 멀리 갈까?",
            misconception: "힘이 없으면 물체는 반드시 멈춘다. 이 말이 맞을까?",
            thinking: "중력이 없는 우주에서 공을 던지면 어떻게 될까?"
          }
        }
      ],
      checkQuestions: [
        "지구가 사과를 끌어당기는 힘 이름이 뭐야?",
        "얼음판 위에서 잘 미끄러지는 이유는?"
      ],

      // 등급별 진단 질문 (level에 맞게 선택)
      questions: {
        beginner: { // 4~5등급
          concept: "공을 위로 던지면 다시 내려오잖아. 왜 그럴까? 네 생각을 편하게 말해봐.",
          apply: "농구공을 바닥에 살짝 놓으면 그냥 있잖아. 세게 차면 굴러가고. 차이가 뭘까?",
          misconception: "얼음판에서는 힘을 안 줘도 미끄러지잖아. 힘이 없어도 움직일 수 있는 거 아닐까?",
          thinking: "달 위에서 공을 던지면 지구에서와 다를까? 어떻게 다를 것 같아?"
        },
        intermediate: { // 3등급
          concept: "힘이 뭐라고 생각해? 물체에 어떤 영향을 줄까?",
          apply: "공을 세게 차면 왜 더 멀리 갈까?",
          misconception: "힘이 없으면 물체는 반드시 멈춘다. 이 말이 맞을까?",
          thinking: "중력이 없는 우주에서 공을 던지면 어떻게 될까?"
        },
        advanced: { // 1~2등급
          concept: "힘이란 무엇인지 뉴턴의 관점으로 설명해봐.",
          apply: "두 물체가 충돌할 때 작용-반작용은 어떻게 적용되지?",
          misconception: "등속 직선 운동 중인 물체에 합력이 0이라는 게 무슨 뜻일까?",
          thinking: "마찰력과 관성의 관계를 실생활 예시와 함께 설명해봐."
        }
      }
    },
    {
      months: [5, 6, 7],
      unit: "지구계와 지권의 변화",
      concepts: ["지구계 요소", "암석 순환", "지진과 화산"],
      realLifeExamples: [
        "바닷가에서 파도가 바위를 깎는 장면",
        "화산이 폭발해서 마을이 덮이는 뉴스",
        "지진이 나면 땅이 흔들리는 경험"
      ],
      easyExplanation: "지구는 공기(기권), 물(수권), 생물(생물권), 땅(지권), 우주(외권) 이 5가지로 이루어져 있어. 얘네가 서로 영향을 주고받아.",
      beginnerFlow: [
        { type: "realLife", text: "화산 폭발 영상을 봤어? 용암이 흘러내리고 하늘이 어두워지잖아. 왜?그게 어떤 관계인지 생각해봐." },
        { type: "easyExplain", text: "지구는 5가지 구성 요소가 있어: 공기, 물, 땅, 생물, 우주. 화산이 터지면 땅에서 물질이 나와 공기를 바꾸고, 그게 날씨에도 영향을 줘." },
        { type: "check", text: "바닷물이 증발하면 어느 구성 요소로 이동하는 걸까?" },
        { type: "easyApply", text: "지진이 생기면 바다에도 영향을 줄 수 있을까? 어떤 식으로?" },
        { type: "concept", questions: {
            concept: "지구계 5요소를 기억나는 대로 말해봐.",
            apply: "화산 폭발이 기권(대기)에 어떤 영향을 미칠까?",
            misconception: "바위는 절대 변하지 않는다. 맞는 말일까?",
            thinking: "달에는 지구계 요소 중 어떤 게 모자라서 생명체가 살 수 없을까?"
          }
        }
      ],
      checkQuestions: [
        "지구계에서 '기권'이 뭔지 말해봐.",
        "암석이 어떻게 바뀔 수 있는지 하나만 예를 들어봐."
      ],
      questions: {
        beginner: {
          concept: "지구 안에 어떤 요소들이 있는지 알아? 물, 공기, 땅... 또 뭔가 있을까?",
          apply: "화산이 폭발하면 공기가 어떻게 달라질까?",
          misconception: "돌멩이는 절대 안 변한다고 생각해?",
          thinking: "달에 생명체가 살기 어려운 이유를 지구랑 비교해서 말해봐."
        },
        intermediate: {
          concept: "지구계에 포함되는 5가지 요소가 뭔지 말해봐.",
          apply: "화산 폭발이 기권(대기)에 어떤 영향을 줄까?",
          misconception: "바위는 절대 변하지 않는다. 맞을까?",
          thinking: "달과 지구 중 생명체에 유리한 곳은?"
        },
        advanced: {
          concept: "지구계 구성 요소 간 상호작용을 예를 들어 설명해봐.",
          apply: "판 구조론과 화산 활동의 관계는?",
          misconception: "화성암, 퇴적암, 변성암의 순환 과정을 설명해봐.",
          thinking: "판게아 이론이 지지받는 증거들을 논해봐."
        }
      }
    }
  ],
  "중2": [
    {
      months: [3, 4],
      unit: "물질의 구성",
      concepts: ["원소", "원자", "분자", "이온"],
      realLifeExamples: [
        "물을 끓이면 수증기가 되는 현상",
        "설탕이 물에 녹아 보이지 않지만 맛은 남아있음",
        "철이 녹슬어 붉게 변하는 것"
      ],
      easyExplanation: "모든 물질은 아주 작은 알갱이인 '원자'로 이루어져. 원자들이 뭉친 게 '분자'야. 물(H₂O)은 수소 원자 2개 + 산소 원자 1개가 붙은 분자야.",
      beginnerFlow: [
        { type: "realLife", text: "설탕을 물에 넣으면 사라지잖아. 근데 단 맛은 있고. 설탕은 어디 간 걸까?" },
        { type: "easyExplain", text: "설탕은 없어진 게 아니야. 눈에 안 보일 만큼 작게 쪼개진 거야. 이렇게 물질을 이루는 가장 작은 단위를 '원자'라고 해." },
        { type: "check", text: "물을 끓이면 수증기가 되잖아. 물 분자가 없어진 걸까, 다른 곳으로 간 걸까?" },
        { type: "easyApply", text: "물(H₂O)에는 수소와 산소가 있어. 수소 원소 기호가 H라면 산소는 뭘까?" },
        { type: "concept", questions: {
            concept: "원자와 분자의 차이가 뭔지 말해봐.",
            apply: "물을 전기분해하면 어떤 원소가 나올까?",
            misconception: "물을 얼리면 얼음이 되는데 분자 자체가 커지는 걸까?",
            thinking: "원자가 단 10종류뿐이라면 세상이 어떻게 될까?"
          }
        }
      ],
      checkQuestions: [
        "원소와 원자의 차이를 쉽게 말해봐.",
        "물 분자(H₂O)에는 어떤 원자들이 있어?"
      ],
      questions: {
        beginner: {
          concept: "설탕을 물에 녹이면 어디 간 걸까? 없어진 걸까?",
          apply: "물(H₂O)에 수소랑 산소가 있는데, 물을 끓이면 이 원자들이 사라질까?",
          misconception: "얼음이 물보다 부피가 크잖아. 분자가 커진 걸까?",
          thinking: "세상의 모든 물질이 원자로 이루어져 있다면, 금과 쇠는 어떻게 다른 걸까?"
        },
        intermediate: {
          concept: "원자와 분자의 차이가 뭔지 말해봐.",
          apply: "물을 전기분해하면 어떤 원소들이 나올까?",
          misconception: "물을 얼리면 분자 자체가 커지는 걸까?",
          thinking: "원자가 10종류뿐이라면?"
        },
        advanced: {
          concept: "원자, 분자, 이온의 개념과 관계를 설명해봐.",
          apply: "KCl(염화칼륨)이 물에 녹으면 어떤 이온이 생성되나?",
          misconception: "이온 결합과 공유 결합의 차이를 전자 관점으로 설명해봐.",
          thinking: "동위원소는 같은 원소이면서 왜 질량이 다를까?"
        }
      }
    }
  ],
  "중3": [
    {
      months: [3, 4],
      unit: "화학 반응의 규칙",
      concepts: ["질량 보존 법칙", "일정 성분비 법칙", "발열/흡열 반응"],
      realLifeExamples: [
        "나무가 타서 재가 됨 (불 반응)",
        "손난로를 흔들면 따뜻해짐",
        "베이킹파우더가 반응하면 빵이 부풀어오름"
      ],
      easyExplanation: "화학 반응이 일어나도 원자의 종류와 수는 변하지 않아. 그래서 반응 전후 질량은 항상 같아. 나무가 타서 재가 되어도 원자들이 없어진 게 아니라 다른 곳(공기 중)으로 간 거야.",
      beginnerFlow: [
        { type: "realLife", text: "나무를 태우면 재만 남고 가벼워지잖아. 나무가 없어진 걸까?" },
        { type: "easyExplain", text: "아니야! 나무의 원자들은 없어지지 않고, 이산화탄소(CO₂)와 물(H₂O)이 되어 공기 중으로 날아간 거야. 원자의 수와 종류는 **항상 보존돼**." },
        { type: "check", text: "그럼 통 안에서 나무를 태우면 총 질량이 변할까?"},
        { type: "easyApply", text: "손난로를 흔들면 따뜻해지잖아. 이건 열이 나오는 반응일까, 흡수하는 반응일까?" },
        { type: "concept", questions: {
            concept: "질량 보존 법칙이 뭔지 쉽게 말해봐.",
            apply: "밀폐 용기 안에서 화학 반응이 일어나면 질량이 변할까?",
            misconception: "나무가 타서 재가 되면 가벼워지는데, 질량 보존이 맞는 말인가?",
            thinking: "왜 손난로는 따뜻해지고 냉각 팩은 차가워질까?"
          }
        }
      ],
      checkQuestions: [
        "화학 반응 후에 원자 수가 변할까?",
        "발열 반응과 흡열 반응의 예시를 하나씩 말해봐."
      ],
      questions: {
        beginner: {
          concept: "나무가 타면 재만 남잖아. 나무가 없어진 걸까?",
          apply: "손난로 흔들면 뜨거워지잖아. 어디서 열이 나올까?",
          misconception: "나무 타면 가벼워지는데 질량이 보존된다고?",
          thinking: "냉각 팩은 왜 차가워질까? 손난로와 반대인 이유가 뭘까?"
        },
        intermediate: {
          concept: "질량 보존 법칙이 무엇인지 설명해봐.",
          apply: "밀폐된 용기 안에서 화학 반응이 일어나면 질량이 변할까?",
          misconception: "나무가 타서 재가 되면 가벼워지는데 이게 질량 보존 법칙과 모순 아닐까?",
          thinking: "발열/흡열 반응의 일상 속 예시를 들어봐."
        },
        advanced: {
          concept: "질량 보존, 일정 성분비, 기체 반응의 법칙을 각각 설명해봐.",
          apply: "2H₂ + O₂ → 2H₂O 에서 반응 질량비를 계산해봐.",
          misconception: "연소 반응이 왜 단순히 물질이 없어지는 게 아닌지 설명해봐.",
          thinking: "화학 반응에서 에너지 변화를 결합 에너지 관점에서 설명해봐."
        }
      }
    }
  ],
  "고1": [
    {
      months: [3, 4],
      unit: "역학과 에너지",
      concepts: ["등속 직선 운동", "자유 낙하", "뉴턴 운동 법칙"],
      realLifeExamples: [
        "정지한 엘리베이터에서 갑자기 내려가면 몸이 가벼워지는 느낌",
        "버스가 급정거할 때 앞으로 쏠리는 현상",
        "깃털과 쇠구슬을 진공에서 떨어뜨리는 실험"
      ],
      easyExplanation: "물체는 혼자 내버려두면 계속 현재 상태를 유지하려 해. 이게 관성이야. 버스가 갑자기 서면 사람은 계속 앞으로 가려다 쏠리는 거야.",
      beginnerFlow: [
        { type: "realLife", text: "버스가 갑자기 브레이크 밟으면 몸이 앞으로 쏠리잖아. 왜 그런 거 같아?" },
        { type: "easyExplain", text: "사람 몸은 원래 계속 앞으로 가려는 성질이 있어. 이걸 '관성'이라고 해. 버스는 멈췄는데 몸은 아직 앞으로 가려 하니까 쏠리는 거야." },
        { type: "check", text: "그럼 버스가 갑자기 출발하면 몸은 어느 쪽으로 쏠릴까?" },
        { type: "easyApply", text: "달리던 차가 멈출 때 안전벨트가 필요한 이유는 뭘까?" },
        { type: "concept", questions: {
            concept: "관성이란 무엇인지 설명해봐.",
            apply: "질량이 다른 깃털과 쇠구슬을 진공에서 떨어뜨리면?",
            misconception: "무거운 물체가 더 빨리 떨어진다고 생각해?",
            thinking: "엘리베이터가 아래로 내려갈 때 왜 몸이 가볍게 느껴질까?"
          }
        }
      ],
      checkQuestions: [
        "관성이 뭔지 예를 들어 설명해봐.",
        "자유 낙하할 때 질량에 따라 속도가 다를까?"
      ],
      questions: {
        beginner: {
          concept: "버스가 갑자기 멈추면 왜 앞으로 쏠려? 그게 뭔지 설명해줄 수 있어?",
          apply: "깃털이랑 돌멩이를 같이 떨어뜨리면 어떻게 될 것 같아?",
          misconception: "무거운 물체가 더 빨리 떨어진다고 생각해?",
          thinking: "우주 비행사가 무중력에서 물건을 밀면 어떻게 될까?"
        },
        intermediate: {
          concept: "물체가 떨어질 때 속력이 빨라지는 이유는?",
          apply: "질량이 다른 깃털과 쇠구슬을 진공에서 떨어뜨리면?",
          misconception: "무거운 물체일수록 더 빨리 떨어진다고 생각해?",
          thinking: "엘리베이터가 내려갈 때 몸이 가벼워지는 이유를 관성과 중력으로 설명해봐."
        },
        advanced: {
          concept: "뉴턴 제2법칙 F=ma를 운동량 변화율로 유도해봐.",
          apply: "경사면에서 물체의 합력과 가속도를 계산해봐.",
          misconception: "등속 운동 중인 물체의 합력은 0인데 어떻게 계속 움직이는 걸까?",
          thinking: "상대성 원리 관점에서 관성 기준계를 설명해봐."
        }
      }
    }
  ],
  "고2": [
    {
      months: [3, 4],
      unit: "물리학 I: 역학적 상호작용",
      concepts: ["뉴턴 운동 법칙", "운동량", "충격량"],
      realLifeExamples: [
        "에어백이 사고 시 부상을 줄이는 원리",
        "야구 방망이로 공을 칠 때 힘의 방향",
        "로켓이 분사하며 앞으로 나아가는 원리"
      ],
      easyExplanation: "충돌할 때 힘×시간 = 충격량. 에어백은 충돌 시간을 늘려서 같은 충격량이더라도 순간 힘을 줄여줘. 그래서 부상이 줄어드는 거야.",
      beginnerFlow: [
        { type: "realLife", text: "자동차 에어백이 왜 있는지 알아? 충돌할 때 뭔가 달라지는 게 있어." },
        { type: "easyExplain", text: "에어백이 없으면 충돌 순간 아주 짧은 시간에 강한 힘이 가해져. 에어백은 그 시간을 늘려서 힘을 분산시켜. 이게 충격량 원리야." },
        { type: "check", text: "모래사장에 뛰어내리는 게 딱딱한 바닥보다 덜 아픈 이유가 뭘까?" },
        { type: "easyApply", text: "야구 공을 받을 때 손을 뒤로 빼는 이유가 이 원리랑 관련 있을까?" },
        { type: "concept", questions: {
            concept: "작용-반작용 법칙을 설명해봐.",
            apply: "벽을 세게 밀면 내 몸이 뒤로 밀리는 이유는?",
            misconception: "내가 수레를 당기는 힘이 더 커야 수레가 끌려오는 걸까?",
            thinking: "충격량과 시간의 관계로 에어백 원리를 설명해봐."
          }
        }
      ],
      checkQuestions: [
        "충격량 공식을 말해봐.",
        "작용-반작용의 예시를 하나 들어봐."
      ],
      questions: {
        beginner: {
          concept: "에어백이 왜 충돌할 때 도움이 될까? 어떤 원리인 것 같아?",
          apply: "모래사장에 뛰어내리는 게 콘크리트보다 덜 아픈 이유가 뭘까?",
          misconception: "수레를 당길 때 내 힘이 수레 힘보다 커야 당겨지는 걸까?",
          thinking: "로켓이 분사하면서 날아가는 게 작용-반작용이랑 어떻게 연결돼?"
        },
        intermediate: {
          concept: "뉴턴 제3법칙인 작용-반작용 법칙을 설명해봐.",
          apply: "벽을 세게 밀면 내 몸이 뒤로 밀리는 이유는?",
          misconception: "수레를 당기는 힘이 반작용보다 커야 수레가 끌려오는 걸까?",
          thinking: "에어백 원리를 충격량으로 설명해봐."
        },
        advanced: {
          concept: "운동량 보존 법칙을 수식으로 유도해봐.",
          apply: "두 물체가 완전 탄성 충돌할 때 운동에너지 보존을 증명해봐.",
          misconception: "충돌에서 운동량과 운동에너지 보존 조건이 다른 이유를?",
          thinking: "로켓 추진의 운동량 보존 원리 + 질량 변화 상황을 설명해봐."
        }
      }
    }
  ]
};

// 등급 → 질문 레벨 매핑
export const getLevelKey = (selfReportedLevel) => {
  if (selfReportedLevel === '4~5등급' || selfReportedLevel === '모름') return 'beginner';
  if (selfReportedLevel === '3등급') return 'intermediate';
  return 'advanced';
};

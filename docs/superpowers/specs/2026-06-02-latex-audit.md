# LaTeX Audit 리포트

생성일: 2026-06-02

## 패턴 코드 설명

| 코드 | 의미 | 등급 |
|------|------|------|
| P1 | 줄 단위 $ 개수 홀수(짝 불균형) | AUTO — 자동 수정 후보 |
| P3 | $ 밖 plaintext 수식 토큰(frac/sqrt/pi/^/_) | REVIEW — 수동 판단 필요 |
| P5 | $…$ 내부 KaTeX 파싱 실패 | REVIEW — 의미 추론 필요 |

---

## 섹션 A — 문제 본문 (math_problem_texts) | 이슈 항목 수: 795

**패턴별 건수:** P5(REVIEW): 1157, P3(REVIEW): 721, P1: 13

### `삼각함수활용2단계/009.webp`
- **P5(REVIEW)**: `3\n② ` — KaTeX parse error: Undefined control sequence: \n at position 2: 3\̲n̲② 
- **P5(REVIEW)**: `\n③ 4\n④ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲③ 4\n④ 
- **P5(REVIEW)**: `\n⑤ 5` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲⑤ 5

### `삼각함수활용2단계/021.webp`
- **P5(REVIEW)**: `3\n② ` — KaTeX parse error: Undefined control sequence: \n at position 2: 3\̲n̲② 
- **P5(REVIEW)**: `\n③ 4\n④ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲③ 4\n④ 
- **P5(REVIEW)**: `\n⑤ 5` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲⑤ 5

### `삼각함수활용2단계/028.webp`
- **P5(REVIEW)**: `의 크기는?\n① ` — KaTeX parse error: Undefined control sequence: \n at position 7: 의 크기는?\̲n̲① 
- **P5(REVIEW)**: `\n② ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲② 
- **P5(REVIEW)**: `\n③ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲③ 
- **P5(REVIEW)**: `\n④ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲④ 
- **P5(REVIEW)**: `\n⑤ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲⑤ 

### `삼각함수활용2단계/033.webp`
- **P3(REVIEW)**: `삼각형  에서  ,  a^2 = \frac{1}{2}c^2 - \frac{\sqrt{6}}{3}ab 일 때,  의 크기는? ①   ②   ③   ④   ⑤`

### `삼각함수활용2단계/042.webp`
- **P3(REVIEW)**: `다음 그림과 같이 밑면의 반지름의 길이가  , 높이가  인 원뿔 모양의 용기에 들어 있는 물의 높이가  이다. 이 용기에 든 물을 반지름의 길이가  , 높이가  인 원기둥 모양의 용기에 부었더니 수면과 밑면이 만나서`

### `삼각함수활용2단계/043.webp`
- **P3(REVIEW)**: `세 변의 길이가 5, 7, 8인 삼각형의 내접원의 반지름의 길이는?\n①  \sqrt{2} \sqrt{3} \sqrt{5}`
- **P5(REVIEW)**: `1\n② ` — KaTeX parse error: Undefined control sequence: \n at position 2: 1\̲n̲② 
- **P5(REVIEW)**: `\n③ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲③ 
- **P5(REVIEW)**: `\n④ 2\n⑤ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲④ 2\n⑤ 

### `삼각함수활용2단계/050.webp`
- **P3(REVIEW)**: `△ABC에서 \overline{AB}=a-2, \overline{BC}=a, \overline{CA}=a-1이고, \cos A =   일 때, △ABC의 넓이는?\n①  \sqrt{3} \sqrt{5} \sqrt{6`
- **P5(REVIEW)**: `\n② 8\n③ 5` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲② 8\n③ 5
- **P5(REVIEW)**: `\n④ 6` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲④ 6
- **P5(REVIEW)**: `\n⑤ 7` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲⑤ 7

### `삼각함수활용2단계/059.webp`
- **P3(REVIEW)**: `\overline{AB} = 4, \overline{BC} = 5\text{인 평행사변형 } ABCD\text{의 넓이가 } 10 \text{일 때, } AC\text{의 길이는? (단, } 0^\circ < B <`
- **P5(REVIEW)**: `\n② ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲② 
- **P5(REVIEW)**: `\n③ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲③ 
- **P5(REVIEW)**: `\n④ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲④ 
- **P5(REVIEW)**: `\n⑤ 2` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲⑤ 2

### `삼각함수활용2단계/003.webp`
- **P3(REVIEW)**: `다음 그림과 같은  에서  는? ①  \sqrt{2} \sqrt{3} \sqrt{3} \sqrt{2}`

### `삼각함수활용2단계/004a.webp`
- **P3(REVIEW)**: `해설 사인법칙에 의하여   이므로\n\n \sin B = 8 \cdot \frac{1}{2} \cdot \frac{1}{6} = \frac{2}{3} \n\n \therefore \cos^2 B = 1 - \sin^`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `삼각함수활용2단계/005a.webp`
- **P3(REVIEW)**: `해설   이므로  에서 사인법칙에 의하여  \frac{BP}{\sin(\angle BCP)} = \frac{CP}{\sin 45^\circ} = \sqrt{2} \cdot CP \quad \cdots \bigcirc`

### `삼각함수활용2단계/001a.webp`
- **P3(REVIEW)**: `꼭짓점 A에서 \( BC \)에 내린 수선의 발을 H라 하면\n\n\( \triangle ABH \)에서 \( \overline{BH} = 5\sqrt{2} \cdot \cos 30^\circ = \frac{5\sq`

### `삼각함수활용2단계/003a.webp`
- **P3(REVIEW)**: `∠ADB = \theta 라 하면 ∠ADC = 180^\circ - \theta 이므로 △ABC는 다음 그림과 같다. 이때 △ABD에서 사인법칙에 의하여  \frac{BD}{\sin 60^\circ} = \frac{`

### `삼각함수활용2단계/006a.webp`
- **P3(REVIEW)**: `삼각형  는  인 직각삼각형이므로  는 외접원의 지름이다. 따라서 외접원의 반지름의 길이를  이라고 하면  R = \sqrt{3}  삼각형  에서 사인법칙에 의해  \frac{AC}{\sin(\angle ABC)} `

### `삼각함수활용2단계/014a.webp`
- **P5(REVIEW)**: `\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲∴ 
- **P5(REVIEW)**: `)\n따라서 △ABC는 ` — KaTeX parse error: Undefined control sequence: \n at position 2: )\̲n̲따라서 △ABC는 

### `삼각함수활용2단계/015a.webp`
- **P3(REVIEW)**: `△ABC의 외접원의 반지름의 길이를  라 하면 사인법칙에 의하여  \sin A = \frac{a}{2R}, \sin B = \frac{b}{2R}, \sin C = \frac{c}{2R}  이것을 주어진 식에 대입하`

### `삼각함수활용2단계/013a.webp`
- **P5(REVIEW)**: ` \( \therefore \sin A : \sin B : \sin C = a : \frac{3}{5}a : \frac{4}{5}a \) ` — KaTeX parse error: Can't use function '\(' in math mode at position 2:  \̲(̲ \therefore \si…
- **P5(REVIEW)**: ` \( \sin A = 5k, \ \sin B = 3k, \ \sin C = 4k \ (k > 0) \)라 하면 ` — KaTeX parse error: Can't use function '\(' in math mode at position 2:  \̲(̲ \sin A = 5k, \…

### `삼각함수활용2단계/017a.webp`
- **P5(REVIEW)**: ` 이고,\n\n삼각형 ABC에서 사인법칙에 따라\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이고,\̲n̲\n삼각형 ABC에서 사인법…
- **P5(REVIEW)**: ` 이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `삼각함수활용2단계/016a.webp`
- **P3(REVIEW)**: `주어진 이차방정식이 중근을 가지므로 판별식을  라 하면  \frac{D}{4} = \sin^2 C - (\cos A - \cos B)(\cos A + \cos B) = 0  즉,   이때  ,  이므로  \sin^2`

### `삼각함수활용2단계/020a.webp`
- **P3(REVIEW)**: `정답   해설  에서    에서     이므로  에서 코사인법칙에 의하여    = \left(\frac{8\sqrt{3}}{3}\right)^2 + (4\sqrt{3})^2 - 2 \cdot \frac{8\sqrt{`

### `삼각함수활용2단계/021a.webp`
- **P3(REVIEW)**: `선분  를 그으면 삼각형  에서 코사인법칙에 의해  BD^2 = 1^2 + 3^2 - 2 \cdot 1 \cdot 3 \cdot \cos 120^\circ   = 1 + 9 - 2 \cdot 1 \cdot 3 \cd`

### `삼각함수활용2단계/022a.webp`
- **P3(REVIEW)**: `사각형  가 원에 내접하므로\n A + C = 180^\circ \text{ 에서 } A = 180^\circ - C \n\(\therefore \cos A = \cos(180^\circ - C)\)\n\(= -\c`
- **P5(REVIEW)**: `\n\(\therefore \cos A = \cos(180^\circ - C)\)\n\(= -\cos C = \frac{1}{8}\)\n\n따라` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\(\therefore \c…
- **P5(REVIEW)**: `에서 코사인법칙에 의하여\n` — KaTeX parse error: Undefined control sequence: \n at position 14: 에서 코사인법칙에 의하여\̲n̲

### `삼각함수활용2단계/025a.webp`
- **P3(REVIEW)**: `정답   해설      을 하면      을  에 대입하면     코사인법칙에 의하여  \cos A = \frac{\left( \frac{5}{2}a \right)^2 + (2a)^2 - a^2}{2 \cdot \f`

### `삼각함수활용2단계/026a.webp`
- **P3(REVIEW)**: `해설 삼각형  에서  ,   이므로   라 하면 코사인법칙의 변형에 의하여  \cos \theta = \frac{8^2 + 8^2 - (2\sqrt{5})^2}{2 \cdot 8 \cdot 8} = \frac{27}`

### `삼각함수활용2단계/028a.webp`
- **P3(REVIEW)**: `해설   에서 \n  \n∴   \n코사인법칙에 의하여 \n \cos A = \frac{b^2 + c^2 - a^2}{2bc} = \frac{b^2 + c^2 - (b^2 + c^2 - bc)}{2bc} = \fra`
- **P5(REVIEW)**: ` \n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲∴ 

### `삼각함수활용2단계/024a.webp`
- **P3(REVIEW)**: `정답   해설   이므로   이 가장 긴 변의 길이이다. 이때 가장 긴 변의 대각이 최대각이므로 최대각의 크기를   라 하면 코사인법칙에 의하여  \cos\theta = \frac{\frac{1}{4}a^2 + \f`

### `삼각함수활용2단계/027a.webp`
- **P3(REVIEW)**: `삼각형  에서 코사인법칙에 의해  AC^2 = 3^2 + 2^2 - 2 \cdot 3 \cdot 2 \cdot \cos 120^\circ   = 9 + 4 - 2 \cdot 3 \cdot 2 \cdot \left(-`

### `삼각함수활용2단계/023a.webp`
- **P3(REVIEW)**: `정답   해설   이므로   삼각형  에서  ,   이므로 코사인법칙에 의하여  \overline{BF}^2 = \overline{AB}^2 + \overline{AF}^2 - 2 \cdot \overline{AB}`

### `삼각함수활용2단계/030a.webp`
- **P3(REVIEW)**: `정답   해설 코사인법칙에 의하여  b^2 = (2\sqrt{2})^2 + (2 + 2\sqrt{3})^2 - 2 \cdot 2\sqrt{2} \cdot (2 + 2\sqrt{3}) \cdot \cos 45^\cir`

### `삼각함수활용2단계/035a.webp`
- **P3(REVIEW)**: `해설  에서 코사인법칙에 의하여  c \cdot \frac{c^2 + a^2 - b^2}{2ca} = b \cdot \frac{a^2 + b^2 - c^2}{2ab}  이므로  c^2 + a^2 - b^2 = a^2`

### `삼각함수활용2단계/032a.webp`
- **P3(REVIEW)**: `코사인법칙에서\n c^2 = 4^2 + 5^2 - 2 \times 4 \times 5 \times \cos \frac{\pi}{3} \n = 16 + 25 - 40 \times \frac{1}{2} \n = 21 \`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n이므로 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲이므로 
- **P5(REVIEW)**: `\n또 사인법칙에서\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲또 사인법칙에서\n
- **P5(REVIEW)**: `\n즉 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲즉 
- **P5(REVIEW)**: ` 이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 

### `삼각함수활용2단계/036a.webp`
- **P3(REVIEW)**: `△ABC의 외접원의 반지름의 길이를  라 하면\n\n \sin C = \frac{c}{2R}, \sin A = \frac{a}{2R}, \cos B = \frac{c^2 + a^2 - b^2}{2ca} \n\n이를 `
- **P5(REVIEW)**: `\n\n이를 주어진 식에 대입하면\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n이를 주어진 식에 대입하…
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n∴ 
- **P5(REVIEW)**: `\n\n따라서 △ABC는 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 △ABC는 

### `삼각함수활용2단계/038a.webp`
- **P3(REVIEW)**: `삼각형  에서 코사인법칙에 의하여  AB^2 = 100^2 + 300^2 - 2 \cdot 100 \cdot 300 \cdot \cos 120^\circ   = 10000 + 90000 + 30000   = 1300`

### `삼각함수활용2단계/033a.webp`
- **P3(REVIEW)**: `해설   이므로  \sqrt{3}c = \sqrt{2}b \therefore b = \frac{\sqrt{6}}{2}c  한편,  이고  이므로 코사인법칙에 의하여  \cos B = \frac{a^2 + c^2 - `

### `삼각함수활용2단계/029a.webp`
- **P3(REVIEW)**: `BD = a라 하면 △ODB가 직각삼각형이고 \( \angle BOD = \frac{\pi}{4} \) 이므로 \( \overline{OB} = \sqrt{2}a, \overline{OD} = a \)이다. 이때 \`
- **P5(REVIEW)**: ` \( \therefore \overline{AD} = \sqrt{5}a \) (\( \because \overline{AD} > 0 \)) 또` — KaTeX parse error: Can't use function '\(' in math mode at position 2:  \̲(̲ \therefore \ov…
- **P5(REVIEW)**: ` \( \therefore \sin \theta = \sqrt{1 - \cos^2 \theta} = \sqrt{1 - \left( \frac{3` — KaTeX parse error: Can't use function '\(' in math mode at position 2:  \̲(̲ \therefore \si…

### `삼각함수활용2단계/041a.webp`
- **P3(REVIEW)**: `삼각형  의 넓이는  \frac{1}{2} \cdot 6 \cdot 8 \cdot \sin(\angle ABC) = 20   \therefore \sin(\angle ABC) = \frac{5}{6}  이때   이므`

### `삼각함수활용2단계/043a.webp`
- **P3(REVIEW)**: `해론의 공식에 의해  이므로 삼각형의 넓이는  \sqrt{10(10-5)(10-7)(10-8)} = \sqrt{10 \cdot 5 \cdot 3 \cdot 2}   = 10\sqrt{3}  삼각형의 내접원의 반지름의`

### `삼각함수활용2단계/040a.webp`
- **P3(REVIEW)**: `△ACD에서    △BCE에서    △ABC에서 코사인법칙에 의하여  \overline{AB}^2 = 12^2 + 16^2 - 2 \cdot 12 \cdot 16 \cdot \cos 60^\circ = 208   ∴`

### `삼각함수활용2단계/039a.webp`
- **P3(REVIEW)**: `△ABC에서 코사인법칙에 의하여  BC^2 = 5^2 + (3\sqrt{3})^2 - 2 \cdot 5 \cdot 3\sqrt{3} \cdot \cos 30^\circ   = 25 + 27 - 2 \cdot 5 \c`

### `삼각함수활용2단계/044a.webp`
- **P5(REVIEW)**: `\n즉, ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲즉, 
- **P5(REVIEW)**: `이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲
- **P5(REVIEW)**: `\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲∴ 

### `삼각함수활용2단계/045a.webp`
- **P3(REVIEW)**: `해설 \( \overline{AB}=x, \overline{BC}=y \)라 하면 코사인법칙에 의하여 \( 11^2 = x^2 + y^2 - 2xy \cos 120^\circ \) \( \therefore 121 =`

### `삼각함수활용2단계/042a.webp`
- **P3(REVIEW)**: `원뿔 모양의 용기에 담긴 물의 부피는   원기둥 모양의 용기에서 물이 담긴 밑면의 넓이는  \frac{1}{2} \cdot 3^2 \cdot \frac{7}{4}\pi + \frac{1}{2} \cdot 3^2 \c`

### `삼각함수활용2단계/046a.webp`
- **P3(REVIEW)**: `해설  ,  라 하면  이므로  2 \cdot \frac{1}{2} xy \sin 60^\circ = \frac{1}{2} \cdot 4 \cdot 3 \cdot \sin 60^\circ   \therefore xy`

### `삼각함수활용2단계/037a.webp`
- **P3(REVIEW)**: `해설   에서  \frac{\sin A}{\cos A} \cdot \sin C = \frac{\sin C}{\cos C} \cdot \sin A   \therefore \cos C \sin A \sin C = \co`

### `삼각함수활용2단계/048a.webp`
- **P3(REVIEW)**: `사인법칙에 의하여     한편, 꼭짓점 C에서 변 AB에 내린 수선의 발을 H라 하면  ,   이므로   따라서 삼각형 ABC의 넓이는  \frac{1}{2} ca \sin B = \frac{1}{2} \cdot (`

### `삼각함수활용2단계/050a.webp`
- **P3(REVIEW)**: `그림의  에서 코사인법칙에 의하여  \cos A = \frac{(a-1)^2 + (a-2)^2 - a^2}{2(a-1)(a-2)}   = \frac{a^2 - 6a + 5}{2(a-1)(a-2)}   = \frac{`

### `삼각함수활용2단계/053a.webp`
- **P3(REVIEW)**: `△ACD의 넓이는   △ABC의 넓이는 헤론의 공식을 이용하면  s = \frac{9 + 10 + 17}{2} = 18  이므로  \sqrt{18(18-9)(18-10)(18-17)} = 36  따라서 사각형 ABC`

### `삼각함수활용2단계/049a.webp`
- **P3(REVIEW)**: `외접원  의 반지름의 길이를  라 하면   \[ R = \frac{6}{\pi} \] 중심각의 크기는 호의 길이에 비례하므로 \[ \angle AOB = 360^\circ \cdot \frac{3}{12} = 90^`

### `삼각함수활용2단계/051a.webp`
- **P3(REVIEW)**: `세 변의 길이를 각각  이라 하면  \cos A = \frac{b^2 + c^2 - a^2}{2bc}   = \frac{6^2 + 8^2 - 4^2}{2 \times 6 \times 8} = \frac{7}{8}  `

### `삼각함수활용2단계/052a.webp`
- **P3(REVIEW)**: `양의 실수  에 대하여 삼각형의 세 변의 길이를 각각  ,  ,  라 하면 코사인법칙의 변형에 의하여  \cos A = \frac{b^2 + c^2 - a^2}{2bc} = \frac{(3k)^2 + (3k)^2 -`

### `삼각함수활용2단계/047a.webp`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `삼각함수활용2단계/055a.webp`
- **P3(REVIEW)**: `야영장을 다음 그림과 같이 사각형  라 하고  를 그으면 직각삼각형  에서  \overline{AC} = \sqrt{30^2 + 40^2} = 50 (m)   에서  라 하면 코사인법칙에 의하여  \cos \thet`

### `삼각함수활용2단계/059a.webp`
- **P3(REVIEW)**: `평행사변형  의 넓이가   이므로\n 4 \cdot 5 \cdot \sin B = 10 \sqrt{3} \n \therefore \sin B = \frac{\sqrt{3}}{2} \n  이므로  \n따라서  에서 코`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 
- **P5(REVIEW)**: `에서 코사인법칙에 의하여\n` — KaTeX parse error: Undefined control sequence: \n at position 14: 에서 코사인법칙에 의하여\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲

### `삼각함수활용2단계/054a.webp`
- **P3(REVIEW)**: `△ABC에서 ∠ACB = 90^\circ, ∠ABC = 60^\circ 인 직각삼각형이므로    △ABD에서 ∠ADB = 90^\circ 인 직각이등변삼각형이므로    ∴ □ACBD = △ACB + △ADB  = \`

### `삼각함수활용2단계/056a.webp`
- **P3(REVIEW)**: `△ABC에서 코사인법칙에 의하여  AC^2 = 4^2 + (2 + 2\sqrt{3})^2 - 2 \cdot 4(2 + 2\sqrt{3}) \cos 30^\circ   = 16 + 16 + 8\sqrt{3} - 2 \`

### `삼각함수활용2단계/061a.webp`
- **P3(REVIEW)**: `사각형  의 넓이가  이고, 두 대각선  ,  의 길이가 각각  ,  , 두 대각선이 이루는 예각의 크기가  이므로  \frac{1}{2} \times 5 \times 7 \times \sin \theta = \fr`

### `삼각함수활용2단계/063.webp`
- **P5(REVIEW)**: `\( \frac{25}{3} \sqrt{35} \) ② \( \frac{25}{6} \sqrt{35} \) ③ \( \frac{25}{4} \s` — KaTeX parse error: Can't use function '\(' in math mode at position 1: \̲(̲ \frac{25}{3} \…

### `삼각함수활용2단계/062a.webp`
- **P3(REVIEW)**: `∠CPD = θ라 하면 △CDP에서 코사인법칙에 의하여  \n\cos\theta = \frac{1^2 + 5^2 - 5^2}{2 \cdot 1 \cdot 5} = \frac{1}{10} \n \sin^2\theta `
- **P5(REVIEW)**: `\n\cos\theta = \frac{1^2 + 5^2 - 5^2}{2 \cdot 1 \cdot 5} = \frac{1}{10}` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\cos\theta = \f…
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: ` 에서\n` — KaTeX parse error: Undefined control sequence: \n at position 4:  에서\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲

### `삼각함수활용2단계/057a.webp`
- **P3(REVIEW)**: `피타고라스의 정리와 원의 성질을 이해하고, 삼각비를 이용하여 삼각형의 넓이를 구할 수 있는가를 묻는 문제이다.  AB = \sqrt{4^2 + 2^2} = \sqrt{20} = 2\sqrt{5}   QA^2 + QB`

### `삼각함수활용2단계/063a.webp`
- **P3(REVIEW)**: `∠APB = \theta 라 하면 △ABP에서 코사인법칙에 의하여  \cos \theta = \frac{2^2 + 6^2 - 6^2}{2 \cdot 2 \cdot 6} = \frac{1}{6}   \sin^2 \th`

### `삼각함수활용2단계/060a.webp`
- **P3(REVIEW)**: `평행사변형  의 넓이는  5 \cdot 8 \cdot \sin 60^\circ = 40 \cdot \frac{\sqrt{3}}{2}   = 20 \sqrt{3}   에서 코사인법칙에 의하여  AC^2 = AB^2 +`

### `삼각함수활용2단계/064a.webp`
- **P3(REVIEW)**: `삼각형  에 코사인법칙을 적용하면  AC^2 = 1^2 + 2^2 - 2 \times 1 \times 2 \times \cos \frac{\pi}{3}   = 1 + 4 - 2 = 3  이므로   삼각형  에서  C`

### `지수2단계/005.webp`
- **P5(REVIEW)**: `f_2\left(f_3\left(\sqrt[5]{(-2)^7}\right)\right)\n+f_4\left(\left(-\frac{1}{2}\r` — KaTeX parse error: Undefined control sequence: \n at position 49: …}\right)\right)\̲n̲+f_4\left(\left…

### `지수2단계/002a.webp`
- **P3(REVIEW)**: `해설   \n = \sqrt[4]{16} + \sqrt[4]{2} \cdot 8 + \sqrt[6]{64}  \n = \sqrt[4]{2^4} + \sqrt[4]{2^4} + \sqrt[6]{2^6}  \n = 2 `
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲

### `지수2단계/001a.webp`
- **P3(REVIEW)**: `①    \n (거짓)\n\n②  의 세제곱근을  라 하면  이므로\n ,  \n∴   또는  \n\n따라서  의 세제곱근중 실수인 것은\n 이다.(거짓)\n\n③  \sqrt[3]{27} \sqrt[3]{27} =`

### `지수2단계/008.webp`
- **P5(REVIEW)**: `\sqrt{(-2)^4} + \left(\sqrt[3]{5} - \sqrt[3]{2}\right)\n\left(\sqrt[3]{25} + \sq` — KaTeX parse error: Undefined control sequence: \n at position 55: …rt[3]{2}\right)\̲n̲\left(\sqrt[3]{…

### `지수2단계/008a.webp`
- **P3(REVIEW)**: `해설  ,  \left(\sqrt[3]{5} - \sqrt[3]{2}\right)\left(\sqrt[3]{25} + \sqrt[3]{10} + \sqrt[3]{4}\right) = 5 - 2 = 3  이므로  \s`

### `지수2단계/010.webp`
- **P3(REVIEW)**: `x에 대한 이차방정식  의\n두 근이  과 6일 때,  의 값은?\n(단,  ,  는 상수이다.)\n①  3\sqrt[3]{9} 6\sqrt[3]{3} 6\sqrt[3]{9}`
- **P5(REVIEW)**: `6\n② ` — KaTeX parse error: Undefined control sequence: \n at position 2: 6\̲n̲② 
- **P5(REVIEW)**: `\n③ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲③ 
- **P5(REVIEW)**: `\n④ 12\n⑤ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲④ 12\n⑤ 

### `지수2단계/013a.webp`
- **P3(REVIEW)**: `해설   \n = \sqrt[12]{\frac{a^6b^{12}}{a^4b^7}} \cdot \sqrt[12]{a^6b^4}  \n = \sqrt[12]{a^8b^9}  \n따라서  ,  ,  이므로 \n`
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲따라서 
- **P5(REVIEW)**: `이므로 \n` — KaTeX parse error: Undefined control sequence: \n at position 5: 이므로 \̲n̲

### `지수2단계/013.webp`
- **P3(REVIEW)**: `a > 0, \ b > 0일 때, \n  \div \sqrt[12]{a^4b^7} \cdot \sqrt[6]{a^3b^2} = \sqrt[n]{a^pb^q}이다.\n이때 자연수 \ n, \ p, \ q에 대하여 \n`

### `지수2단계/014a.webp`
- **P5(REVIEW)**: `\n\n해설\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n해설\n
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲

### `지수2단계/014.webp`
- **P3(REVIEW)**: `a > 0일 때, \sqrt[4]{\frac{\sqrt[3]{a}}{ }} \cdot \sqrt[3]{\frac{\sqrt[4]{a}}{\sqrt[3]{a}}} \cdot \sqrt{\frac{a}{\sqrt[4]{`

### `지수2단계/019.webp`
- **P3(REVIEW)**: `\frac{6^5 + 6^{15}}{6^{-5} + 6^{-15}} = 6^k 일 때, 자연수  의 값을 구하시오.`

### `지수2단계/020a.webp`
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲

### `지수2단계/021.webp`
- **P3(REVIEW)**: `일 때, \( \frac{1}{a^{-5} + 1} + \frac{1}{a^{-3} + 1} + \frac{1}{a^3 + 1} + \frac{1}{a^5 + 1} \) 을 간단히 하시오.`

### `지수2단계/015a.webp`
- **P3(REVIEW)**: `해설 ㄱ.   (참) ㄴ.    = \sqrt[3]{a}   = R(a, 3)  (참) ㄷ.    R(a, 8n^2) = \sqrt[8n^2]{a}  이므로  R(R(a, 2n), 4n) = R(a, 8n^2)  (`

### `지수2단계/017a.webp`
- **P3(REVIEW)**: `정답 ③  \sqrt[4]{3 \times 5} = \sqrt[8]{15} \sqrt[4]{3} \times \sqrt[4]{5} = \sqrt[4]{3^4} \times \sqrt[4]{5} = \sqrt[4]{4`
- **P5(REVIEW)**: `\n\n해설\n① ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n해설\n① 
- **P5(REVIEW)**: `\n② ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲② 
- **P5(REVIEW)**: `\n③ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲③ 
- **P5(REVIEW)**: `\n④ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲④ 
- **P5(REVIEW)**: `\n⑤ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲⑤ 
- **P5(REVIEW)**: `\n\n따라서 가장 큰 수는 ③이다.` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 가장 큰 수는 ③…

### `지수2단계/018a.webp`
- **P3(REVIEW)**: `A-B=(\sqrt[6]{2}+\sqrt[8]{3})-2\sqrt[3]{3}=\sqrt[6]{2}-\sqrt[8]{3}\n=\sqrt[24]{2^4}-\sqrt[24]{3^3}=\sqrt[24]{16}-\sqrt[2`

### `지수2단계/021a.webp`
- **P3(REVIEW)**: `해설   \n = \frac{a^5}{1+a^5} + \frac{a^3}{1+a^3} + \frac{1}{a^3+1} + \frac{1}{a^5+1}  \n = \frac{a^5+1}{1+a^5} + \frac{a^`
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲

### `지수2단계/023.webp`
- **P3(REVIEW)**: `{\left(   \right)^{- }}^{ } \cdot \left(   \right)^{- } 의 값은?\n①  \n② 2\n③  \n④  \sqrt{3} \n⑤ 6`

### `지수2단계/022a.webp`
- **P3(REVIEW)**: `다음 식을 간단히 하자.\n\[ \frac{a^2 + a^4 + a^6 + a^8 + a^{10} + a^{12} + a^{14}}{a^{-1} + a^{-3} + a^{-5} + a^{-7} + a^{-9} + a`

### `지수2단계/022.webp`
- **P3(REVIEW)**: `22. \(a \neq 0\)일 때, \n\[ \frac{a^2 + a^4 + a^6 + a^8 + a^{10} + a^{12} + a^{14}}{a^{-1} + a^{-3} + a^{-5} + a^{-7} + a^`

### `지수2단계/027.webp`
- **P3(REVIEW)**: `(27 \cdot \sqrt[3]{3}^3 \cdot (3^3)^{ } \cdot \frac{1}{\sqrt[4]{3^3}} = 3^k일 때, 유리수 k의 값은?\n① 11\n② 12\n③ 13\n④ 14\n⑤ 15`

### `지수2단계/026a.webp`
- **P3(REVIEW)**: `정답 ①  \frac{1}{3} \cdot 5 = 5^{\frac{17}{15}} = 5^{\frac{15}{15}} \sqrt[15]{5^{17}} = 5^{15} \sqrt{5^2} (3^4)^{\frac{1}{`
- **P5(REVIEW)**: `\n\n해설\nㄱ. ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n해설\nㄱ. 
- **P5(REVIEW)**: `\n\nㄴ. ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\nㄴ. 
- **P5(REVIEW)**: `\n\nㄷ. ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\nㄷ. 
- **P5(REVIEW)**: `\n\nㄹ. ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\nㄹ. 
- **P5(REVIEW)**: `\n\n이상에서 옳은 것은 ㄱ, ㄴ 이다.` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n이상에서 옳은 것은 ㄱ,…

### `지수2단계/027a.webp`
- **P3(REVIEW)**: `해설   \n  = \left(3^3 \cdot 3^{\frac{1}{3}}\right)^3 \cdot 3^4 \cdot \left(3^{\frac{3}{4}}\right)^{-1}   \n  = 3^9 \cdot `
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲∴ 

### `지수2단계/025a.webp`
- **P5(REVIEW)**: `\((-100)^0 = 1\)` — KaTeX parse error: Can't use function '\(' in math mode at position 1: \̲(̲(-100)^0 = 1\)

### `지수2단계/031a.webp`
- **P3(REVIEW)**: `정답 ⑤  \sqrt[7]{a} \cdot \sqrt[14]{a^{15}} = \sqrt[14]{a} \cdot \sqrt[14]{a^{15}} = \sqrt[14]{a^{16}} = \sqrt[7]{a^8} n =`
- **P5(REVIEW)**: `\n\n해설 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n해설 
- **P5(REVIEW)**: `\n\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n∴ 

### `지수2단계/030.webp`
- **P3(REVIEW)**: `P = \frac{9^3 \cdot 81^{-3} \cdot \left( \right)^{-3}}{27^{-6} \cdot 9^2}에 대하여\n\n 의 값은?\n\n①  \n②  \n③  \n④  \n⑤`

### `지수2단계/031.webp`
- **P3(REVIEW)**: `a > 0일 때, \sqrt[7]{a} \cdot \sqrt[14]{a^{15}} = \sqrt[7]{a^n} 을 만족시키는 자연수 n의 값은? ① 4 ② 5 ③ 6 ④ 7 ⑤ 8`

### `지수2단계/032.webp`
- **P3(REVIEW)**: `5^{ } \sqrt[5]{5^{ } \sqrt[5]{5}} = 5^k를 만족시키는 유리수\nk의 값은?\n①  \n②  \n③  \n④  \n⑤`

### `지수2단계/030a.webp`
- **P5(REVIEW)**: `\n\n해설\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n해설\n\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `지수2단계/033.webp`
- **P3(REVIEW)**: `a > 0, a \neq 1일 때, \sqrt[\frac{8}{ }]{ } \cdot \sqrt[\frac{k}{ }]{\sqrt[3]{a}} = \sqrt[\frac{4}{ }]{ }를 만족시키는 자연수 k의 값을`

### `지수2단계/035.webp`
- **P3(REVIEW)**: `a > 0, a \neq 1일 때, \n\( \left( \sqrt{a} \right)^{\frac{2}{3}} \div \left( a^{\frac{1}{3}} \right)^2 \times \left( a^{\f`

### `지수2단계/037.webp`
- **P3(REVIEW)**: `a = \sqrt[4]{3}, \ b = \sqrt[3]{7}일 때, \n21^{ }을 a, \ b를 이용하여 나타낸 것은?\n①  \n②  \n③  \n④  \n⑤`

### `지수2단계/038a.webp`
- **P3(REVIEW)**: `해설  \(a = \sqrt[4]{2}, b = \sqrt[7]{3}\)에서 \(a^4 = 2, b^7 = 3\)이므로\n\n\[\n\sqrt[28]{6^5} = \sqrt[28]{(2 \cdot 3)^5} = \s`

### `지수2단계/034.webp`
- **P3(REVIEW)**: `a > 0, \ a \neq 1일 때, \n\sqrt[3]{\sqrt[5]{a}} \cdot \frac{   }{\sqrt[5]{a^3}} = 1을 \n만족시키는 실수 k의 값은?\n①  \n②  \n③  \n④  `

### `지수2단계/038.webp`
- **P3(REVIEW)**: `a = \sqrt[4]{2}, \ b = \sqrt[7]{3}일 때, \n\sqrt[28]{6^5}을 a, b로 나타낸 것은?\n①  \n②  \n③  \n④  \n⑤`

### `지수2단계/041a.webp`
- **P3(REVIEW)**: `다음은 지수법칙을 이용한 문제이다.\n\n 이 자연수  의  제곱근이라 하자.\n\n이때  이 자연수가 되도록 하는  의 값을 구하시오.\n\n①  \sqrt{2}`
- **P5(REVIEW)**: `10\n② ` — KaTeX parse error: Undefined control sequence: \n at position 3: 10\̲n̲② 
- **P5(REVIEW)**: `\n③ 20\n④ 15\n⑤ 25` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲③ 20\n④ 15\n⑤ 2…

### `지수2단계/045.webp`
- **P5(REVIEW)**: `\n\n일 때, ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n일 때, 
- **P5(REVIEW)**: `이다.\n\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이다.\̲n̲\n
- **P5(REVIEW)**: `의 값을 구하시오.\n\n(단, ` — KaTeX parse error: Undefined control sequence: \n at position 11: 의 값을 구하시오.\̲n̲\n(단, 

### `지수2단계/043.webp`
- **P3(REVIEW)**: `43. \(a = \sqrt{3}, \ b = \sqrt{5}\)일 때\n\(\left(a^{\frac{1}{8}} - b^{\frac{1}{8}}\right)\n\left(a^{\frac{1}{8}} + b^{\f`
- **P5(REVIEW)**: `\(-2\)\n② ` — KaTeX parse error: Can't use function '\(' in math mode at position 1: \̲(̲-2\)\n② 
- **P5(REVIEW)**: `\n③ 0\n④ 2\n⑤ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲③ 0\n④ 2\n⑤ 

### `지수2단계/044a.webp`
- **P3(REVIEW)**: `x = 2^{ } + 2^{- }의 양변을 세제곱하면\nx^3 = 2 +   + 3\left(2^{ } + 2^{- }\right)\n이다.\nx^3 =   + 3x\n2x^3 = 5 + 6x\n∴ 2x^3 - 6x`

### `지수2단계/053.webp`
- **P3(REVIEW)**: `양수  에 대하여  \frac{a^x + a^{-x}}{a^x - a^{-x}} = 2 일 때,  의 값은? ① 7 ② 9 ③ 11 ④ 13 ⑤ 15`

### `지수2단계/054.webp`
- **P3(REVIEW)**: `일 때, \( \frac{27^x - 27^{-x}}{3^x + 3^{-x}} \) 의 값을 구하시오.`

### `지수2단계/050a.webp`
- **P3(REVIEW)**: `해설  로 놓으면  x+y = a^{\frac{1}{2}} + a^{-\frac{1}{2}} = 7   xy = a^{\frac{1}{2}} \cdot a^{-\frac{1}{2}} = 1 이므로  a^{\frac{`

### `지수2단계/052.webp`
- **P3(REVIEW)**: `일 때, \n\[ \frac{x-2+\sqrt{x^2-4x}}{x-2-\sqrt{x^2-4x}} \] \n의 값은?\n①  \n②  \n③ 1\n④  \n⑤`

### `지수2단계/053a.webp`
- **P3(REVIEW)**: `의 분모, 분자에 각각   을 곱하면  \frac{a^x(a^x + a^{-x})}{a^x(a^x - a^{-x})} = 2, \frac{a^{2x} + 1}{a^{2x} - 1} = 2`

### `지수2단계/051a.webp`
- **P3(REVIEW)**: `정답 ④  3^x + 3^{-x} = 3     \frac{47+1}{7+1}`
- **P5(REVIEW)**: `\n\n해설\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n해설\n\n
- **P5(REVIEW)**: `이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲\n
- **P5(REVIEW)**: `이고\n\n` — KaTeX parse error: Undefined control sequence: \n at position 3: 이고\̲n̲\n
- **P5(REVIEW)**: `이다.\n\n∴ (주어진 식) = ` — KaTeX parse error: Undefined control sequence: \n at position 4: 이다.\̲n̲\n∴ (주어진 식) = 

### `지수2단계/056.webp`
- **P3(REVIEW)**: `일 때, \( \frac{a^x + a^{-x}}{a^x - a^{-x}} \) 의 값을 구하시오. (단,  )`

### `지수2단계/058a.webp`
- **P3(REVIEW)**: `해설  에서   ……①  b^y = 2 b = 2^{\frac{1}{y}}   ab = 2^5 = 32`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: ` ……②  \n①×②을 하면  \n` — KaTeX parse error: Undefined control sequence: \n at position 7:  ……②  \̲n̲①×②을 하면  \n
- **P5(REVIEW)**: `  \n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲∴ 

### `지수2단계/052a.webp`
- **P3(REVIEW)**: `해설  의 양변을 제곱하면  x = \frac{\frac{1}{2}}{\frac{1}{2}} + \frac{1}{2} = \frac{1}{2} + \frac{1}{2} - 1 + 2   \therefore x - 2`

### `지수2단계/056a.webp`
- **P3(REVIEW)**: `해설  이므로  \frac{a^x + a^{-x}}{a^x - a^{-x}}  의 분모, 분자에 각각  를 곱하면  \frac{a^x + a^{-x}}{a^x - a^{-x}} = \frac{a^x(a^x + a^{`

### `지수2단계/054a.webp`
- **P3(REVIEW)**: `정답   해설  , 즉   이므로 주어진 식의 분모, 분자에  을 곱하면  \frac{27^x - 27^{-x}}{3^x + 3^{-x}} = \frac{3^{3x} - 3^{-3x}}{3^x + 3^{-x}} = `

### `지수2단계/059a.webp`
- **P3(REVIEW)**: `해설  에서  ,  에서  이므로  \sqrt[5]{ab} = (ab)^{\frac{1}{5}} = (2^4 \cdot 5^3)^{\frac{1}{5}} = 2^{\frac{4}{5}} \cdot 5^{\frac{3`

### `지수2단계/060.webp`
- **P3(REVIEW)**: `세 양수  ,  ,  와 2 이상의 세 자연수  ,  ,  에 대하여  \sqrt[p]\sqrt[a^2] = \sqrt[q]\sqrt[b^3] = \sqrt[r]\sqrt[c^6] = 27 ,  \sqrt[3]\sq`
- **P5(REVIEW)**: `\sqrt[p]\sqrt[a^2] = \sqrt[q]\sqrt[b^3] = \sqrt[r]\sqrt[c^6] = 27` — KaTeX parse error: Expected group as argument to '\sqrt' at position 9: \sqrt[p]\̲s̲q̲r̲t̲[a^2] = \sqrt[q…
- **P5(REVIEW)**: `\sqrt[3]\sqrt[abc] = 729` — KaTeX parse error: Expected group as argument to '\sqrt' at position 9: \sqrt[3]\̲s̲q̲r̲t̲[abc] = 729

### `지수2단계/062a.webp`
- **P3(REVIEW)**: `해설  에서  a = 125^{\frac{1}{x}}, \ b = 125^{\frac{2}{y}}, \ c = 125^{\frac{3}{z}}   abc = 5^5 \sqrt{5} = 5^{\frac{6}{5}} \`

### `지수2단계/064.webp`
- **P3(REVIEW)**: `두 양수  에 대하여  2^a = 3^b, \ (a-2)(b-2) = 4  일 때,  의 값은? ① 12 ② 18 ③ 36 ④ 54 ⑤ 72`

### `지수2단계/061a.webp`
- **P3(REVIEW)**: `이차방정식  의 두 근이  이므로 근과 계수의 관계에 의하여  ,    \frac{1}{\alpha} + \frac{1}{\beta} = \frac{\alpha + \beta}{\alpha \beta} = \frac`

### `지수2단계/066.webp`
- **P3(REVIEW)**: `[2009년 9월 고2 문과 18번] \n\n 인 네 실수  에 대하여 \n\n 2^a = 3^b = 6^c = 12^d, \frac{1}{c} - \frac{1}{b} = \frac{1}{4}  \n\n일 때, 좌`
- **P5(REVIEW)**: ` \n\n일 때, 좌표평면 위의 점 ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n일 때, 좌표평면 위의 …
- **P5(REVIEW)**: `과 \n\n직선 ` — KaTeX parse error: Undefined control sequence: \n at position 3: 과 \̲n̲\n직선 
- **P5(REVIEW)**: ` 사이의 거리는? \n\n① ` — KaTeX parse error: Undefined control sequence: \n at position 11:  사이의 거리는? \̲n̲\n① 

### `지수2단계/067a.webp`
- **P3(REVIEW)**: `해설  에 대하여 40분이 지난 후 혈액 속에 남아있는 약품의 양은  10^{1-0.8} = 10^{0.2} = a^{\frac{1}{4}} = \sqrt[4]{a}`

### `지수2단계/067.webp`
- **P3(REVIEW)**: `어느 제약회사에서 새로운 약품을 개발한 후 약품에 대한 지속효과를 알아보기 위하여 흰 쥐를 대상으로 실험을 하였다. 그 결과 약품을 투여하고 경과한 시간  분과 혈액 속에 남아있는 약품의 양   사이에 다음과 같은 `

### `지수2단계/066a.webp`
- **P3(REVIEW)**: `지수법칙을 이용하여 식의 값을 구할 수 있는가를 묻는 문제이다.  로 놓으면  \frac{1}{k^a} = 2   \frac{1}{k^b} = 3   \frac{1}{k^c} = 6   \frac{1}{k^d} = `

### `지수2단계/068a.webp`
- **P3(REVIEW)**: `6등성인 별의 밝기를  라 하면 양의 실수  에 대하여  가 성립한다.  r^5 = 100  ∴   … ①    r^2 = 10^{\frac{4}{5}}`

### `지수2단계/064a.webp`
- **P3(REVIEW)**: `지수법칙 이해하기\n 이라 놓으면\n 2 = k^{\frac{1}{a}}, \ 3 = k^{\frac{1}{b}} \n (a-2)(b-2) = 4 에서  \frac{a+b}{ab} = \frac{1}{2} \n \f`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 
- **P5(REVIEW)**: `\n\n[다른 풀이]\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n[다른 풀이]\n
- **P5(REVIEW)**: `이라 놓으면\n` — KaTeX parse error: Undefined control sequence: \n at position 7: 이라 놓으면\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 

### `로그2단계/001a.webp`
- **P3(REVIEW)**: `정답 ⑤ 해설  이므로  x = 2^4 = 16`

### `로그2단계/002a.webp`
- **P3(REVIEW)**: `정답 ②\n\n해설  \n\n = \log_3 3^2 = 2`

### `로그2단계/007a.webp`
- **P3(REVIEW)**: `해설  에서    에서    \therefore ab=2^2=4   \therefore (a-b)^2=(a+b)^2-4ab=9^2-4\cdot4=65`

### `로그2단계/004a.webp`
- **P3(REVIEW)**: `밑의 조건에서  ,   \[ \therefore x > 5, \ x \neq 6 \] \[ \cdots \text{ ①} \] 진수의 조건에서   \[ x^2 - 11x + 18 < 0, \ (x-2)(x-9) < `

### `로그2단계/006a.webp`
- **P3(REVIEW)**: `로그 계산하기    = \log_2 \{ (3+\sqrt{5})(3-\sqrt{5}) \}   = \log_2 4   = 2`

### `로그2단계/005a.webp`
- **P3(REVIEW)**: `해설 모든 실수  에 대하여  의 값이 존재하려면  이어야 하므로 (i)  일 때,  이므로 모든 실수  에 대하여  의 값이 존재한다. (ii)  일 때, 이차방정식  의 판별식을  라 하면  \frac{D}{4}`

### `로그2단계/008.webp`
- **P3(REVIEW)**: `\frac{\log_3 4\sqrt{2} + \log_3 2\sqrt{3} - \log_3 \sqrt{6}}{\log_3 2}  의 값은? ① 1 ② 2 ③ 3 ④ 4 ⑤ 5`

### `로그2단계/008a.webp`
- **P3(REVIEW)**: `해설  \frac{\log_{3} 4\sqrt{2} + \log_{3} 2\sqrt{3} - \log_{3} \sqrt{6}}{\log_{3} 2}   = \frac{\log_{3} \frac{4\sqrt{2} \c`

### `로그2단계/009.webp`
- **P3(REVIEW)**: `x = \sqrt{7+ } , \ y = \sqrt{7- } \ 일 \ 때, \log_{2}x + \log_{2}y \ 의 \ 값은? ① \ 1 \ ② \ 2 \ ③ \ 3 \ ④ \ 4 \ ⑤ \ 5`

### `로그2단계/010.webp`
- **P3(REVIEW)**: `a, b가 양수일 때  \log_4 a + \log_2 b^2 = 9, \log_4 b^2 + \log_2 a = 6  이 성립한다.  의 값을 구하시오.`

### `로그2단계/009a.webp`
- **P5(REVIEW)**: `\n\n해설 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n해설 
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲

### `로그2단계/011a.webp`
- **P3(REVIEW)**: `정답 ②\n\n해설  \n\n = \log_2 2^2 = 2`

### `로그2단계/014a.webp`
- **P3(REVIEW)**: `(\log_3   + 4 \log_7  ) \cdot \log_{27} 49 \n\n= \left( \log_3 3^{ } + 4 \log_7 3^{ } \right) \cdot \log_3 7^2 \n\n= \le`

### `로그2단계/012a.webp`
- **P3(REVIEW)**: `선분  를  로 외분하는 점을  라 하자. 점  의  좌표는  \frac{2 \log_3 \frac{1}{9} - 2}{2 - 1} = 2 \cdot (-2) - 2 = -6  점  는 직선   위에 있으므로 점  `

### `로그2단계/015a.webp`
- **P3(REVIEW)**: `해설   이므로  33 \log \sqrt{ab} = \frac{33}{\log_c \sqrt{ab}} = \frac{33}{\log_c (ab)^{\frac{1}{2}}}   = \frac{33}{\frac{1}{`

### `로그2단계/018a.webp`
- **P3(REVIEW)**: `해설  에서  2\log_2 a = \frac{1}{2} \log_2 ab, 2\log_2 a = \frac{1}{2} (\log_2 a + \log_2 b)   4\log_2 a = \log_2 a + \log_2`

### `로그2단계/017a.webp`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲

### `로그2단계/021.webp`
- **P3(REVIEW)**: `x = \log_5(  - 1)일 때, 5^x + 5^{-x}의 값은? ①  \sqrt{2} \sqrt{2} \sqrt{2}`

### `로그2단계/019a.webp`
- **P3(REVIEW)**: `로그의 성질을 이용하여 조건을 만족시키는 자연수의 개수를 구할 수 있는가?  \log_4 2n^2 - \frac{1}{2} \log_2 \sqrt{n} = \log_4 2n^2 - \log_4 \sqrt{n}   =`

### `로그2단계/023.webp`
- **P3(REVIEW)**: `a = \left( \right)^{\log_{4}{16}}, \ b = 25^{\log_{5}{3}}일 때, \ a^2 + b^2의 값을 구하시오.`

### `로그2단계/020a.webp`
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲

### `로그2단계/022a.webp`
- **P3(REVIEW)**: `해설   \n = (\text{log}_3 2^2 + \text{log}_3 2)(\text{log}_2 3^4 + \text{log}_2 3^2)  \n = \bigg(2\text{log}_3 2 + \frac{1`
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲

### `로그2단계/023a.webp`
- **P3(REVIEW)**: `해설\n\n a = \left( \sqrt{8} \right)^{\log_{9} 16} = \left( \sqrt{2^3} \right)^{2 \log_{9} 4} = \left( 2^{\frac{3}{2}} \ri`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `로그2단계/024a.webp`
- **P3(REVIEW)**: `해설    = 2 + \log_3 3^2 = 2 + 2 = 4     = \log_3 3^{\frac{7}{2}} = \frac{7}{2}    따라서 세 수의 대소 관계는  이므로 가장 큰 수와 가장 작은 수의 곱`

### `로그2단계/026.webp`
- **P3(REVIEW)**: `다음은 지수법칙  을 이용하여 양의 실수  에 대하여  가 성립함을 증명한 과정이다. (단,  ) <증명>  로 놓으면  이고  \frac{a^p}{a^q} = a^{p-q} = \text{(다)} 이다. 그러므로,`

### `로그2단계/027.webp`
- **P3(REVIEW)**: `다음은 두 양수  ,  에 대하여    가 성립함을 증명한 것이다.  \log_a x = r \text{로 놓으면}   x = a^r \text{이므로} \boxed{\text{(가)}} = a^{nr}  따라서  `

### `로그2단계/029.webp`
- **P3(REVIEW)**: `log_{2}5의 정수 부분을  , 소수 부분을  라 할 때,  \frac{2^{-x} + 2^{-y}}{2^x + 2^y}  의 값을 구하시오.`

### `로그2단계/028a.webp`
- **P3(REVIEW)**: `log 2가 무리수임을 증명할 수 있는가를 묻는 문제이다. log 2가 유리수라고 가정하자.  \log 2 = \frac{n}{m} \quad (m,\ n \text{은 서로소인 자연수})  으로 놓으면  0 < \`

### `로그2단계/026a.webp`
- **P3(REVIEW)**: `상용로그의 성질을 추론하기   이므로  \frac{a^p}{a^q} = \frac{x}{y}, a^{p-q} = \frac{x}{y}   \therefore p-q = \log_a \left( \frac{x}{y} `

### `로그2단계/024.webp`
- **P3(REVIEW)**: `다음 세 실수   중 가장 큰 수와 가장 작은 수의 곱을 구하시오.\n\n A = \frac{\text{log}_9 25 + 1}{\text{log}_9 3} \n\n B = \text{log}_9 \sqrt{27}`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `로그2단계/028.webp`
- **P3(REVIEW)**: `[2008년 9월 고2 이과 9번] 다음은  가 무리수임을 증명한 것이다. <증명>  가 유리수라고 가정하자.  \log 2 = \frac{n}{m} \quad (m,\ n \text{은 서로소인 자연수})  로 놓`

### `로그2단계/029a.webp`
- **P3(REVIEW)**: `정답   해설   이므로   \[ \therefore x = 2 \]   에서 \[ y = \log_2 5 - 2 = \log_2 \frac{5}{4} \] \[ \therefore 2^y = \frac{5}{4} `

### `로그2단계/033a.webp`
- **P3(REVIEW)**: `해설  \\n= -  (\log_5 2^3 + \log_5 3^2)\\n= -  (3 \log_5 2 + 2 \log_5 3)\\n= -  (3a + 2b)\\n= -  a - b`

### `로그2단계/034a.webp`
- **P3(REVIEW)**: `해설    \n\n = \log 30 - \log 125   \n\n = \log (3 \cdot 10) - \log 5^3   \n\n = \log 3 + 1 - 3 \log 5   \n\n \therefore \`
- **P5(REVIEW)**: `  \n\n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲\n
- **P5(REVIEW)**: `  \n\n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲\n
- **P5(REVIEW)**: `  \n\n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲\n

### `로그2단계/037a.webp`
- **P3(REVIEW)**: `해설  에서   \n\n \therefore \log_x y^2 = \frac{\log_3 xy^2}{\log_3 x^2 y} = \frac{\log_3 x + 2\log_3 y}{2\log_3 x + \log_3 `
- **P5(REVIEW)**: ` \n\n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n

### `로그2단계/036a.webp`
- **P3(REVIEW)**: `해설   이므로  \log_{20} 90 = \frac{\log_3 90}{\log_3 20}   = \frac{\log_3 (2 \cdot 3^2 \cdot 5)}{\log_3 (2^2 \cdot 5)}   = \`

### `로그2단계/039a.webp`
- **P3(REVIEW)**: `해설    \n   \n   \n \therefore \log_{10} \frac{x^2 z^4}{y^3} = \log_{10} x^2 + \log_{10} z^4 - \log_{10} y^3   \n   \n`
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲

### `로그2단계/041a.webp`
- **P3(REVIEW)**: `해설  에서   ∴     a^4 b^3 = a^{\frac{4}{4}} a^{\frac{7}{4}} = a^4  이므로  \log_a a^4 b^3 = \log_a a^4 = \frac{7}{4}`

### `로그2단계/040a.webp`
- **P3(REVIEW)**: `해설  에서  \n\n∴  \n\n∴  \n\n = 5^{\log_5 x} \cdot (5^3)^{\log_5 y} = 5^{\log_5 x} \cdot 5^{\frac{3}{2} \log_5 y} \n\n = 5^`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `로그2단계/042a.webp`
- **P3(REVIEW)**: `해설\n\n 의 양변에 밑이 2인 로그를 취하면\n\n \log_2 a^2 = \log_2 8,\ 2\log_2 a = \log_2 2^3 = 3 \n\n∴  \n\n 의 양변에 밑이 2인 로그를 취하면\n\n \l`
- **P5(REVIEW)**: `\n\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n∴ 
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `의 양변에 밑이 2인 로그를 취하면\n\n` — KaTeX parse error: Undefined control sequence: \n at position 20: …에 밑이 2인 로그를 취하면\̲n̲\n
- **P5(REVIEW)**: `\n\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n∴ 
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `의 양변에 밑이 2인 로그를 취하면\n\n` — KaTeX parse error: Undefined control sequence: \n at position 20: …에 밑이 2인 로그를 취하면\̲n̲\n
- **P5(REVIEW)**: `\n\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n∴ 
- **P5(REVIEW)**: `\n\n따라서 주어진 식의 값은\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 주어진 식의 값은…
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `로그2단계/038a.webp`
- **P3(REVIEW)**: `해설  에서 로그의 정의에 의하여  이므로  \log_{10} 2 = \log_{10} \frac{10}{5} = \log_{10} 10 - \log_{10} 5   = 1 - b   \therefore \log_{`

### `로그2단계/047a.webp`
- **P3(REVIEW)**: `이차방정식의 근과 계수의 관계에 의하여   \[ \therefore \log_2 \alpha + \log_2 \beta = \log_2 \alpha \beta = \log_2 4 \] \[ = \log_2 2^2 =`

### `로그2단계/048a.webp`
- **P3(REVIEW)**: `이차방정식의 근과 계수의 관계에 의하여   \[ \therefore \alpha + \beta - \alpha \beta = 2 \log_{g_2} 5 - 2 \] \[ = \log_{g_2} 5^2 - \log_{`

### `로그2단계/049a.webp`
- **P3(REVIEW)**: `해설 이차방정식의 근과 계수의 관계에 의하여    \therefore \; 3^{(\alpha - 1)(\beta - 1)} = 3^{\alpha \beta - (\alpha + \beta) + 1} = 3^{3 -`

### `로그2단계/051.webp`
- **P3(REVIEW)**: `10 < x < 100이고 \log   와 \log x^2의 차가 정수일 때, \log x의 값을 구하시오.`

### `로그2단계/046a.webp`
- **P3(REVIEW)**: `이차방정식  의 두 실근을   이므로 근과 계수와의 관계에 의하여  ,   \[ \therefore \ 3 \log_3 \beta + \frac{1}{2} \log_3 \alpha^2 \] \[ = \log_3 \b`

### `로그2단계/052.webp`
- **P3(REVIEW)**: `1000 < x < 10000이고 \log x^2와 \log \sqrt[3]{x^2}의 차가 정수일 때, \log x의 값을 구하시오.`

### `로그2단계/053a.webp`
- **P3(REVIEW)**: `로 놓으면  \log_n 3 = \frac{k}{5}, \ n^{\frac{k}{5}} = 3   \therefore n = 3^k  이때  이 2 이상의 자연수이므로  도 자연수이어야 한다. 즉, 주어진 조건을 만`

### `로그2단계/056a.webp`
- **P3(REVIEW)**: `해설    \n\n = \log(2 \cdot 3^2) - \log 2^{\frac{1}{2}} + \log \frac{10}{2} \n\n = \log 2 + 2 \log 3 - \frac{1}{2} \log 2 `
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `로그2단계/056.webp`
- **P3(REVIEW)**: `log2 = 0.3010, log3 = 0.4771일 때,  \log 18 - \log \sqrt{2} + \log 5 의 값은? ① 0.8037 ② 1.3037 ③ 1.8037 ④ 2.3037 ⑤ 2.8037`

### `로그2단계/058a.webp`
- **P3(REVIEW)**: `pH가 1일 때의 수소 이온 농도를  라 하면  1 = \log \frac{1}{a}, \frac{1}{a} = 10  ∴   pH가 4일 때의 수소 이온 농도를  라 하면  4 = \log \frac{1}{b}, `

### `로그2단계/059.webp`
- **P3(REVIEW)**: `별의 등급  과 별의 밝기   사이에는 다음과 같은 관계식이 성립한다고 한다.  m = -\frac{5}{2} \log I + C \;(단,\; C \text{는 상수})  이때  등급인 별의 밝기는  등급인 별의 `

### `로그2단계/062.webp`
- **P3(REVIEW)**: `별의 등급  과 별의 밝기   사이에는 다음과 같은 관계식이 성립한다고 한다.  m = -\frac{5}{2} \log I + C (단, \ C는 \ 상수)  이때  등급인 별의 밝기는  등급인 별의 밝기의 몇 배인`

### `로그2단계/062a.webp`
- **P5(REVIEW)**: `\n\n8등급인 별의 밝기를 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n8등급인 별의 밝기를 
- **P5(REVIEW)**: `라 하면\n\n` — KaTeX parse error: Undefined control sequence: \n at position 5: 라 하면\̲n̲\n
- **P5(REVIEW)**: `\n\n① ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n① 
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 -2등급인 별의 밝기는 8등급인 별의 밝기의 10000배이다.` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 -2등급인 별의 …

### `로그2단계/063a.webp`
- **P3(REVIEW)**: `처음 빛의 밝기를  라 하면 창문을 6장 통과한 빛의 밝기는  A \left(1 - \frac{28}{100}\right)^6 = A \cdot 0.72^6   에 상용로그를 취하면  \log 0.72^6 = 6 \`

### `로그2단계/065a.webp`
- **P3(REVIEW)**: `원산지 가격을  라 하면  ax^4 = 2.09a, \, 즉, \, x^4 = 2.09  양변에 상용로그를 취하면  \log x^4 = \log 2.09   4 \log x = 0.32   \log x = 0.08 `

### `로그2단계/066a.webp`
- **P3(REVIEW)**: `현재의 가격은  A(1+0.1)^3(1-0.1)^3 = A \cdot 0.99^3  0.99^3에 상용로그를 취하면  \log 0.99^3 = 3 \log 0.99 = 3 \log (9.9 \cdot 10^{-1})`

### `지수함수2단계/004a.webp`
- **P3(REVIEW)**: `해설  에서   \[ \cdots \; ①  f(8) = n a^8 = n \frac{n}{m} = a^{8-2} = a^6`
- **P5(REVIEW)**: `\] ` — KaTeX parse error: Can't use function '\]' in math mode at position 1: \̲]̲ 
- **P5(REVIEW)**: ` \[ \cdots \; ② \] ② ÷ ①을 하면 ` — KaTeX parse error: Undefined control sequence: \[ at position 2:  \̲[̲ \cdots \; ② \]…
- **P5(REVIEW)**: ` \[ \therefore \; f(-24) = a^{-24} = (a^6)^{-4} = \left(\frac{n}{m}\right)^{-4} ` — KaTeX parse error: Undefined control sequence: \[ at position 2:  \̲[̲ \therefore \; …

### `지수함수2단계/009a.webp`
- **P3(REVIEW)**: `함수  의 그래프를  축의 방향으로  만큼  축의 방향으로  만큼 평행이동 시키면  이다. 이 함수의 그래프가 두 점  ,  를 지나므로  2^{-1-m} + n = 1   2^{-m} + n = 5  ①      `

### `지수함수2단계/005a.webp`
- **P1(AUTO)** line 0: `점 $(f(t), t)$는 곡선 $y = a^x$ 위의 점이므로  \n$$t = a^{f(t)}$$ \n$$\therefore f(t) = \log_a t$$ \n점 $(g(t), t)$는 곡선 $y = b^x$ 위`
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n점 ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲점 
- **P5(REVIEW)**: ` 위의 점이므로  \n` — KaTeX parse error: Undefined control sequence: \n at position 11:  위의 점이므로  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: `에서  \n` — KaTeX parse error: Undefined control sequence: \n at position 5: 에서  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: `\therefore a = b^{\frac{1}{2}} \quad \cdots \text{ ① ` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: …cdots \text{ ① 
- **P5(REVIEW)**: ` \n또한, ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲또한, 
- **P5(REVIEW)**: `이므로  \n` — KaTeX parse error: Undefined control sequence: \n at position 6: 이므로  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲

### `지수함수2단계/015a.webp`
- **P3(REVIEW)**: `지수함수의 그래프를 이용하여 주어진 문제를 해결한다. 함수  의 그래프는 함수  의 그래프를   축의 방향으로 5 만큼,   축의 방향으로   만큼 평행이동시킨 것이다. 따라서 이 그래프가   축과 만나는 점의   `

### `지수함수2단계/022.webp`
- **P3(REVIEW)**: `다음 세 수  의 대소 관계를 바르게 나타낸 것은?  A = \frac{1}{\sqrt[5]{5}}, B = \frac{1}{5^2}, C = \sqrt[4]{\frac{1}{5}}  ①   ②   ③   ④   ⑤`

### `지수함수2단계/023.webp`
- **P3(REVIEW)**: `일 때, 세 수  ,  ,  의 대소 관계는? ① a < a^a < a^{a^a} ② a < a^{a^a} < a^a ③ a^a < a < a^{a^a} ④ a^{a^a} < a < a^a ⑤ a^{a^a} < a^`

### `지수함수2단계/022a.webp`
- **P5(REVIEW)**: `\n\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n∴ 

### `지수함수2단계/020a.webp`
- **P3(REVIEW)**: `지수함수의 그래프 이해하기 두 곡선  가 점 P에서 만나므로  에서    이므로 교점 P의 좌표는 P(0, 2) 서로 다른 두 점 A, B의 중점이 P이므로 점  에서  \frac{a+b}{2} = 0, \frac{`

### `지수함수2단계/018a.webp`
- **P3(REVIEW)**: `두 함수  ,  의 그래프가  축과 만나는 점의 좌표를 각각  ,  이라 하면  2^\alpha - 3 = 0 에서    2^{-\beta+2} - 24 = 0 에서  ,    \therefore 2^\beta = `

### `지수함수2단계/023a.webp`
- **P3(REVIEW)**: `해설  일 때,  은  의 값이 증가하면  의 값도 증가하므로  에서  a^0 < a^{\frac{1}{a}} < a^1, \; 즉 \; 1 < a^{\frac{1}{a}} < a  마찬가지로  이므로  에서  a^`

### `지수함수2단계/024a.webp`
- **P3(REVIEW)**: `해설  일 때,  은  의 값이 증가하면  의 값은 감소하므로  에서  , 즉   마찬가지로  이므로  에서  \left(\frac{1}{a}\right)^a < \left(\frac{1}{a}\right)^{a^a`

### `지수함수2단계/025a.webp`
- **P1(AUTO)** line 0: `해설  \n$$A = \sqrt[n+1]{a^{n+2}} = a^{\frac{n+2}{n+1}},$$  \n$$B = \sqrt[n+2]{a^{n+3}} = a^{\frac{n+3}{n+2}},$$  \n$$C = `
- **P3(REVIEW)**: `해설  \n A = \sqrt[n+1]{a^{n+2}} = a^{\frac{n+2}{n+1}},   \n B = \sqrt[n+2]{a^{n+3}} = a^{\frac{n+3}{n+2}},   \n C = \sqrt`
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n\n이므로  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲\n이므로  \n
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `\therefore \frac{n+2}{n+1} > \frac{n+3}{n+2} \quad \cdots \text{① ` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: …\cdots \text{① 
- **P5(REVIEW)**: `  \n\n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲\n
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n\n①, ②에서  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲\n①, ②에서  \n
- **P5(REVIEW)**: `  \n\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲\n이때 
- **P5(REVIEW)**: `이므로  \n` — KaTeX parse error: Undefined control sequence: \n at position 6: 이므로  \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲

### `지수함수2단계/031a.webp`
- **P3(REVIEW)**: `정답   해설  로 놓으면  에서    에서  이므로  은  가 최소일 때 최대가 된다.  이므로  는  에서 최소값  를 갖는다. 따라서 함수  은  에서 최댓값  을 갖고, 최댓값이 25이므로  a^{-2} = `

### `지수함수2단계/036a.webp`
- **P3(REVIEW)**: `해설   \[ 2^x = t \text{로 놓으면 } 0 \leq x \leq 3 \text{에서 } 1 \leq t \leq 8 \text{이고} \]   따라서  는  일 때 최댓값  ,  일 때 최솟값  를 가`

### `지수함수2단계/037a.webp`
- **P3(REVIEW)**: `해설  로 놓으면  이므로 산술평균과 기하평균의 관계에 의하여  t = 3^{\frac{1}{2}x} + 3^{-\frac{1}{2}x} \geq 2\sqrt{3^{\frac{1}{2}x} \cdot 3^{-\fra`

### `지수함수2단계/038a.webp`
- **P3(REVIEW)**: `,  이므로 산술평균과 기하평균의 관계에 의하여  y = 2 \cdot 3^x + 18 \cdot 3^{-x}   \geq 2 \sqrt{(2 \cdot 3^x) \cdot (18 \cdot 3^{-x})}   = `

### `지수함수2단계/041a.webp`
- **P3(REVIEW)**: `해설   에서  2^{-2x^2} \cdot 2^{5x} = 2^{-3}, \; 2^{-2x^2 - 5x} = 2^{-3}  즉,   이므로   따라서 이차방정식의 근과 계수의 관계에 의하여 주어진 방정식의 모든 실`

### `지수함수2단계/040a.webp`
- **P3(REVIEW)**: `정답   해설  에서  이므로   이때  ,  이므로 산술평균과 기하평균의 관계식에 의하여  5^x + 5^{-x-6} \geq 2\sqrt{5^x \cdot 5^{-x-6}} = 2\sqrt{\left(\frac{`

### `지수함수2단계/039a.webp`
- **P3(REVIEW)**: `로 놓으면  ,  이므로 산술평균과 기하평균의 관계에 의하여  t = 7^x + 7^{-x} \geq 2 \sqrt{7^x \cdot 7^{-x}}  (단, 등호는  일 때 성립)   이때  이므로 주어진 함수는  `

### `지수함수2단계/045a.webp`
- **P3(REVIEW)**: `해설 지수방정식 이해하기  라 하면 주어진 방정식은  t^2 - 11t + 28 = 0   (t - 4)(t - 7) = 0    또는    이라 하면  9^\alpha + 9^\beta = (3^\alpha)^2 `

### `지수함수2단계/050.webp`
- **P3(REVIEW)**: `연립방정식  \begin{cases} 4^x + 4^y = 8 \\ 16^x + 16^y = 40 \end{cases}  의 해를  ,  라 할 때,  의 값을 구하시오. (단,  )`

### `지수함수2단계/051a.webp`
- **P3(REVIEW)**: `해설 \[ \begin{cases} \left( \frac{1}{2} \right)^x + \left( \frac{1}{2} \right)^y = 10 \\ \left( \frac{1}{2} \right)^{x+y}`

### `지수함수2단계/048a.webp`
- **P3(REVIEW)**: `해설  에서  로 놓으면 산술평균과 기하평균의 관계에 의하여  t = 3^x + 3^{-x} \geq 2\sqrt{3^x \cdot 3^{-x}} = 2 이므로     즉,  에서      이므로    에서     `

### `지수함수2단계/058a.webp`
- **P3(REVIEW)**: `로 놓으면  이므로  에서   ∴   주어진 지수방정식이 실근을 가지므로  에 대한 이차방정식  도 실근을 가져야 한다. 이 이차방정식의 판별식을  라 하면  \frac{D}{4} = a^2 - 9 \geq 0 에서`

### `지수함수2단계/062a.webp`
- **P3(REVIEW)**: `해설   에서   \[ \therefore x > 4 \] 또,   에서 \[ 5^{x-5} < 5^2, \; x-5 < 2 \] \[ \therefore x < 7 \] 따라서   이므로 모든 정수  의 값의 합은`

### `지수함수2단계/059a.webp`
- **P3(REVIEW)**: `해설  에서      로 놓으면  이므로 산술평균과 기하평균의 관계에 의하여   (단, 등호는  일 때 성립)   ∴   따라서 주어진 방정식은  t^2 - 2kt + 16 = 0  (단,  ) ... ①  D   `

### `지수함수2단계/065a.webp`
- **P3(REVIEW)**: `지수부등식을 이용하여 수학내적문제 해결하기\n\n A = \left\{ x \; \middle| \; \left( \frac{1}{3} \right)^{x+2} < \left( \frac{1}{3} \right)^{`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n그러므로 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n그러므로 
- **P5(REVIEW)**: ` 이다.\n\n즉, ` — KaTeX parse error: Undefined control sequence: \n at position 5:  이다.\̲n̲\n즉, 
- **P5(REVIEW)**: ` 이다.\n\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 5:  이다.\̲n̲\n∴ 

### `지수함수2단계/069a.webp`
- **P3(REVIEW)**: `해설   에서  x^3x^2 - 7x > x^{-2}  … ①  0 < x < 1       0 < x < 1   x = 1 1^{-4} > 1^{-2}   x > 1       x > 1 x > 2`

### `지수함수2단계/071a.webp`
- **P3(REVIEW)**: `해설 \(7^{2x} - 7^x + 1 + k > 0\)에서 \(7^{2x} - 7 \cdot 7^x + k > 0\) \(7^x = t \ (t > 0)\)으로 놓으면 \(t^2 - 7t + k > 0\) \[\l`

### `지수함수2단계/076a.webp`
- **P3(REVIEW)**: `해설 처음 통과한 빛의 양을  라 하면 필름을  장 통과한 빛의 양은  이므로 처음 양의   이하가 되려면  a \cdot 0.6^n \leq a \cdot \frac{81}{625}   a \cdot \left(\`

### `지수함수2단계/077a.webp`
- **P3(REVIEW)**: `2020년도의 인구수를  라 하면  P = 5 \cdot 2^{\frac{2020 - 2010}{15}} = 5 \cdot 2^{\frac{10}{15}} = 5 \cdot 2^{\frac{2}{3}}  이므로  2`

### `지수함수2단계/075a.webp`
- **P1(AUTO)** line 0: `지수법칙을 이용하여 실생활 문제를 해결한다. $$P_1 = \frac{72 - 65}{14} \times (1.05)^{10}$$ $$= \frac{1}{2} \times 1.05^{10} \quad \cdots \`
- **P5(REVIEW)**: `= \frac{1}{2} \times 1.05^{10} \quad \cdots \text{① ` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: …\cdots \text{① 

### `로그함수2단계/002a.webp`
- **P3(REVIEW)**: `해설   \n = f(g(2)) + g(h(2))  \n = f(4) + g(1)  \n = 2^4 + 1 = 17`
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲

### `로그함수2단계/001a.webp`
- **P3(REVIEW)**: `해설   \n = 2 + k \log_2 2^5  \n = 2 + \frac{5}{4} k  \n  \n = 1 + k \log_2 2^5  \n = 1 + \frac{5}{2} k  \n  이므로 \n 2 + \f`
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` 이므로 \n` — KaTeX parse error: Undefined control sequence: \n at position 6:  이므로 \̲n̲
- **P5(REVIEW)**: ` \n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲따라서 

### `로그함수2단계/005a.webp`
- **P3(REVIEW)**: `해설  이므로   ㄱ.  의  에  를 대입하면  y = \log_2 \frac{4}{a} = 2 + \log_2 a^{-1} = 2 - \log_2 a = -b + 2   \therefore \left( \frac`

### `로그함수2단계/008.webp`
- **P3(REVIEW)**: `함수  에 대한 설명으로 옳지 않은 것은? ①  \{x | x > 0\} (0, 1) x 0 < a < 1 x y y = a^x y = x y = \log_a \left(-\frac{1}{x}\right)`

### `로그함수2단계/012a.webp`
- **P3(REVIEW)**: `주어진 조건을 만족시키는 로그함수를 구할 수 있는가?  가 두 점  과  를 지나므로  \log_2(-a + b) = 0, \ -a + b = 2^0 = 1   \log_2 b = 2, \ b = 2^2 = 4  따`

### `로그함수2단계/009a.webp`
- **P3(REVIEW)**: `해설  에서 \n 10 - x^2 > 0, x^2 < 10  \n -\text{√}10 < x < \text{√}10  \n \therefore A = \\{ x | -\text{√}10 < x < \text{√}1`
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: `에서 \n` — KaTeX parse error: Undefined control sequence: \n at position 4: 에서 \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n따라서 집합 ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲따라서 집합 

### `로그함수2단계/018a.webp`
- **P3(REVIEW)**: `사각형  는 한 변의 길이가 4인 정사각형이므로  이고, 점  의  좌표를  라 하면  \log_3 k = 4 \quad \therefore \; k = 3^4 = 81   이므로 점  의  좌표는   \(\ther`

### `로그함수2단계/028a.webp`
- **P5(REVIEW)**: `\n\log_{0.1} 216 < \log_{0.1} 24 < \log_{0.1} 3.6` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\log_{0.1} 216 …

### `로그함수2단계/034a.webp`
- **P3(REVIEW)**: `진수의 조건에서   \[ \therefore -3 < x < 1 \quad \cdots \quad \text{①  y = \log_{\frac{1}{2}} (1-x) + \log_{\frac{1}{2}} (x+3) `
- **P5(REVIEW)**: `} \] ` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲ \] 
- **P5(REVIEW)**: ` \[ = \log_{\frac{1}{2}} (1-x)(x+3) \] \[ = \log_{\frac{1}{2}} (-x^2 - 2x + 3) \` — KaTeX parse error: Undefined control sequence: \[ at position 2:  \̲[̲ = \log_{\frac{…
- **P5(REVIEW)**: `이라 하면 \[ f(x) = -(x+1)^2 + 4 \] ` — KaTeX parse error: Undefined control sequence: \[ at position 7: 이라 하면 \̲[̲ f(x) = -(x+1)^…
- **P5(REVIEW)**: `일 때 최댓값 4를 가지므로 \[ y = \log_{\frac{1}{2}} 4 = -\log_2 2^2 = -2 \] 따라서 ` — KaTeX parse error: Undefined control sequence: \[ at position 17: … 때 최댓값 4를 가지므로 \̲[̲ y = \log_{\fra…
- **P5(REVIEW)**: `이므로 \[ a - m = -1 - (-2) = 1 \]` — KaTeX parse error: Undefined control sequence: \[ at position 5: 이므로 \̲[̲ a - m = -1 - (…

### `로그함수2단계/035a.webp`
- **P3(REVIEW)**: `해설 \(x^2 - 2x + 65 = t\)로 놓으면 주어진 함수는 \(y = \log_{a-3} t\)이고, \(t = (x-1)^2 + 64 \geq 64\) 이때 \(y = \log_{a-3} t (t \geq`

### `로그함수2단계/033a.webp`
- **P3(REVIEW)**: `해설 함수  의 밑이 1보다 크므로 진수  의 값이 최소일 때, 함수  는 최소값을 갖는다.  x^2 - 2x + 28 = (x-1)^2 + 27 이므로  -3 \leq x \leq 3 에서  x^2 - 2x + 2`

### `로그함수2단계/040a.webp`
- **P3(REVIEW)**: `해설   이므로  로 놓으면 주어진 함수는  y = 2 \times t \times t - 4(t + t) = 2t^2 - 8t   = 2(t-2)^2 - 8  …… ①  에서  이므로   이 범위에서 ①의 그래프는`

### `로그함수2단계/039a.webp`
- **P3(REVIEW)**: `해설  y=\left(\log_6 \frac{x}{6}\right)\left(\log_6 \frac{216}{x}\right)   =(\log_6 x - \log_6 6)(\log_6 216 - \log_6 x)  `

### `로그함수2단계/041a.webp`
- **P3(REVIEW)**: `해설   의 양변에 상용로그를 취하면  \text{log}y = \text{log}10000x^{6-\text{log}x}   = \text{log}10000 + \text{log}x^{6-\text{log}x}  `

### `로그함수2단계/045a.webp`
- **P3(REVIEW)**: `해설     이때  에서  이므로 산술평균과 기하평균의 관계에 의하여  xy + \frac{9}{xy} + 10 \geq 2\sqrt{xy \cdot \frac{9}{xy} + 10}  (단, 등호는  일 때 성립)`

### `로그함수2단계/044a.webp`
- **P3(REVIEW)**: `해설  는 밑이 1보다 크므로  의 값이 최대일 때, 최댓값을 갖는다.  에서   이때,  이므로    이므로  에서  xy = x(12-x)   = -x^2 + 12x   = -(x-6)^2 + 36  따라서  는`

### `로그함수2단계/043a.webp`
- **P3(REVIEW)**: `진수의 조건에서   \[ \left( \log_6 \frac{x}{6} \right) \left( \log_6 \frac{x}{36} \right) = 12 \] 에서 \( (\log_6 x - \log_6 6)(\`

### `로그함수2단계/038a.webp`
- **P3(REVIEW)**: `해설  에서  \n\n   \n\n 라 하면 주어진 함수는  \n\n y = t^2 + \frac{a}{2} t + b   \n\n = \left( t + \frac{a}{4} \right)^2 - \frac{a^2`
- **P5(REVIEW)**: `  \n\n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲\n
- **P5(REVIEW)**: `  \n\n이므로 ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲\n이므로 
- **P5(REVIEW)**: `이다.  \n\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 6: 이다.  \̲n̲\n이때 
- **P5(REVIEW)**: `에서 최소값 1을 가지므로  \n\n` — KaTeX parse error: Undefined control sequence: \n at position 17: …서 최소값 1을 가지므로  \̲n̲\n
- **P5(REVIEW)**: `  \n\n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲\n
- **P5(REVIEW)**: `에서  \n\n` — KaTeX parse error: Undefined control sequence: \n at position 5: 에서  \̲n̲\n
- **P5(REVIEW)**: `  \n\n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲\n
- **P5(REVIEW)**: `  \n\n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲\n

### `로그함수2단계/050.webp`
- **P3(REVIEW)**: `연립방정식  \begin{cases} \log_2 \{ \log_{10} (x^2 + y^2) \} = 0 \\ \log_9 x + \log_3 \sqrt{y} = \frac{1}{2} \end{cases}  의 해`

### `로그함수2단계/049a.webp`
- **P3(REVIEW)**: `밀과 진수의 조건에서  ,  ,   \[ \therefore x < 0 \text{ 또는 } 0 < x < \frac{2}{3} \] ...... ①  x^2 - 2x + 1 = 4 x = -1 2 - 3x = 1 `
- **P5(REVIEW)**: `일 때 \[ x^2 - 2x - 3 = 0, \ (x+1)(x-3) = 0 \] \[ \therefore x = -1 \text{ 또는 } x ` — KaTeX parse error: Undefined control sequence: \[ at position 5: 일 때 \̲[̲ x^2 - 2x - 3 =…
- **P5(REVIEW)**: `일 때 \[ 3x = 1 \] \[ \therefore x = \frac{1}{3} \] (i), (ii)에 의하여 ` — KaTeX parse error: Undefined control sequence: \[ at position 5: 일 때 \̲[̲ 3x = 1 \] \[ \…

### `로그함수2단계/051a.webp`
- **P3(REVIEW)**: `밑과 진수의 조건에서   \[ 2\log_2 x + 3\log_x 2 - 5 = 0 \] 에서 \[ 2\log_2 x + \frac{3}{\log_2 x} - 5 = 0 \] \( \log_2 x = t \; (t `

### `로그함수2단계/052a.webp`
- **P3(REVIEW)**: `해설 로그방정식 이해하기  라 하면  \log_9 x = \frac{1}{2} \log_3 x = \frac{1}{2} t  이므로  t^2 + 2t - 3 = 0  ∴   또는    \log_3 x = -3  또는`

### `로그함수2단계/050a.webp`
- **P3(REVIEW)**: `진수의 조건에서   \[ \log_{10}(x^2 + y^2) > 0, \text{ 즉 } x^2 + y^2 > 1 \] 주어진 연립방정식은 \[ \begin{cases} \log_2 \{ \log_{10}(x^2 `

### `로그함수2단계/054a.webp`
- **P5(REVIEW)**: `} \] ` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲ \] 
- **P5(REVIEW)**: `에 대입하면 \[ \log_2 (x-3) = \log_2 (-x+9) \] 즉, ` — KaTeX parse error: Undefined control sequence: \[ at position 8: 에 대입하면 \̲[̲ \log_2 (x-3) =…
- **P5(REVIEW)**: ` \[ \therefore y = -6 + 8 = 2 \] ` — KaTeX parse error: Undefined control sequence: \[ at position 2:  \̲[̲ \therefore y =…
- **P5(REVIEW)**: `이므로 \[ \frac{2}{3}a + 2b = 8 \]` — KaTeX parse error: Undefined control sequence: \[ at position 5: 이므로 \̲[̲ \frac{2}{3}a +…

### `로그함수2단계/057.webp`
- **P3(REVIEW)**: `방정식  의 모든 근의 곱은? ① 10 ② 10^2 ③ 10^3 ④ 10^4 ⑤ 10^5`

### `로그함수2단계/057a.webp`
- **P3(REVIEW)**: `100^{x^{\log x}} = x^3의 양변에 상용로그를 취하면\n\log 100^{x^{\log x}} = \log x^3\n\log 100 + \log x^{\log x} = 3 \log x\n2 + (\lo`

### `로그함수2단계/062.webp`
- **P3(REVIEW)**: `x에 대한 이차방정식  x^2 - 2(3 - \log_2 a)x + 4 = 0 이 실근을 갖지 않도록 하는 실수  의 값 중 정수인 것의 개수는? ① 25 ② 27 ③ 29 ④ 31 ⑤ 33`

### `로그함수2단계/059a.webp`
- **P3(REVIEW)**: `방정식  의 한 근이 3이므로\n\n 을 대입하면\n\n (\text{log}_3 3)^2 - \text{log}_3 3^3 + k = 0 \n\n \n\n진수의 조건에서   \;  \n\n (\text{log}_3`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n진수의 조건에서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n진수의 조건에서 
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `에서\n\n` — KaTeX parse error: Undefined control sequence: \n at position 3: 에서\̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `로 놓으면\n\n` — KaTeX parse error: Undefined control sequence: \n at position 6: 로 놓으면\̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n즉, ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n즉, 
- **P5(REVIEW)**: `이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `에서 구하는 해는\n\n` — KaTeX parse error: Undefined control sequence: \n at position 10: 에서 구하는 해는\̲n̲\n

### `로그함수2단계/062a.webp`
- **P3(REVIEW)**: `이차방정식의 판별식을  라 하면  \frac{D}{4} = (3 - \log_2 a)^2 - 4 < 0   (\log_2 a)^2 - 6 \log_2 a + 5 < 0  이때  라 하면  X^2 - 6X + 5 < `

### `로그함수2단계/060a.webp`
- **P3(REVIEW)**: `정답   해설  에서    로 놓으면     이 방정식의 두 근이  이므로 이차방정식의 근과 계수의 관계에 의하여      = \frac{1}{(\log_\alpha 2)^2} + \frac{1}{(\log_\bet`

### `로그함수2단계/064a.webp`
- **P3(REVIEW)**: `진수의 조건에서  ,  이므로  ,   \[ -8<x<4 \] \( \cdots \text{ ①  \alpha=-2-4\sqrt{2} \beta=-2+4\sqrt{2}`
- **P5(REVIEW)**: `} \) \[ \log_2(4-x)+\log_2(8+x)>2 \] 에서 \[ \log_2(4-x)(8+x)>\log_2 2^2 \] 밑이 1보다` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲ \) \[ \log_2(4…
- **P5(REVIEW)**: ` 이므로 \[ \alpha+\beta=(-2-4\sqrt{2})+(-2+4\sqrt{2})=-4 \]` — KaTeX parse error: Undefined control sequence: \[ at position 6:  이므로 \̲[̲ \alpha+\beta=(…

### `로그함수2단계/066.webp`
- **P3(REVIEW)**: `에 대한 연립부등식  \begin{cases} 4^x - 2^x - 2 < 0 \\ \log_a x + 1 > 0 \end{cases}  을 만족시키는 모든  의 값의 범위가  일 때, 두 상수  ,  에 대하여  `

### `로그함수2단계/065a.webp`
- **P3(REVIEW)**: `진수의 조건에서  ,   \[ \therefore x>-1 \quad \cdots \text{①} \]   에서 \[ \log_9 (x+1)^2 < \log_9 (3x+3) \] 밑이 1보다 크므로 \[ (x+1)^`

### `로그함수2단계/066a.webp`
- **P3(REVIEW)**: `지수함수와 로그함수 이해하기\n\n 에서  이라 하면\n\n t^2 - t - 2 < 0, \ (t + 1)(t - 2) < 0 \n\n 에서  , 즉  \n\n∴  \n\n 에서  이므로\n\n \n\n이때 연립부`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n∴ 
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n이때 연립부등식을 만족시키는 모든 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n이때 연립부등식을 만족시…
- **P5(REVIEW)**: `의 값의 범위가\n\n` — KaTeX parse error: Undefined control sequence: \n at position 9: 의 값의 범위가\̲n̲\n
- **P5(REVIEW)**: `이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n∴ 

### `로그함수2단계/069a.webp`
- **P5(REVIEW)**: ` …… ②\n\n①, ②에서 ` — KaTeX parse error: Undefined control sequence: \n at position 6:  …… ②\̲n̲\n①, ②에서 

### `로그함수2단계/070a.webp`
- **P5(REVIEW)**: `}\] ` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲\] 
- **P5(REVIEW)**: ` \[\cdots \; \text{②}\] ①, ②의 공통 범위를 구하면 ` — KaTeX parse error: Undefined control sequence: \[ at position 2:  \̲[̲\cdots \; \text…

### `로그함수2단계/077a.webp`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `로그함수2단계/074a.webp`
- **P5(REVIEW)**: `} \)  \n\( \{ \log_2 (x+6) \}^2 = |\log_2 (x+6)|^2 \)이므로  \n\( |\log_2 (x+6)| = ` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲ \)  \n\( \{ \l…
- **P5(REVIEW)**: `  \n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲∴ 
- **P5(REVIEW)**: `  \n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲이때 
- **P5(REVIEW)**: `  \n즉, ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲즉, 
- **P5(REVIEW)**: `에서  \n` — KaTeX parse error: Undefined control sequence: \n at position 5: 에서  \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲∴ 
- **P5(REVIEW)**: ` \( \cdots \text{②} \)  \n①, ②에서 ` — KaTeX parse error: Can't use function '\(' in math mode at position 2:  \̲(̲ \cdots \text{②…
- **P5(REVIEW)**: `  \n따라서 구하는 모든 정수 ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲따라서 구하는 모든 정수 
- **P5(REVIEW)**: `는  \n` — KaTeX parse error: Undefined control sequence: \n at position 4: 는  \̲n̲

### `로그함수2단계/080.webp`
- **P3(REVIEW)**: `모든 양수  에 대하여 부등식  (\log_4 x)^2 + \log_4 16x^2 - \log_2 k \geq 0  이 성립하도록 하는 모든 정수  의 값의 합은? ①   ②   ③   ④   ⑤`

### `로그함수2단계/078a.webp`
- **P3(REVIEW)**: `(\log_2 x)^2 \geq \log_2   \text{에서} \n(\log_2 x)^2 \geq 6\log_2 x - \log_2 a \n\log_2 x = t \text{로 놓으면} \; t^2 \geq 6t`

### `로그함수2단계/076a.webp`
- **P3(REVIEW)**: `진수의 조건에서   ... ①  x^{\frac{\text{log}_2 x}{\text{log}_2 x}} < 8x^2 \text{log}_2 x^{\frac{\text{log}_2 x}{\text{log}_2 x}`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: ` 의 양변에 밑이 2인 로그를 취하면 \n\n` — KaTeX parse error: Undefined control sequence: \n at position 22: … 밑이 2인 로그를 취하면 \̲n̲\n
- **P5(REVIEW)**: ` \n\n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n
- **P5(REVIEW)**: ` \n\n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n
- **P5(REVIEW)**: ` \n\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n∴ 
- **P5(REVIEW)**: ` \n\n즉, ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n즉, 
- **P5(REVIEW)**: `이므로 \n\n` — KaTeX parse error: Undefined control sequence: \n at position 5: 이므로 \̲n̲\n
- **P5(REVIEW)**: ` \n\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n∴ 
- **P5(REVIEW)**: ` ... ② \n\n①, ②의 공통 범위를 구하면 ` — KaTeX parse error: Undefined control sequence: \n at position 8:  ... ② \̲n̲\n①, ②의 공통 범위를 …
- **P5(REVIEW)**: ` \n\n따라서 주어진 부등식을 만족시키는 정수 ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n따라서 주어진 부등식을 …
- **P5(REVIEW)**: `이므로 구하는 합은 \n\n` — KaTeX parse error: Undefined control sequence: \n at position 12: 이므로 구하는 합은 \̲n̲\n

### `로그함수2단계/082a.webp`
- **P3(REVIEW)**: `해설  년 후의 휴대전화의 가격은  800000 \times (1 - 0.15)^n = 0.85^n \times 800000(\text{원})  이므로 휴대전화의 가격이 8만 원 이하가 되려면  0.85^n \tim`

### `로그함수2단계/079a.webp`
- **P3(REVIEW)**: `해설 (i)  , 즉  일 때 주어진 부등식은   따라서 모든 실수  에 대하여 성립한다. (ii)  , 즉  일 때 모든 실수  에 대하여 주어진 부등식이 성립하려면  에서   ∴   \( \cdots \) ①  `
- **P5(REVIEW)**: ` \( \cdots \) ② ①, ②의 공통 범위를 구하면 ` — KaTeX parse error: Can't use function '\(' in math mode at position 2:  \̲(̲ \cdots \) ② ①,…

### `로그함수2단계/080a.webp`
- **P3(REVIEW)**: `(\log_4 x)^2 + \log_4 16x^2 - \log_2 k \geq 0 \text{에서} \n(\log_4 x)^2 + 2\log_4 x + 2 - \log_2 k \geq 0 \n\log_4 x = t `

### `로그함수2단계/083a.webp`
- **P1(AUTO)** line 0: `로그의 성질을 이용하여 실생활 문제를 해결한다. 주어진 식을 정리하면 $\log \frac{Q_t}{Q_0} = kt$ $$\frac{Q_t}{Q_0} = 10^{kt}$$ 충전된 전하량이 $Q_0$ 인 축전기에 전`
- **P5(REVIEW)**: `\frac{Q_a}{Q_0} = \frac{1}{4} = 10^{ak} \quad \cdots \bigcirc \text{① ` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: …igcirc \text{① 

### `삼각함수성질2단계/002a.webp`
- **P5(REVIEW)**: `\( \frac{9}{2} \pi = 2\pi \cdot 2 + \frac{\pi}{2} \) ② \( -\frac{5}{4} \pi = 2\p` — KaTeX parse error: Can't use function '\(' in math mode at position 1: \̲(̲ \frac{9}{2} \p…

### `삼각함수성질2단계/003a.webp`
- **P3(REVIEW)**: `각  가 제2사분면의 각이므로  2n\pi + \frac{\pi}{2} < \theta < 2n\pi + \pi \ (n \text{은 정수}) 에서  \frac{2n\pi}{3} + \frac{\pi}{6} < \`

### `삼각함수성질2단계/008a.webp`
- **P1(AUTO)** line 0: `각 $2\theta$를 나타내는 동경과 각 $8\theta$를 나타내는 동경이 일치하므로 $$8\theta - 2\theta = 2n\pi \;(n \text{은 정수})$$ $$6\theta = 2n\pi$$ $$`
- **P3(REVIEW)**: `각  를 나타내는 동경과 각  를 나타내는 동경이 일치하므로  8\theta - 2\theta = 2n\pi \;(n \text{은 정수})   6\theta = 2n\pi   \therefore \theta = \`
- **P5(REVIEW)**: `\therefore \theta = \frac{n}{3}\pi \quad \cdots \; \text{① ` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: …ots \; \text{① 

### `삼각함수성질2단계/007a.webp`
- **P3(REVIEW)**: `해설   (라디안)이므로 두 각  와  를 호도법으로 나타내면  150^\circ = 150 \times \frac{\pi}{180} = \frac{5}{6} \pi,   210^\circ = 210 \times \`

### `삼각함수성질2단계/011a.webp`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n그런데 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲그런데 
- **P5(REVIEW)**: ` 이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲이때 
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 
- **P5(REVIEW)**: `에 대입하면\n` — KaTeX parse error: Undefined control sequence: \n at position 7: 에 대입하면\̲n̲

### `삼각함수성질2단계/012a.webp`
- **P3(REVIEW)**: `각  를 나타내는 동경과 각  를 나타내는 동경이 일치하므로  6\theta - 2\theta = 2n\pi \ (n \text{은 정수})   4\theta = 2n\pi   \therefore \theta = \`

### `삼각함수성질2단계/013.webp`
- **P3(REVIEW)**: `0 < \theta < \pi 일 때,   \theta 와 3\theta 의 동경이 같은 직선 위에 있도록 하는 모든 \theta 의 값의 합은? ①   \pi ② \pi ③   \pi ④   \pi ⑤   \pi`

### `삼각함수성질2단계/017a.webp`
- **P3(REVIEW)**: `부채꼴의 반지름의 길이를  라 하면  15\pi = r \cdot \frac{5}{6}\pi  이므로  r = 15\pi \cdot \frac{6}{5\pi} = 18`

### `삼각함수성질2단계/021a.webp`
- **P3(REVIEW)**: `해설 원뿔의 밑면의 둘레의 길이는   이므로 옆면의 전개도인 부채꼴의 호의 길이는   이다. 이 부채꼴의 반지름의 길이를  라 하면 중심각의 크기가   이므로  4\pi = r \times \frac{\pi}{5} `

### `삼각함수성질2단계/018a.webp`
- **P3(REVIEW)**: `선분  ,  라 하면 호  의 길이가  이므로  에서   부채꼴  의 넓이가  이므로  24\pi = \frac{1}{2} r^2 (\pi - \theta)   = \frac{1}{2} r^2 \left( \pi -`

### `삼각함수성질2단계/020a.webp`
- **P3(REVIEW)**: `OP = x라 하면 150^\circ =  \pi이므로 와이퍼의 블레이드로 닦은 부분의 넓이는   \cdot 50^2 \cdot   \pi -   \cdot x^2 \cdot   \pi =   \pi (2500 - `

### `삼각함수성질2단계/022a.webp`
- **P3(REVIEW)**: `선분  라 하면  이므로 와이퍼의 블레이드로 닦은 부분의 넓이는  \frac{1}{2} \cdot 80^2 \cdot \frac{1}{2} \pi - \frac{1}{2} \cdot x^2 \cdot \frac{1}`

### `삼각함수성질2단계/024a.webp`
- **P3(REVIEW)**: `원뿔에서 옆면의 부채꼴의 호의 길이는 밑면의 원의 둘레의 길이와 같으므로 부채꼴의 호의 길이는   즉, 종이의 모양은 다음 그림과 같이 반지름의 길이가  이고, 호의 길이가  인 부채꼴이다. 넓이를  라 하면  S `

### `삼각함수성질2단계/016a.webp`
- **P3(REVIEW)**: `각  를 나타내는 동경과  를 나타내는 동경이  에 대하여 대칭이므로  \theta + 9\theta = 2n\pi + \frac{\pi}{2} \;(n \text{은 정수})   10\theta = 2n\pi + `

### `삼각함수성질2단계/025a.webp`
- **P3(REVIEW)**: `원뿔에서 옆면의 부채꼴의 호의 길이는 밑면의 원의 둘레의 길이와 같으므로 부채꼴의 호의 길이는  2\pi \cdot 6 = 12\pi (\text{cm})  즉, 종이의 모양은 다음 그림과 같이 반지름의 길이가  이`

### `삼각함수성질2단계/023a.webp`
- **P3(REVIEW)**: `다음 그림과 같이 추를 매단 줄의 끝부분을  라 하고 추가 멈춰있을 때의 추의 중심을  , 추가 가장 높이 올라갔을 때의 추의 중심을 각각  ,  라 하자. 직선  와 추의 중심 사이의 거리는 추의 중심이  일 때,`

### `삼각함수성질2단계/030a.webp`
- **P3(REVIEW)**: `해설  이므로    8\sqrt{3} \sin \theta \cos \theta = 8\sqrt{3} \cdot \frac{\sqrt{3}}{2} \cdot \left(-\frac{1}{2}\right) = -6`

### `삼각함수성질2단계/027a.webp`
- **P3(REVIEW)**: `부채꼴의 반지름의 길이를  , 호의 길이를  이라 하면 둘레의 길이가 24이므로  2r + l = 24  ∴   이때  ,  이므로   부채꼴의 넓이를  라 하면  S = \frac{1}{2} rl   = \frac`

### `삼각함수성질2단계/028a.webp`
- **P3(REVIEW)**: `부채꼴의 중심각의 크기를  , 반지름의 길이를  , 호의 길이를  , 넓이를  라 하면  이므로  S = \frac{1}{2} rl = \frac{1}{2} r(32 - 2r) = -r^2 + 16r   이므로   `

### `삼각함수성질2단계/029a.webp`
- **P3(REVIEW)**: `부채꼴의 반지름의 길이를  , 호의 길이를  라 하면 둘레의 길이가  이므로  2r + l = 20 \quad \therefore l = 20 - 2r  이때  ,  이므로   부채꼴의 넓이를  라 하면  S = \`

### `삼각함수성질2단계/033a.webp`
- **P3(REVIEW)**: `정답   해설  이고   이므로  \sin \alpha = \frac{\sqrt{5}}{5}, \cos \beta = \frac{2\sqrt{5}}{5}  이므로  \sin \alpha \cos \beta = \fr`

### `삼각함수성질2단계/034a.webp`
- **P3(REVIEW)**: `점  에서   이므로  \frac{a}{3\sqrt{3}} = \frac{\sqrt{3}}{3} \therefore a = 3  따라서 점  의 좌표가  이므로  r = \sqrt{(3\sqrt{3})^2 + 3^2`

### `삼각함수성질2단계/026a.webp`
- **P3(REVIEW)**: `부채꼴의 반지름의 길이를  라 하면  \frac{\pi}{2} x = \pi 에서   다음 그림과 같이 부채꼴에 내접하는 원의 반지름의 길이를  라 하면  이므로  \angle OAH = \frac{1}{2} \cd`

### `삼각함수성질2단계/034.webp`
- **P3(REVIEW)**: `원점  와 제1사분면에 있는 점  에 대하여  를 동경으로 하는 각의 크기를  라 하면  \tan \theta = \frac{\sqrt{3}}{3}  이다.  라 할 때,  의 값은? ① 6 ② 7 ③ 8 ④ 9 ⑤`

### `삼각함수성질2단계/036.webp`
- **P3(REVIEW)**: `일 때,  \left| 2\sin\theta - \frac{1}{3} \right| - \sqrt{(\cos\theta + \pi)^2} + |\sin\theta - 3\cos\theta| 를 간단히 하면? ①   `

### `삼각함수성질2단계/036a.webp`
- **P3(REVIEW)**: `해설  가 제4사분면의 각이므로  ,   따라서  ,    이므로  \left| 2\sin\theta - \frac{1}{3} \right| - \sqrt{(\cos\theta + \pi)^2} + |\sin\the`

### `삼각함수성질2단계/037a.webp`
- **P3(REVIEW)**: `정답 ③  \sin \theta \cos \theta \neq 0 \frac{\sqrt{\sin \theta}}{\sqrt{\cos \theta}} = -\sqrt{\frac{\sin \theta}{\cos \the`
- **P5(REVIEW)**: `\n\n해설\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n해설\n\n
- **P5(REVIEW)**: ` 이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n즉, ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n즉, 
- **P5(REVIEW)**: `는 제2사분면의 각이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 14: 는 제2사분면의 각이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 

### `삼각함수성질2단계/041.webp`
- **P3(REVIEW)**: `\frac{-1 + \cos^4 \theta}{\sin^2 \theta} - \sin^2 \theta 를 간단히 하시오.`

### `삼각함수성질2단계/041a.webp`
- **P3(REVIEW)**: `정답   해설  \frac{-1 + \cos^4 \theta}{\sin^2 \theta} - \sin^2 \theta   = \frac{(1 + \cos^2 \theta)(1 - \cos^2 \theta)}{\sin`

### `삼각함수성질2단계/040a.webp`
- **P3(REVIEW)**: `해설  \frac{1-\cos^4\theta}{\sin^2\theta} + \sin^2\theta  \[= \frac{(1+\cos^2\theta)(1-\cos^2\theta)}{\sin^2\theta} + \sin`

### `삼각함수성질2단계/043a.webp`
- **P3(REVIEW)**: `해설   \n = \sqrt{\sin^2\theta + 2\sin\theta\cos\theta + \cos^2\theta}  \n + \sqrt{\sin^2\theta - 2\sin\theta\cos\theta + `
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n(∵ ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲(∵ 
- **P5(REVIEW)**: `) \n` — KaTeX parse error: Undefined control sequence: \n at position 3: ) \̲n̲

### `삼각함수성질2단계/039a.webp`
- **P3(REVIEW)**: `해설 \( \cos\theta < 0, \tan\theta > 0 \)에서 \( \theta \)는 제3사분면의 각이므로  \( 2n\pi + \pi < \theta < 2n\pi + \frac{3}{2}\pi \)`

### `삼각함수성질2단계/044.webp`
- **P3(REVIEW)**: `인 \( \theta \)에 대하여 \( \cos\theta = -\frac{2}{3} \)일 때, \( \sin\theta \)의 값은? ①  \sqrt{5} \frac{1}{3} \frac{1}{3} \sqrt{`
- **P5(REVIEW)**: `-\frac{` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: -\frac{
- **P5(REVIEW)**: `}{3} \ ② -` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲{3} \ ② -
- **P5(REVIEW)**: ` \ ④ \frac{` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input:  \ ④ \frac{
- **P5(REVIEW)**: `}{3} \ ⑤ \frac{` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲{3} \ ⑤ \frac{
- **P5(REVIEW)**: `}{3}` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲{3}

### `삼각함수성질2단계/045.webp`
- **P3(REVIEW)**: `인  에 대하여  일 때,  의 값은? ①  \sqrt{3} \sqrt{3} \sqrt{3} \sqrt{3}`
- **P5(REVIEW)**: `-\frac{` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: -\frac{
- **P5(REVIEW)**: `}{2} \quad ② -\frac{` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲{2} \quad ② -\f…
- **P5(REVIEW)**: `}{4} \quad ③ 0 \quad ④ \frac{` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲{4} \quad ③ 0 \…
- **P5(REVIEW)**: `}{4} \quad ⑤ \frac{` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲{4} \quad ⑤ \fr…
- **P5(REVIEW)**: `}{2}` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲{2}

### `삼각함수성질2단계/044a.webp`
- **P3(REVIEW)**: `삼각함수 사이의 관계 이해하기\n\n \sin^2\theta + \text{cos}^2\theta = 1, \cos\theta = -\frac{2}{3}  이므로\n\n \sin^2\theta = 1 - \cos^2`
- **P5(REVIEW)**: ` 이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n이때 
- **P5(REVIEW)**: ` 이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲\n

### `삼각함수성질2단계/045a.webp`
- **P3(REVIEW)**: `삼각함수의 성질을 이용하여 삼각함수의 값을 구할 수 있는가?  \sin^2 \theta + \text{cos}^2 \theta = 1 이고,  \frac{\pi}{2} < \theta < \pi  이므로  \text`

### `삼각함수성질2단계/046.webp`
- **P3(REVIEW)**: `0 < \theta < \pi\, \theta\, \text{에 대하여}   +   = 2\, \text{일 때,} \sin\theta\, \text{의 값은?} ①  \sqrt{2} \sqrt{2} \sqrt{2}`
- **P5(REVIEW)**: `-\frac{` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: -\frac{
- **P5(REVIEW)**: `}{2} \quad ② -\frac{` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲{2} \quad ② -\f…
- **P5(REVIEW)**: `}{4} \quad ③ \frac{` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲{4} \quad ③ \fr…
- **P5(REVIEW)**: `}{4} \quad ④ ` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲{4} \quad ④ 
- **P5(REVIEW)**: ` \quad ⑤ \frac{` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input:  \quad ⑤ \frac{
- **P5(REVIEW)**: `}{2}` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲{2}

### `삼각함수성질2단계/042a.webp`
- **P5(REVIEW)**: `\( \frac{\cos \theta}{1 - \sin \theta} - \frac{\sin \theta}{\cos \theta} = \frac` — KaTeX parse error: Can't use function '\(' in math mode at position 1: \̲(̲ \frac{\cos \th…

### `삼각함수성질2단계/048.webp`
- **P5(REVIEW)**: `일 때, \(\sin\theta - \cos\theta\)의 값은? ① ` — KaTeX parse error: Can't use function '\(' in math mode at position 6: 일 때, \̲(̲\sin\theta - \c…

### `삼각함수성질2단계/046a.webp`
- **P3(REVIEW)**: `해설  ,  이므로  \frac{\sin \theta \cos \theta}{1 + \cos \theta} + \frac{1 + \cos \theta}{\tan \theta} = 2   \frac{\sin^2 \th`

### `삼각함수성질2단계/049a.webp`
- **P3(REVIEW)**: `에서  \frac{\cos\theta(1+\cos\theta) - \cos\theta(1-\cos\theta)}{(1-\cos\theta)(1+\cos\theta)} = 8   \therefore \frac{2\co`

### `삼각함수성질2단계/048a.webp`
- **P3(REVIEW)**: `정답 ④  \frac{\sin\theta\cos\theta}{1-\sin\theta} + (1-\sin\theta)\tan\theta \frac{2\sin\theta}{\cos\theta} = 6 \sin\theta`
- **P5(REVIEW)**: ` \[= \frac{\sin\theta\cos\theta}{1-\sin\theta} + \frac{(1-\sin\theta)\sin\theta}` — KaTeX parse error: Undefined control sequence: \[ at position 2:  \̲[̲= \frac{\sin\th…
- **P5(REVIEW)**: ` \[10\cos^2\theta = 1, \cos^2\theta = \frac{1}{10}\] 이때 ` — KaTeX parse error: Undefined control sequence: \[ at position 2:  \̲[̲10\cos^2\theta …
- **P5(REVIEW)**: ` \[\therefore \sin\theta - \cos\theta = \frac{\sqrt{10}}{5}\]` — KaTeX parse error: Undefined control sequence: \[ at position 2:  \̲[̲\therefore \sin…

### `삼각함수성질2단계/050a.webp`
- **P3(REVIEW)**: `정답    \n\n해설   의 양변을 제곱하면  \n \sin^2\theta + 2\sin\theta\cos\theta + \cos^2\theta = \frac{1}{9}   \n 1 + 2\sin\theta\cos`
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲

### `삼각함수성질2단계/052a.webp`
- **P3(REVIEW)**: `해설   의 양변을 제곱하면  \sin^2 \theta - 2 \sin \theta \cos \theta + \cos^2 \theta = \frac{1}{9}   1 - 2 \sin \theta \cos \theta`

### `삼각함수성질2단계/051a.webp`
- **P3(REVIEW)**: `해설   의 양변을 제곱하면  \sin^2\theta - 2\sin\theta \cos\theta + \cos^2\theta = \frac{7}{16}   1 - 2\sin\theta \cos\theta = \fra`

### `삼각함수성질2단계/053a.webp`
- **P3(REVIEW)**: `해설   \n\n = 1 - 2 \cdot \left(-\frac{1}{4}\right)  \n\n = \frac{3}{2}  \n\n이때  이므로  ,   \n\n따라서  이므로 \n\n sin\theta - co`
- **P5(REVIEW)**: `(\nsin\theta - \ncos\theta)^2 = sin^2\theta - 2sin\theta cos\theta + cos^2\theta` — KaTeX parse error: Undefined control sequence: \nsin at position 2: (\̲n̲s̲i̲n̲\theta - \ncos\…
- **P5(REVIEW)**: ` \n\n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n
- **P5(REVIEW)**: ` \n\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n이때 
- **P5(REVIEW)**: ` \n\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n따라서 
- **P5(REVIEW)**: `이므로 \n\n` — KaTeX parse error: Undefined control sequence: \n at position 5: 이므로 \̲n̲\n

### `삼각함수성질2단계/057a.webp`
- **P3(REVIEW)**: `이차방정식  에서 근과 계수의 관계에 의하여\n\n \sin\theta + \cos\theta = \frac{\sqrt{3}}{2} \quad \cdots \bigcirc_1 \n\n \sin\theta \cos\t`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `의 양변을 제곱하면\n\n` — KaTeX parse error: Undefined control sequence: \n at position 11: 의 양변을 제곱하면\̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `에서\n\n` — KaTeX parse error: Undefined control sequence: \n at position 3: 에서\̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 이차방정식 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 이차방정식 
- **P5(REVIEW)**: ` 이므로 근과 계수의 관계에 의하여\n\n` — KaTeX parse error: Undefined control sequence: \n at position 20: … 근과 계수의 관계에 의하여\̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `삼각함수그래프2단계/005.webp`
- **P5(REVIEW)**: `\n\n① ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n① 
- **P5(REVIEW)**: `\n② ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲② 
- **P5(REVIEW)**: `\n③ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲③ 
- **P5(REVIEW)**: `\n④ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲④ 
- **P5(REVIEW)**: `\n⑤ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲⑤ 

### `삼각함수그래프2단계/004a.webp`
- **P3(REVIEW)**: `해설   에서  의 값이 증가하면  의 값도 증가한다. 이때,   이므로    \frac{\pi}{2} < x < \pi  에서  의 값이 증가하면  의 값은 감소한다. 이때,   이므로   또,   이므로    \`

### `삼각함수그래프2단계/002a.webp`
- **P3(REVIEW)**: `정답   해설 조건 (가)에서   이므로  에   을 대입하면    \therefore f\left(\frac{43}{6}\right) = f\left(\frac{37}{6}\right) = f\left(\frac{`

### `삼각함수그래프2단계/014a.webp`
- **P3(REVIEW)**: `해설 ②  y = \tan 3x + 3 \frac{\pi}{3}`

### `삼각함수그래프2단계/013a.webp`
- **P3(REVIEW)**: `각 함수의 주기를 구해 보면 다음과 같다. ①   의 주기는  \frac{2\pi}{\frac{1}{2}} = 4\pi  ②   의 주기는   ③   의 주기는   ④   의 주기는   ⑤   의 주기는   따라서 `

### `삼각함수그래프2단계/014.webp`
- **P3(REVIEW)**: `함수  의 그래프에 대한 설명으로 옳지 않은 것은?\n\n①  \tan 3x y \frac{2\pi}{3} x = \frac{n}{3}\pi + \frac{\pi}{6} n`
- **P5(REVIEW)**: `축의 방향으로 3만큼 평행이동한 것이다.\n② 주기는 ` — KaTeX parse error: Undefined control sequence: \n at position 23: … 3만큼 평행이동한 것이다.\̲n̲② 주기는 
- **P5(REVIEW)**: `이다.\n③ 점근선은 직선 ` — KaTeX parse error: Undefined control sequence: \n at position 4: 이다.\̲n̲③ 점근선은 직선 
- **P5(REVIEW)**: `은 정수)이다.\n④ 치역은 실수 전체의 집합이다.\n⑤ 최댓값과 최솟값이 존재하지 않는다.` — KaTeX parse error: Undefined control sequence: \n at position 9: 은 정수)이다.\̲n̲④ 치역은 실수 전체의 집합…

### `삼각함수그래프2단계/015a.webp`
- **P3(REVIEW)**: `모든 실수에 대하여  를 만족시키는 함수  의 주기는   ( 은 자연수)이다. ㄱ. 함수  의 주기는  \frac{\pi}{|-2|} = \frac{\pi}{2}  ㄴ. 함수  의 주기는  \frac{2\pi}{4}`

### `삼각함수그래프2단계/016a.webp`
- **P3(REVIEW)**: `함수  의 최댓값이 0, 최솟값이 -4이고  이므로  ,   두 식을 연립하여 풀면  ,   또 주기가  이고  이므로  \frac{2\pi}{b} = \frac{1}{3} \pi \therefore b = 6  따`

### `삼각함수그래프2단계/018a.webp`
- **P3(REVIEW)**: `해설   함수  의 주기가  이므로  \frac{2\pi}{b} = \pi, \ b = 2  ∴    이므로   따라서 함수  의 최댓값은`
- **P5(REVIEW)**: `\text{π}` — KaTeX parse error: Expected 'EOF', got '' at position 1: ̲\text{π}

### `삼각함수그래프2단계/020a.webp`
- **P3(REVIEW)**: `주어진 삼각함수  의 최댓값이 2, 최솟값이 -4이므로  a + c = 2, \ -a + c = -4 에서  a = 3, \ c = -1  한편, 주어진 그래프에서 삼각함수의 주기가  \frac{5}{4}\pi - `

### `삼각함수그래프2단계/019a.webp`
- **P3(REVIEW)**: `모든 실수  에 대하여  를 만족시키는 양수  의 최소값이  이므로 함수  의 주기는  이다.  b > 0 이므로  \frac{2\pi}{b} = 6\pi   \therefore b = \frac{1}{3}  또한,`

### `삼각함수그래프2단계/022a.webp`
- **P3(REVIEW)**: `주어진 그래프에서  이고  이므로  이다. 또한, 주어진 그래프는  마다 같은 모양이 반복되므로 주기는  이다. 그러므로  \frac{2\pi}{|b|} = 4\pi 에서  이고,  이므로  이다. 따라서  이다.`

### `삼각함수그래프2단계/024a.webp`
- **P3(REVIEW)**: `주어진 함수의 최댓값이 2, 최솟값이 -4이고  이므로   위의 두 식을 연립하여 풀면   ∴   따라서 주기는  \frac{2\pi}{\frac{\pi}{3}} = 6 이고, 그래프에서 주기는  이므로   ∴`

### `삼각함수그래프2단계/026.webp`
- **P5(REVIEW)**: `2\n② ` — KaTeX parse error: Undefined control sequence: \n at position 2: 2\̲n̲② 
- **P5(REVIEW)**: `\n③ 3\n④ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲③ 3\n④ 
- **P5(REVIEW)**: `\n⑤ 6` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲⑤ 6

### `삼각함수그래프2단계/026a.webp`
- **P3(REVIEW)**: `함수  의 주기는  \frac{2\pi}{\frac{\pi}{3}} = 6 이므로 함수  의 그래프는 다음과 같다. 위 그림과 같이 일반성을 잃지 않고  라 하면  \alpha_1 + \alpha_2 = 6  주어진`

### `삼각함수그래프2단계/028a.webp`
- **P3(REVIEW)**: `해설  의 주기는 4이다. 그래프에서  이고,  이 된다.  f(\alpha + \beta + \gamma) = f(6 + \gamma) = f(2 + \gamma)   = \sin \frac{\pi}{2} (2 +`

### `삼각함수그래프2단계/025a.webp`
- **P3(REVIEW)**: `해설  에서 주기가  \pi - \left( -\frac{\pi}{3} \right) = \frac{2}{3} \pi 이고  이므로  \frac{\pi}{b} = \frac{2}{3} \pi \therefore b `

### `삼각함수그래프2단계/029a.webp`
- **P3(REVIEW)**: `CD가  축에 평행하고 함수  의 그래프는  축에 대하여 대칭이므로 사각형  는 등변사다리꼴이다. 함수  의 주기는  \frac{2\pi}{\frac{\pi}{6}} = 12 이므로  \overline{OA} = \`

### `삼각함수그래프2단계/030a.webp`
- **P3(REVIEW)**: `해설  의 그래프와  축 및 직선  로 둘러싸인 부분의 넓이는  에서  까지 부분의 넓이가  에서  까지의 넓이가 같으므로 구하는 넓이는 직사각형의 넓이이다. 즉,  \left( \frac{3}{2}\pi - \fr`

### `삼각함수그래프2단계/034.webp`
- **P3(REVIEW)**: `함수   에 대한 설명 중 옳은 것은? ①  2\pi x x = n\pi + \frac{\pi}{2} n`

### `삼각함수그래프2단계/031a.webp`
- **P1(AUTO)** line 0: `두 점 A, B는 직선 $x = \frac{\pi}{4}$에 대하여 대칭이므로 $$\frac{\alpha + \beta}{2} = \frac{\pi}{4} \therefore \alpha + \beta = \frac`
- **P3(REVIEW)**: `두 점 A, B는 직선  에 대하여 대칭이므로  \frac{\alpha + \beta}{2} = \frac{\pi}{4} \therefore \alpha + \beta = \frac{\pi}{2} \cdots \te`
- **P5(REVIEW)**: `\frac{\alpha + \beta}{2} = \frac{\pi}{4} \therefore \alpha + \beta = \frac{\pi}{` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: …\cdots \text{① 

### `삼각함수그래프2단계/034a.webp`
- **P3(REVIEW)**: `해설  의 그래프는  의 그래프에서  인 부분만 그리고  인 부분을  축에 대하여 대칭이동한 것이므로 다음 그림과 같다. ①  y x = n\pi + \frac{\pi}{2} n x \neq n\pi + \frac{`

### `삼각함수그래프2단계/038a.webp`
- **P3(REVIEW)**: `해설 (주어진 식) = (-\u0000sin \u0000\theta)^2 + \u0000cos^2 \u0000\theta + \u0000cos^2 \u0000\theta + \u0000sin^2 \u0000\thet`

### `삼각함수그래프2단계/039.webp`
- **P3(REVIEW)**: `cos(\pi + \theta) + \sin(\pi - \theta) =   일 때, \sin \theta \cos \theta의 값은? ①   ②   ③   ④   ⑤`

### `삼각함수그래프2단계/032a.webp`
- **P3(REVIEW)**: `해설   라 하면  f(x) = \begin{cases} 0 & (\cos 2\pi x \geq 0) \\ \cos 2\pi x & (\cos 2\pi x < 0) \end{cases}  이고, 직선   은  의 값`

### `삼각함수그래프2단계/041.webp`
- **P3(REVIEW)**: `직선  이  축의 양의 방향과 이루는 각의 크기를  라 할 때, 다음 값을 구하시오.  3\cos(\pi - \theta) + 3\sin\left(\frac{\pi}{2} - \theta\right) - 2\tan(`

### `삼각함수그래프2단계/039a.webp`
- **P3(REVIEW)**: `해설   \n\n  \n\n (\cos\theta - \sin\theta)^2 = \cos^2\theta - 2\cos\theta\sin\theta + \sin^2\theta  \n\n = 1 - 2\sin\thet`
- **P5(REVIEW)**: ` \n\n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n
- **P5(REVIEW)**: ` \n\n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n
- **P5(REVIEW)**: ` \n\n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n

### `삼각함수그래프2단계/035a.webp`
- **P3(REVIEW)**: `함수  의 그래프의 개형은 다음과 같다. 함수  의 그래프가 직선  과 만나는 서로 다른 점의 개수는  0 < k_0 < \frac{1}{3}  일 때 16,   일 때 12,  \frac{1}{3} < k_0 < `

### `삼각함수그래프2단계/041a.webp`
- **P3(REVIEW)**: `직선  의 기울기는   이므로  \n\n ,  ,\n\n \n\n따라서 주어진 식을 정리하면\n\n 3\cos(\pi - \theta) + 3\sin\left(\frac{\pi}{2} - \theta\right) -`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `삼각함수그래프2단계/044.webp`
- **P3(REVIEW)**: `원  에 내접하는 정84각형의 각 꼭짓점의 좌표를  라 할 때,  a_1^2 + a_2^2 + a_3^2 + \cdots + a_{84}^2 의 값을 구하시오.`

### `삼각함수그래프2단계/042a.webp`
- **P3(REVIEW)**: `해설         (주어진 식)  = \left( \cos^2 \frac{\pi}{16} + \cos^2 \frac{7}{16} \pi \right) + \left( \cos^2 \frac{3}{16} \pi + `

### `삼각함수그래프2단계/040a.webp`
- **P3(REVIEW)**: `해설  \cos \frac{13}{6} \pi \cos \frac{11}{6} \pi + \sin \left(-\frac{\pi}{4}\right) \sin \frac{11}{4} \pi + \tan \frac{13`

### `삼각함수그래프2단계/043a.webp`
- **P3(REVIEW)**: `정답 ②  \cos(90^\circ - \alpha^\circ) = \sin \alpha^\circ     \cos^2 3^\circ + \cos^2 6^\circ + \cos^2 9^\circ + \cdots + `
- **P5(REVIEW)**: `\n\n해설 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n해설 
- **P5(REVIEW)**: ` 이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n∴ 
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 

### `삼각함수그래프2단계/046.webp`
- **P5(REVIEW)**: ` \n ②. ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲ ̲②. 
- **P5(REVIEW)**: ` \n ③. ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲ ̲③. 
- **P5(REVIEW)**: ` \n ④. ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲ ̲④. 
- **P5(REVIEW)**: ` \n \n ① ㄱ, ㄷ \n ② ㄴ, ㄷ \n ③ ㄷ, ㄹ \n ④ ㄱ, ㄴ, ㄹ \n ⑤ ㄱ, ㄷ, ㄹ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲ ̲\n ① ㄱ, ㄷ \n ② …

### `삼각함수그래프2단계/046a.webp`
- **P3(REVIEW)**: `해설   이므로 ㄱ.   (참) ㄴ.   (거짓) ㄷ.    = \cos \frac{C}{2}  (참) ㄹ.    = \tan \frac{B}{2} \tan \left( \frac{\pi}{2} - \frac{B}{`

### `삼각함수그래프2단계/049a.webp`
- **P3(REVIEW)**: `해설  의 주기는  이고,  의 주기는  이므로  \frac{\pi}{|a|} = \frac{\pi}{2}, \; |a| = 2  ∴   (∵  )`

### `삼각함수그래프2단계/045a.webp`
- **P3(REVIEW)**: `해설\n 16\theta = 2\pi 에서  8\theta = \pi 이므로\n①  \sin90 = \sin(8\theta + 0) = \sin(\pi + \theta) = -\sin\theta \n\(\theref`
- **P5(REVIEW)**: `이므로\n① ` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲① 
- **P5(REVIEW)**: `\n\(\therefore \sin90 + \sin\theta = 0\)\n② ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\(\therefore \s…
- **P5(REVIEW)**: `\n\(\sin\theta \neq 0\)이므로\n\(\sin(-8\theta) + \sin\theta = 0 + \sin\theta \neq ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\(\sin\theta \n…
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n\(\therefore \cos5\theta = \cos11\theta\)\n④ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\(\therefore \c…
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲

### `삼각함수그래프2단계/048a.webp`
- **P3(REVIEW)**: `해설  이므로   을 대입하면  \sin^2 \alpha + \left(-\frac{1}{2}\right)^2 = 1   \therefore \sin \alpha = \frac{\sqrt{3}}{2} \;(\beca`

### `삼각함수그래프2단계/052.webp`
- **P3(REVIEW)**: `함수  의 치역이  일 때,  의 값을 구하시오. \( \text{단, } 0 \leq x \leq \frac{\pi}{4} \)`

### `삼각함수그래프2단계/053.webp`
- **P3(REVIEW)**: `함수  의 최댓값과 최솟값을 각각  ,  이라 할 때,  의 값을 구하시오.  \left( \text{단, } \pi \leq x \leq \frac{4}{3}\pi \right)`

### `삼각함수그래프2단계/053a.webp`
- **P3(REVIEW)**: `해설   에서  로 놓으면  \pi \leq x \leq \frac{4}{3}\pi  에서   이고 주어진 함수는  y = \frac{2t}{t-1} = \frac{2}{t-1} + 2  따라서 다음 그림에서  일 `

### `삼각함수그래프2단계/054a.webp`
- **P3(REVIEW)**: `해설\n y = \frac{2\cos\left(\frac{3}{2}\pi - x\right) - a + 3}{\sin(\pi + x) + 2} \n = \frac{-2\sin x - a + 3}{-\sin x + 2`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲이때 
- **P5(REVIEW)**: ` 이고\n` — KaTeX parse error: Undefined control sequence: \n at position 4:  이고\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n따라서 함수 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 함수 
- **P5(REVIEW)**: ` 은\n` — KaTeX parse error: Undefined control sequence: \n at position 3:  은\̲n̲
- **P5(REVIEW)**: ` 이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲
- **P5(REVIEW)**: `\n또한, ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲또한, 
- **P5(REVIEW)**: ` 일 때 최소값을 가지므로\n` — KaTeX parse error: Undefined control sequence: \n at position 15:  일 때 최소값을 가지므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲

### `삼각함수그래프2단계/057a.webp`
- **P3(REVIEW)**: `해설   \[= 1 - \sin^2 x + 2a \sin x - 1\] \[= - \sin^2 x + 2a \sin x\] 이때  로 놓으면  에서`

### `삼각함수그래프2단계/056a.webp`
- **P3(REVIEW)**: `해설   이므로  f(x) = \cos^2 x + \frac{2}{3} \cos \left( x + \frac{\pi}{2} \right)   = 1 - \sin^2 x - \frac{2}{3} \sin x   = `

### `삼각함수그래프2단계/061.webp`
- **P3(REVIEW)**: `0 \\leq x < \pi일 때, 방정식  의 모든 근의 합은? ①   ②   ③   ④   ⑤`

### `삼각함수그래프2단계/063a.webp`
- **P3(REVIEW)**: `해설  에서  \log\left(\frac{\sin\theta}{\cos\theta}\right) = \log\frac{1}{\sqrt{3}}   \tan\theta = \frac{1}{\sqrt{3}} \there`

### `삼각함수그래프2단계/059a.webp`
- **P3(REVIEW)**: `해설 \( \cos^2 \left( x + \frac{\pi}{2} \right) = (-\sin x)^2 = \sin^2 x, \) \( \cos(x + 3\pi) = -\cos x \) 이므로 \( y = 2\c`
- **P5(REVIEW)**: `이때 ①의 그래프는 점 \( \left( -\frac{1}{4}, \frac{17}{8} \right) \)이 꼭짓점이고 위로 볼록한 이차함수의` — KaTeX parse error: Can't use function '\(' in math mode at position 14: 이때 ①의 그래프는 점 \̲(̲ \left( -\frac{…

### `삼각함수그래프2단계/064.webp`
- **P3(REVIEW)**: `0 \leq \theta \leq 2\pi 에서 방정식    = \sin\left(\frac{3}{2}\pi - \theta\right) + \sin(2\pi + \theta)  를 만족시키는 모든  의 값의 합은?`

### `삼각함수그래프2단계/066.webp`
- **P3(REVIEW)**: `0 \leq \theta \leq 2\pi 에서 방정식    = \sin\left(\frac{3}{2}\pi - \theta\right) - \sin(2\pi + \theta)  를 만족시키는 모든  의 값의 합은?`

### `삼각함수그래프2단계/068.webp`
- **P3(REVIEW)**: `0 \leq x < 3\pi 에서 방정식  의 서로 다른 네 실근을 작은 것부터 차례대로  라 할 때,  의 값은? ①   ②   ③   ④   ⑤`

### `삼각함수그래프2단계/065a.webp`
- **P3(REVIEW)**: `해설  로 놓으면  에서  에서  의 그래프와 직선  은 다음 그림과 같다. 따라서 방정식  의 근은  t = \frac{\pi}{3} \text{ 또는 } t = \frac{2}{3}\pi \text{ 또는 } t`

### `삼각함수그래프2단계/066a.webp`
- **P3(REVIEW)**: `해설    \sin\left(\frac{3\pi}{2} - \theta\right) = -\cos\theta, \sin(2\pi + \theta) = \sin\theta  이므로 주어진 방정식은  \cos\theta`

### `삼각함수그래프2단계/072.webp`
- **P3(REVIEW)**: `0 \leq x < 2\pi일 때, \tan x +   = 2 의 모든 실근의 합은? ①   ② \pi ③  \pi ④  \pi ⑤ 3\pi`

### `삼각함수그래프2단계/073.webp`
- **P3(REVIEW)**: `0 \leq x < 2\pi 에서 방정식  의 모든 실근의 합은? ①   ②   ③   ④   ⑤`

### `삼각함수그래프2단계/071a.webp`
- **P3(REVIEW)**: `해설 \(2|\cos x| = \sqrt{3},\ 즉\ |\cos x| = \frac{\sqrt{3}}{2}\) 에서 \(\cos x = \pm \frac{\sqrt{3}}{2}\) 다음의 그림에서 함수 \(y = `

### `삼각함수그래프2단계/076.webp`
- **P3(REVIEW)**: `0 \leq x \leq 2\pi일 때, 방정식  의 서로 다른 실근의 개수를 구하시오.`

### `삼각함수그래프2단계/075a.webp`
- **P3(REVIEW)**: `방정식   의 두 근이  ,  이므로 함수  의 그래프와 직선   의 교점의  좌표는  ,  이다. 다음 그림에서 함수  의 그래프의 대칭성에 의하여  \frac{\alpha + \beta}{2} = \pi  이므로`

### `삼각함수그래프2단계/073a.webp`
- **P3(REVIEW)**: `해설  에서   또는    에서 곡선  와 직선  의 교점의  좌표를  라 하면  \frac{a+b}{2} = \frac{\pi}{2}  이므로  이다. 또  에서 곡선  와 직선  의 교점의  좌표를  라 하면  `

### `삼각함수그래프2단계/079.webp`
- **P3(REVIEW)**: `0 \leq x \leq 2\pi일 때, 방정식  의 서로 다른 실근의 개수가 3이다. 이 세 실근 중 가장 큰 실근을  라 할 때,  의 값은? (단,  는 상수이다.) ①   ②   ③   ④   ⑤`

### `삼각함수그래프2단계/080.webp`
- **P3(REVIEW)**: `0 \leq x < \pi에서 부등식  의 해가  일 때,  의 값은? ①  \frac{\pi}{4} \frac{\pi}{2}`

### `삼각함수그래프2단계/080a.webp`
- **P3(REVIEW)**: `부등식  의 해는  의 그래프가  의 그래프보다 아래쪽에 있는  의 값의 범위이므로 다음 그림에서   따라서  ,   이므로  \alpha + \beta = 0 + \frac{\pi}{4} = \frac{\pi}{4`

### `삼각함수그래프2단계/078.webp`
- **P3(REVIEW)**: `0 \leq t \leq   \text{인 실수 } t \text{와 상수 } k \text{에 대하여} \ t \leq x \leq t +   \text{에서 방정식 } \sin   x = k \text{의 모든 `

### `삼각함수그래프2단계/081.webp`
- **P3(REVIEW)**: `전체집합  의 두 부분집합  A = \left\{ x \mid \cos x > -\frac{\sqrt{3}}{2} \right\}, \ B = \left\{ x \mid \tan x < \frac{\sqrt{3}}{`

### `삼각함수그래프2단계/077a.webp`
- **P3(REVIEW)**: `에 대한 이차방정식  의 판별식을  라 하면 이 이차방정식이 중근을 가지므로  \frac{D}{4} = (-2\sin\theta)^2 - (4\sin\theta + 3) = 0 에서  4\sin^2\theta + 4`

### `삼각함수그래프2단계/081a.webp`
- **P3(REVIEW)**: `다음 그림에서\n A = \left\{ x \mid 0 \leq x < \frac{5}{6}\pi \text{ 또는 } \frac{7}{6}\pi < x < 2\pi \right\} \n B = \left\{ x \`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n따라서 집합 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 집합 

### `삼각함수그래프2단계/083.webp`
- **P3(REVIEW)**: `0 < x < 2\pi일 때, 다음 중 부등식  의 해가 될 수 없는 것은? ①   ②   ③  \pi ④  \pi ⑤  \pi`

### `삼각함수그래프2단계/082a.webp`
- **P3(REVIEW)**: `교류전압  가   이상이면서   인 범위의  는  300\sin 120\pi t \geq 150\sqrt{3}, \ 즉 \ \sin 120\pi t \geq \frac{\sqrt{3}}{2}  을 만족한다. 이때 삼`

### `삼각함수그래프2단계/084.webp`
- **P3(REVIEW)**: `0 < x \leq 2\pi 일 때, 방정식  와 부등식  를 동시에 만족시키는 모든  의 값의 합은? ①   ②   ③   ④   ⑤`

### `삼각함수그래프2단계/085.webp`
- **P3(REVIEW)**: `0 \leq x < 2\pi에서 부등식  의 해가  일 때,  의 값은? ①   ②   ③   ④   ⑤`

### `삼각함수그래프2단계/086.webp`
- **P3(REVIEW)**: `0 \leq x < 2\pi 일 때, 부등식 2\cos^2 x + \sin x \geq 1의 해는? ①  \frac{\pi}{6} \frac{7}{6} \frac{\pi}{6} \frac{5}{6} \frac{5}{`

### `삼각함수그래프2단계/085a.webp`
- **P3(REVIEW)**: `부등식  의 해는  의 그래프가  의 그래프보다 위쪽에 있는  의 값의 범위이므로 다음 그림에서  \frac{\pi}{4} < x < \frac{5}{4}\pi  따라서  이므로  \alpha + \beta = \f`

### `삼각함수그래프2단계/087.webp`
- **P3(REVIEW)**: `부등식   의 해의 집합을  라 할 때, 다음 중 집합  의 원소가 아닌 것은? (단, 0 \leq x < \pi) ①   ②   ③   ④  \pi ⑤  \pi`

### `삼각함수그래프2단계/089.webp`
- **P3(REVIEW)**: `다음 중 모든 실수  에 대하여 부등식  x^2 + 8x \, \sin \theta + 16 \sin \theta > 0 이 성립하도록 하는  의 값이 아닌 것은? (단,  ) ①   ②   ③   ④   ⑤`

### `삼각함수그래프2단계/089a.webp`
- **P3(REVIEW)**: `모든 실수  에 대하여 주어진 부등식이 성립해야 하므로 이차방정식  의 판별식을  라 하면  \frac{D}{4} = 16 \sin^2 \theta - 16 \sin \theta < 0   \sin \theta (\`

### `삼각함수그래프2단계/087a.webp`
- **P3(REVIEW)**: `해설   에서     로 놓으면  t^2 + (\sqrt{3} - 1)t - \sqrt{3} < 0   (t + \sqrt{3})(t - 1) < 0     \pi,       A = \left\{ x \mid 0 `

### `삼각함수그래프2단계/092a.webp`
- **P3(REVIEW)**: `해설  \n   \n   \n   \n이므로 포물선의 꼭짓점의 좌표는    \n이 꼭짓점이 직선   위에 있으므로  \n   \n∴   또는   (∵  )  \n따라서 구하는 합은  \n \frac{\pi}{3} +`

### `삼각함수그래프2단계/093a.webp`
- **P1(AUTO)** line 0: `직선 $y = 4x + 3$과 포물선 $y = x^2 - (2\sin\theta)x + 7\text{cos}^2\theta$가 만나지 않으려면 $4x + 3 = x^2 - (2\sin\theta)x + 7\text{`
- **P3(REVIEW)**: `직선  과 포물선  가 만나지 않으려면  에서  에 대한 이차방정식  의 실근이 존재하지 않아야 한다. 이 이차방정식의 판별식을  라 하면  이어야 한다.  \frac{D}{4} = (2 + \sin\theta)^2`
- **P5(REVIEW)**: `\therefore -\frac{1}{2} < \sin\theta < 0 \quad \cdots \quad \text{① ` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: … \quad \text{① 

### `삼각함수그래프2단계/090a.webp`
- **P3(REVIEW)**: `해설  에 대한 이차방정식  이 서로 다른 부호의 실근을 가지려면 두 근의 곱이 음수이어야 하므로 근과 계수의 관계에 의하여  2\sin^2\theta - 2\text{cos}^2\theta < 0   (2 - 2\`

### `삼각함수그래프2단계/091a.webp`
- **P3(REVIEW)**: `두 점  ,  의 시각  에서의  를  ,  라 하면 두 점  ,  는 매초  ,  의 속력으로 각각 움직이므로  f(t) = \sin \left( \frac{5}{6}\pi t \right), \quad g(t) `

### `지수3단계/006.webp`
- **P5(REVIEW)**: `f(n) = 2\sqrt[n+2] - \sqrt[n]` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: …n+2] - \sqrt[n]

### `지수3단계/003.webp`
- **P3(REVIEW)**: `[x]는 x보다 크지 않은 최대의 정수일 때,  \left\lfloor \sqrt{144} \right\rfloor + \left\lfloor \sqrt[3]{144} \right\rfloor + \left\lflo`

### `지수3단계/009.webp`
- **P3(REVIEW)**: `자연수  에 대하여 두 수  \sqrt[6]\frac{5^{n-1}}{2^m}, \sqrt[8]\frac{4^{n+1}}{3^{m-2}}  이 모두 유리수일 때,  의 최소값은? ① 17 ② 25 ③ 33 ④ 41 `
- **P5(REVIEW)**: `\sqrt[6]\frac{5^{n-1}}{2^m}, \sqrt[8]\frac{4^{n+1}}{3^{m-2}}` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at position 9: \sqrt[6]\̲f̲r̲a̲c̲{5^{n-1}}{2^m},…

### `지수3단계/008.webp`
- **P3(REVIEW)**: `두 자연수  에 대하여  인  \sqrt[3]{n^m}  이 자연수가 되도록 하는 순서쌍  의 개수를 구하시오.`

### `지수3단계/015.webp`
- **P5(REVIEW)**: `3^{` — KaTeX parse error: Expected '}', got 'EOF' at end of input: 3^{
- **P5(REVIEW)**: `} ② 3^{` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲ ② 3^{
- **P5(REVIEW)**: `} ③ 3^{` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲ ③ 3^{
- **P5(REVIEW)**: `} ④ 3^{` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲ ④ 3^{
- **P5(REVIEW)**: `} ⑤ 3` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲ ⑤ 3

### `지수3단계/017.webp`
- **P3(REVIEW)**: `양수  와 실수  에 대하여  \frac{a^{3x} - a^{-3x}}{a^x - a^{-x}} + \frac{a^{3x} + a^{-3x}}{a^x + a^{-x}} = 16  일 때,  의 값은? (단,  ) `

### `지수3단계/016a.webp`
- **P3(REVIEW)**: `지수법칙을 이용하여 식의 값 구하기\n\n x^2 + 4 = 2^{\frac{1}{4} + 2 + 2 - \frac{1}{4}} = \bigg(2^{\frac{1}{8} + 2 - \frac{1}{8}}\bigg)^`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\therefore \sqrt{x^2 + 4} = 2^{\frac{1}{8} + 2} = \root 8 \root 2 + \frac{1}{\ro` — KaTeX parse error: Undefined control sequence: \root at position 51: …c{1}{8} + 2} = \̲r̲o̲o̲t̲ ̲8 \root 2 + \fr…

### `지수3단계/018.webp`
- **P3(REVIEW)**: `실수  가  \frac{2^a + 2^{-a}}{2^a - 2^{-a}} = -2 를 만족시킬 때,  의 값은? ①   ②   ③   ④   ⑤`

### `지수3단계/014a.webp`
- **P3(REVIEW)**: `해설   에서  \sqrt[5]{\frac{n}{2}}  이 자연수가 되려면  와  는 5의 배수이고,  p = 5k_1 + 1 (k_1 \text{은 음이 아닌 정수})  ①   p r     p q   p p =`

### `지수3단계/019.webp`
- **P3(REVIEW)**: `인 세 실수  에 대하여  3^a = 5^b = 15^c, \ (a-6)(b-6) = 36 일 때,  의 값을 구하시오.`

### `지수3단계/015a.webp`
- **P3(REVIEW)**: `해설 \(x = \sqrt[4]{3} - \frac{1}{\sqrt[4]{3}}\), 즉 \(x = 3^{\frac{1}{4}} - 3^{-\frac{1}{4}}\) 의 양변을 제곱하면\n\n\(x^2 = 3^{\f`

### `지수3단계/018a.webp`
- **P5(REVIEW)**: `\n\n해설\n\(\frac{2^a + 2^{-a}}{2^a - 2^{-a}} = -2\)에서\n\n분모, 분자에 \(2^a\)를 곱하면\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n해설\n\(\frac{2…
- **P5(REVIEW)**: `\n\n\(2^{2a} + 1 = -2 \cdot 2^{2a} + 2\)\n\n\(3 \cdot 2^{2a} = 1 \quad \therefor` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n\(2^{2a} + 1 …

### `지수3단계/017a.webp`
- **P3(REVIEW)**: `정답 ④  \frac{a^{3x} - a^{-3x}}{a^x - a^{-x}} + \frac{a^x + a^{-3x}}{a^x + a^{-x}} = \frac{(a^x - a^{-x})(a^{2x} + 1 + a^{`

### `지수3단계/019a.webp`
- **P3(REVIEW)**: `해설  로 놓으면  에서   \[ 3^a = k \text{에서 } 3 = \frac{1}{k^a} \quad \cdots \text{ ①  k \neq 1 (a-6)(b-6) = 36 ab \neq 0 ab`
- **P5(REVIEW)**: `} \] \[ 5^b = k \text{에서 } 5 = \frac{1}{k^b} \quad \cdots \text{ ②} \] \[ 15^c =` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲ \] \[ 5^b = k …
- **P5(REVIEW)**: `이므로 \[ \frac{1}{a} + \frac{1}{b} - \frac{1}{c} = 0 \quad \cdots \text{ ⑤} \] 이때 ` — KaTeX parse error: Undefined control sequence: \[ at position 5: 이므로 \̲[̲ \frac{1}{a} + …
- **P5(REVIEW)**: `에서 \[ ab - 6a - 6b + 36 = 36, \ ab - 6a - 6b = 0 \] ` — KaTeX parse error: Undefined control sequence: \[ at position 4: 에서 \̲[̲ ab - 6a - 6b +…
- **P5(REVIEW)**: `로 나누면 \[ 1 - \frac{6}{b} - \frac{6}{a} = 0, \ \frac{6}{b} + \frac{6}{a} = 1 \] \` — KaTeX parse error: Undefined control sequence: \[ at position 7: 로 나누면 \̲[̲ 1 - \frac{6}{b…

### `지수3단계/023a.webp`
- **P3(REVIEW)**: `한 원에서 길이가 같은 현에 대한 원주각의 크기는 같으므로   따라서  는  의 이등분선이므로  에서  \frac{AQ}{BQ} = \frac{AR}{BR}   = \frac{5 \sqrt[3]{4}}{12 \sqr`

### `지수3단계/024a.webp`
- **P3(REVIEW)**: `이차방정식  에서 근과 계수의 관계에 의하여   \[ \therefore \alpha^3 + \beta^3 = (\alpha + \beta)^3 - 3\alpha \beta (\alpha + \beta) \] \[ `

### `지수3단계/026a.webp`
- **P5(REVIEW)**: `a = \sqrt[4]\big{2\big} = 2^{\frac{1}{4}}, \ b = \sqrt[3]\big{8\big} = \sqrt[12]` — KaTeX parse error: Expected group as argument to '\big' at position 13: a = \sqrt[4]\̲b̲i̲g̲{2\big} = 2^{\f…

### `지수3단계/027.webp`
- **P3(REVIEW)**: `양수  에 대하여 다항식  이  로 나누어떨어질 때,  를  로 나누었을 때의 나머지는? ①  \sqrt{2} \sqrt{2}`

### `지수3단계/029.webp`
- **P3(REVIEW)**: `자연수  에 대하여  인  이 어떤 자연수의  제곱근이 되도록 하는  의 개수를  라 하자. 이때  \frac{2}{3^{-k}+1} + \cdots + \frac{2}{3^{-6}+1} + \frac{2}{3^{-`

### `지수3단계/028a.webp`
- **P3(REVIEW)**: `해설 \(a = -2, \ b = \sqrt{2}\)일 때  \n\(a★b = 2^{ab^2} = 2^{-2} \times (\sqrt{2})^2 = \frac{1}{4} \cdot 2 = \frac{1}{2}\) `

### `지수3단계/034.webp`
- **P3(REVIEW)**: `양수  와 실수  에 대하여  ,  ,  일 때,  \frac{1}{5^x} + \frac{2}{y} - \frac{4}{z}  을  를 이용하여 나타낸 것은? ①   ②   ③   ④   ⑤`

### `지수3단계/033.webp`
- **P3(REVIEW)**: `세 양수  와 2 이상의 세 자연수  에 대하여  \sqrt[p]\sqrt[a^2] = \sqrt[q]\sqrt[b^3] = \sqrt[r]\sqrt[c^6] = 27, \sqrt[3]\sqrt[abc] = 729 `
- **P5(REVIEW)**: `\sqrt[p]\sqrt[a^2] = \sqrt[q]\sqrt[b^3] = \sqrt[r]\sqrt[c^6] = 27, \sqrt[3]\sqrt` — KaTeX parse error: Expected group as argument to '\sqrt' at position 9: \sqrt[p]\̲s̲q̲r̲t̲[a^2] = \sqrt[q…

### `지수3단계/029a.webp`
- **P3(REVIEW)**: `이 자연수  의  제곱근이라 하면  \left(\sqrt[12]{3^9}\right)^n = 3^{\frac{9}{12}n} = 3^{\frac{3}{4}n} = N  따라서  이 자연수가 되려면  은 4의 배수이어`

### `지수3단계/039.webp`
- **P3(REVIEW)**: `해설 \[ \frac{1}{\sqrt{n+1} + \sqrt{n}} \] \[ = \frac{\sqrt{n+1} - \sqrt{n}}{(\sqrt{n+1} + \sqrt{n})(\sqrt{n+1} - \sqrt{n}`

### `지수3단계/040.webp`
- **P5(REVIEW)**: `f(1) = 2^{\frac{\root 3 \big{}} - 1}` — KaTeX parse error: Undefined control sequence: \root at position 17: …(1) = 2^{\frac{\̲r̲o̲o̲t̲ ̲3 \big{}} - 1}
- **P5(REVIEW)**: `f(3) = 2^{\frac{\root 5 \big{}} - \root 3 \big{}}` — KaTeX parse error: Undefined control sequence: \root at position 17: …(3) = 2^{\frac{\̲r̲o̲o̲t̲ ̲5 \big{}} - \ro…
- **P5(REVIEW)**: `f(5) = 2^{\frac{\root 7 \big{}} - \root 5 \big{}}` — KaTeX parse error: Undefined control sequence: \root at position 17: …(5) = 2^{\frac{\̲r̲o̲o̲t̲ ̲7 \big{}} - \ro…
- **P5(REVIEW)**: `f(119) = 2^{\frac{\root 121 \big{}} - \root 119 \big{}}` — KaTeX parse error: Undefined control sequence: \root at position 19: …19) = 2^{\frac{\̲r̲o̲o̲t̲ ̲121 \big{}} - \…
- **P5(REVIEW)**: `= 2^{(\root 3 \big{}} - 1) + (\root 5 \big{}} - \root 3 \big{}}) + \cdots + (\ro` — KaTeX parse error: Undefined control sequence: \root at position 7: = 2^{(\̲r̲o̲o̲t̲ ̲3 \big{}} - 1) …

### `지수3단계/041.webp`
- **P3(REVIEW)**: `조건 (가)에서   조건 (나)에서   조건 (다)에서   \[ c^3 = \left( b^{\frac{n}{3}} \right)^3 = \left( a^{\frac{m}{2}} \right)^n = a^{\frac`

### `지수3단계/043.webp`
- **P3(REVIEW)**: `이 유리수이려면  이 모두 6의 배수이어야 하고,  \sqrt[8]{\frac{4^{n+1}}{3^{m-2}}} = \frac{n+1}{8} = \frac{4}{8} = \frac{2}{4} = \frac{m-2}{`

### `지수3단계/046.webp`
- **P3(REVIEW)**: `지수의 성질을 이용하여 만족하는 자연수 구하기    = \left( \frac{2^{11}}{3^2 - 1} \right)^{\frac{1}{2n}} = 2^{\frac{4}{n}}  양의 정수  에 대하여  가 자`

### `로그3단계/012a.webp`
- **P3(REVIEW)**: `해설 ㄱ.   (참) ㄴ.   (참) ㄷ.  에서  ,    에서  z = \log_{12}^2 \log_6^3  (참)`

### `로그3단계/013a.webp`
- **P3(REVIEW)**: `해설  의 양변에 밑이 2인 로그를 취하면  \log_2 \frac{b}{a} = \log_2 8 \therefore \log_2 b - \log_2 a = 3   의 양변에 밑이 2인 로그를 취하면  \log_2 `

### `로그3단계/014a.webp`
- **P3(REVIEW)**: `해설   \n\n  \n\n이때  ,  이므로 \n\n산술평균과 기하평균의 관계에 의하여 \n\n (\log_a b)^2 + \frac{9}{(\log_a b)^2} \geq 2 \sqrt{(\log_a b)^2 \`
- **P5(REVIEW)**: ` \n\n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n
- **P5(REVIEW)**: ` \n\n(단, 등호는 ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n(단, 등호는 

### `로그3단계/011a.webp`
- **P3(REVIEW)**: `조건 (가)에서  로 놓으면   \(\cdots \) ①  \log c = \log \frac{6ab}{2a + 3b}, \ c = \frac{6ab}{2a + 3b} \frac{1}{c} = \frac{1}{3b}`
- **P5(REVIEW)**: ` \[ \frac{1}{c} = \frac{2a + 3b}{6ab} \] \(\therefore \) ` — KaTeX parse error: Undefined control sequence: \[ at position 2:  \̲[̲ \frac{1}{c} = …
- **P5(REVIEW)**: ` \[ \frac{1}{c} = \frac{1}{3b} + \frac{1}{2a} \] 에 ①을 대입하면 \[ \frac{1}{\log_k t}` — KaTeX parse error: Undefined control sequence: \[ at position 2:  \̲[̲ \frac{1}{c} = …
- **P5(REVIEW)**: ` \[ = \log_t t^{\frac{1}{3}} 3^{\frac{1}{3}} + \log_t 2^{\frac{1}{2}} = \log_t (` — KaTeX parse error: Undefined control sequence: \[ at position 2:  \̲[̲ = \log_t t^{\f…

### `로그3단계/015a.webp`
- **P3(REVIEW)**: `해설  라 하면 로그의 진수 조건에 의하여     f(x) = -x^2 + 2ax + 1   = -(x-a)^2 + a^2 + 1   의 값이 자연수가 되는 실수  의 개수가 6이므로  의 그래프는 아래 그림과 같이`

### `로그3단계/016a.webp`
- **P3(REVIEW)**: `해설 (i)  ,  이여야 하므로   \( \cdots \) ① (ii) 모든 실수  에 대하여  이어야 한다. (a)  이면  이 성립한다. (b)  이고 이차방정식  의 판별식을  라 하면  D = 4a^2 - `
- **P5(REVIEW)**: ` \( \therefore \ 0 < a < 9 \) ② ①, ②을 동시에 만족시키는 정수 ` — KaTeX parse error: Can't use function '\(' in math mode at position 2:  \̲(̲ \therefore \ 0…

### `로그3단계/019a.webp`
- **P3(REVIEW)**: `급수관의 벽면으로부터 중심 방향으로   만큼 떨어진 지점에서의 물의 속력이   이므로  \frac{v_c}{\frac{1}{3}v_c} = 1 - k \log \frac{R^{\frac{6}{5}}}{R}, 3 = `

### `로그3단계/020.webp`
- **P5(REVIEW)**: `의 질량, 반지름의 길이, 행성의 표면에서 물체의 탈출속력은 표와 같다. \n\n` — KaTeX parse error: Undefined control sequence: \n at position 42: …의 탈출속력은 표와 같다. \̲n̲\n
- **P5(REVIEW)**: ` \n\n이때 상수 ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n이때 상수 

### `로그3단계/022a.webp`
- **P3(REVIEW)**: `올해 매출액이 25억 원일 때,  년 후에 매출액이 4배가 되면 100억 원이므로  25(1+0.28)^n = 100  양변에 상용로그를 취하면  n \, \log 1.28 = \log 4, \quad n \log `

### `로그3단계/026a.webp`
- **P3(REVIEW)**: `1에서부터 눈금 4까지의 거리는  , 1에서부터 눈금 16까지의 거리는  이므로 1에서부터 눈금 4와 눈금 16의 중점에 있는 눈금까지의 거리는  \frac{\log 4 + \log 16}{2} = \frac{\lo`

### `로그3단계/023a.webp`
- **P3(REVIEW)**: `밑의 조건에서  이다.  에서   \[ \therefore k \neq 2 \quad \cdots \text{①} \]  에서   \[ \therefore k \neq 3, k \neq 1 \quad \cdots \`

### `로그3단계/027a.webp`
- **P3(REVIEW)**: `조건 (가)의   에서 \n \log_{675}3^a + \log_{675}5^b = c  \n \log_{675}3^a \cdot 5^b = c, \\ 3^a \cdot 5^b = 675^c  \n이때   이므로 `
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲이때 
- **P5(REVIEW)**: ` 이므로 \n` — KaTeX parse error: Undefined control sequence: \n at position 6:  이므로 \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` 이므로 \n조건 (나)에 의하여 ` — KaTeX parse error: Undefined control sequence: \n at position 6:  이므로 \̲n̲조건 (나)에 의하여 
- **P5(REVIEW)**: ` \n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲따라서 
- **P5(REVIEW)**: ` 이므로 \n` — KaTeX parse error: Undefined control sequence: \n at position 6:  이므로 \̲n̲

### `로그3단계/028a.webp`
- **P3(REVIEW)**: `로그의 성질을 이용하여 식의 값 구하는 문제 해결하기 주어진 식에서 로그의 밑을  로 모두 변환하면  \log_a b = 81 에서  \frac{\log_c b}{\log_c a} = 81 이므로  \log_c b `
- **P5(REVIEW)**: ` \[ \therefore \; \bigcirc 1 \] ` — KaTeX parse error: Undefined control sequence: \[ at position 2:  \̲[̲ \therefore \; …
- **P5(REVIEW)**: ` \[ \therefore \; \bigcirc 2 \] ①, ②에 의하여 ` — KaTeX parse error: Undefined control sequence: \[ at position 2:  \̲[̲ \therefore \; …

### `로그3단계/029a.webp`
- **P3(REVIEW)**: `=   \text{에서}   =   \log_a c =  , \log_a c = 4   c = a^4 \quad   \triangle   =   \text{에서}   =   \log_a b =  , \log_a b `

### `로그3단계/042.webp`
- **P3(REVIEW)**: `아래쪽부터 빈칸에 알맞은 값을 차례로 구하면 그림과 같다.  \therefore x+y+z=2+2^8+2^2   =262`

### `로그3단계/038.webp`
- **P3(REVIEW)**: `해설  에서\n\n \log_4 (x \cdot 3y \cdot 4z) = \log_4 12xyz = 2 \n\n 12xyz = 4^2 = 16 \quad \therefore \quad xyz = \frac{4}{3`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `지수함수3단계/008.webp`
- **P3(REVIEW)**: `지수함수  의 그래프가 다음 그림과 같다.  일 때,  의 값은? ①  \sqrt{2} \sqrt{2}`

### `지수함수3단계/016a.webp`
- **P3(REVIEW)**: `함수  의 그래프를 원점에 대하여 대칭이동한 그래프의 식은  이므로   따라서 두 함수  의 그래프는 다음 그림과 같다. 사각형  는 직사각형이고  , 즉  이므로  AB = f(\alpha) - g(\beta) =`

### `지수함수3단계/015a.webp`
- **P3(REVIEW)**: `해설   \[= a^{-(x^2 - 4x + 4) + 10}\] \[= a^{-(x-2)^2 + 10}\] 에서  이라 하자. (i)  일 때 함수  은  의 값이 증가하면  의 값이 감소하므로  에서 함수  가 최`

### `지수함수3단계/020.webp`
- **P5(REVIEW)**: `\(\frac{728}{3}\) ② 243 ③ \(\frac{730}{3}\) ④ \(\frac{731}{3}\) ⑤ 244` — KaTeX parse error: Can't use function '\(' in math mode at position 1: \̲(̲\frac{728}{3}\)…

### `지수함수3단계/023a.webp`
- **P3(REVIEW)**: `점 A의  좌표를  라 하면 점 B의  좌표는  , 점 C의  좌표는  이다.  \n a^{k+1} = \frac{3}{2} 에서    \n a^{k+2} + 1 = 3 에서    \n⑦, ⑧에 의하여  이므로   `
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n⑦, ⑧에 의하여 ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲⑦, ⑧에 의하여 
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲∴ 

### `지수함수3단계/022a.webp`
- **P3(REVIEW)**: `해설   일 때,  ,  이므로     \[ \therefore 10^{50a} + 10^{25a} - 12 = 0 \]   로 놓으면     \[ \therefore X = 3 \ (\because X > 0) \`

### `지수함수3단계/020a.webp`
- **P5(REVIEW)**: ` \leq \left( ` — KaTeX parse error: Expected '\right', got 'EOF' at end of input:  \leq \left( 
- **P5(REVIEW)**: ` \right)^x \leq 27 ` — KaTeX parse error: Expected 'EOF', got '\right' at position 2:  \̲r̲i̲g̲h̲t̲)^x \leq 27 
- **P5(REVIEW)**: ` \text{① ` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input:  \text{① 
- **P5(REVIEW)**: ` 양변을 \left( ` — KaTeX parse error: Expected '\right', got 'EOF' at end of input:  양변을 \left( 
- **P5(REVIEW)**: ` \right)^x \text{으로 나누면}` — KaTeX parse error: Expected 'EOF', got '\right' at position 2:  \̲r̲i̲g̲h̲t̲)^x \text{으로 나누…
- **P5(REVIEW)**: ` \text{①}에서 \left( ` — KaTeX parse error: Expected '\right', got 'EOF' at end of input: …xt{①}에서 \left( 
- **P5(REVIEW)**: ` \right)^x \text{의 최소값이} ` — KaTeX parse error: Expected 'EOF', got '\right' at position 2:  \̲r̲i̲g̲h̲t̲)^x \text{의 최소값…
- **P5(REVIEW)**: ` 양변을 \left( ` — KaTeX parse error: Expected '\right', got 'EOF' at end of input:  양변을 \left( 
- **P5(REVIEW)**: ` \right)^{2x} \text{으로 나누면} \ 9 \leq b \cdot \left( ` — KaTeX parse error: Expected 'EOF', got '\right' at position 2:  \̲r̲i̲g̲h̲t̲)^{2x} \text{으로…
- **P5(REVIEW)**: ` \right)^x` — KaTeX parse error: Expected 'EOF', got '\right' at position 2:  \̲r̲i̲g̲h̲t̲)^x
- **P5(REVIEW)**: ` \leq \left( ` — KaTeX parse error: Expected '\right', got 'EOF' at end of input:  \leq \left( 
- **P5(REVIEW)**: ` \right)^x` — KaTeX parse error: Expected 'EOF', got '\right' at position 2:  \̲r̲i̲g̲h̲t̲)^x

### `지수함수3단계/025a.webp`
- **P3(REVIEW)**: `두 함수  과  의 그래프는 직선  에 대하여 대칭이므로 두 그래프를  축의 방향으로  만큼 평행이동한  과  의 그래프는 직선  에 대하여 대칭이다. ∴   따라서  이므로   즉,  이고  이므로  a^2 - \`

### `지수함수3단계/029a.webp`
- **P3(REVIEW)**: `점  는 곡선  과 직선  의 교점이므로    \n\n 의 그래프는  의 그래프를  축의 방향으로 2만큼 평행이동한 것이므로  \n\n   \n\n \therefore \; S_k = \frac{1}{2} \cdot`
- **P5(REVIEW)**: `  \n\n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲\n
- **P5(REVIEW)**: `에서  \n\n` — KaTeX parse error: Undefined control sequence: \n at position 5: 에서  \̲n̲\n
- **P5(REVIEW)**: `  \n\n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲\n
- **P5(REVIEW)**: `  \n\n따라서 자연수 ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲\n따라서 자연수 

### `지수함수3단계/034.webp`
- **P3(REVIEW)**: `(만 원)짜리 새 자동차의   년 후의 가격이   (만 원)일 때,  A = A_0 k^t \ (k \text{는 상수})  과 같은 관계식이 성립한다고 한다. 2700만 원에 산 새 자동차의 1년 후의 가격이 90`

### `지수함수3단계/024a.webp`
- **P3(REVIEW)**: `지수함수의 그래프를 이용하여 문제해결하기 정사각형  의 한 변의 길이가  이므로 두 점  의  좌표를  라 하면 두 점  의  좌표는  이다. 네 점  의  좌표가 각각  이므로  이므로  b^{t+4} = 8, b`

### `지수함수3단계/035.webp`
- **P5(REVIEW)**: ` 이므로 \] (i) ` — KaTeX parse error: Can't use function '\]' in math mode at position 6:  이므로 \̲]̲ (i) 
- **P5(REVIEW)**: ` \[ \therefore g(-b) > f(a) \] (ii) ` — KaTeX parse error: Undefined control sequence: \[ at position 2:  \̲[̲ \therefore g(-…
- **P5(REVIEW)**: `이므로 문제의 조건을 만족시키지 않는다. \[ (i), (ii)\text{에 의하여 } f(a) < g(-b) \; (거짓) \] 따라서 옳은 ` — KaTeX parse error: Undefined control sequence: \[ at position 24: …조건을 만족시키지 않는다. \̲[̲ (i), (ii)\text…

### `지수함수3단계/042.webp`
- **P3(REVIEW)**: `해설  이므로  a^b \cdot a^{2c} = a^{b+2c} = 512   f\left(\frac{b+2c}{3}\right) = a^{\frac{b+2c}{3}} = \left(a^{b+2c}\right)^{`

### `지수함수3단계/039.webp`
- **P5(REVIEW)**: `\cdots \bigcirc \text{① ` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: …igcirc \text{① 

### `지수함수3단계/048.webp`
- **P3(REVIEW)**: `해설   \newline  이면 함수  는  이 최대일 때 최대가 되고, 최소일 때 최소가 된다. \newline  이므로 \newline  일 때,  은  에서 최소값  ,  에서 최댓값  를 갖는다. \newli`

### `로그함수3단계/017.webp`
- **P3(REVIEW)**: `이고  이 성립할 때,  \frac{x^4}{y}  의 최댓값과 최솟값의 곱을 구하시오.`

### `로그함수3단계/017a.webp`
- **P3(REVIEW)**: `해설  로 놓으면  에서  이고  \log_3 \frac{x^4}{y} = 4 \log_3 x - \log_3 y = 4 \log_3 x - (\log_3 x)^2   = 4t - t^2 = -(t-2)^2 + 4 `

### `로그함수3단계/022.webp`
- **P3(REVIEW)**: `x에 대한 연립부등식을 \( \begin{cases} \log_2 x + \log_2 (10-x) \leq 4 \\ x^2 - ax < 0 \end{cases} \) 을 만족시키는 \( x \)의 값 중 정수가 2개`

### `로그함수3단계/019a.webp`
- **P5(REVIEW)**: `} \] ` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲ \] 
- **P5(REVIEW)**: `에서 \[ \log_a (6-x) < \log_a (x+5) \] (i) ` — KaTeX parse error: Undefined control sequence: \[ at position 4: 에서 \̲[̲ \log_a (6-x) <…
- **P5(REVIEW)**: `일 때 \[ 6-x < a(x+5), \; (a+1)x > 6-5a \] \[ \therefore x > \frac{6-5a}{a+1} \qua` — KaTeX parse error: Undefined control sequence: \[ at position 5: 일 때 \̲[̲ 6-x < a(x+5), …
- **P5(REVIEW)**: `이어야 하므로 \[ \frac{6-5a}{a+1} = -4, \; 6-5a = -4a-4 \] \[ \therefore a = 10 \] (ii` — KaTeX parse error: Undefined control sequence: \[ at position 9: 이어야 하므로 \̲[̲ \frac{6-5a}{a+…
- **P5(REVIEW)**: `일 때 \[ 6-x > a(x+5), \; (a+1)x < 6-5a \] \[ \therefore x < \frac{6-5a}{a+1} \qua` — KaTeX parse error: Undefined control sequence: \[ at position 5: 일 때 \̲[̲ 6-x > a(x+5), …

### `로그함수3단계/018a.webp`
- **P5(REVIEW)**: `\n\n해설\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n해설\n\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `에서\n\n` — KaTeX parse error: Undefined control sequence: \n at position 3: 에서\̲n̲\n
- **P5(REVIEW)**: `\n\n이때 주어진 함수는\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n이때 주어진 함수는\n\…
- **P5(REVIEW)**: `\n\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 
- **P5(REVIEW)**: `일 때\n\n최솟값 ` — KaTeX parse error: Undefined control sequence: \n at position 4: 일 때\̲n̲\n최솟값 
- **P5(REVIEW)**: `를 가지므로 최댓값과 최솟값의 합은\n\n` — KaTeX parse error: Undefined control sequence: \n at position 20: …므로 최댓값과 최솟값의 합은\̲n̲\n

### `로그함수3단계/023a.webp`
- **P3(REVIEW)**: `사업을 시작할 때의 자본을  원이라 하면  년 후의 두 회사  ,  의 자본은 각각  K(1+0.1)^n = K \times 1.1^n  (원),  K(1+0.2)^n = K \times 1.2^n  (원)  년 후`

### `로그함수3단계/020a.webp`
- **P3(REVIEW)**: `진수의 조건에서  ,  이므로  ,   \[ \therefore -4 < x < 6 \]  에서 \[ \log_a (x+4) > \log_a (6-x) + 2 \] \[ \log_a (x+4) > \log_a \{ `
- **P5(REVIEW)**: `, ⑤에서 \[ \frac{6a^2 - 4}{a^2 + 1} = 5, \quad 5a^2 + 5 = 6a^2 - 4 \] \[ a^2 = 9 \` — KaTeX parse error: Undefined control sequence: \[ at position 7: , ⑤에서 \̲[̲ \frac{6a^2 - 4…
- **P5(REVIEW)**: `일 때, \[ x+4 < a^2 (6-x) \]에서 ` — KaTeX parse error: Undefined control sequence: \[ at position 6: 일 때, \̲[̲ x+4 < a^2 (6-x…
- **P5(REVIEW)**: ` \[ \therefore x < \frac{6a^2 - 4}{a^2 + 1} \quad (\because a^2 + 1 > 0) \] 그런데 ` — KaTeX parse error: Undefined control sequence: \[ at position 2:  \̲[̲ \therefore x <…

### `로그함수3단계/026.webp`
- **P5(REVIEW)**: `0 ② \(\frac{1}{8}\) ③ \(\frac{1}{4}\) ④ \(\frac{1}{2}\) ⑤ 1` — KaTeX parse error: Can't use function '\(' in math mode at position 5: 0 ② \̲(̲\frac{1}{8}\) ③…

### `로그함수3단계/021a.webp`
- **P3(REVIEW)**: `집합  에서  x^2 - 6x + 5 \\leq 0, \; 즉 \; (x-5)(x-1) \\leq 0 \; \text{이므로}   1 \\leq x \\leq 5   \therefore \; A = \{ x | 1 `

### `로그함수3단계/025a.webp`
- **P3(REVIEW)**: `두 점 A, B의 좌표는 각각  이므로  에서  \left| \log_5 k - \{ -\log_5 (6-k) \} \right| = 1   \left| \log_5 k (6-k) \right| = 1   \ther`

### `로그함수3단계/027a.webp`
- **P3(REVIEW)**: `해설 \( B(a, 0), \ C(b, 0) \) 이므로 \( AB = \log_{\sqrt{5}} a, \ GC = \log_{\sqrt{5}} b \) 조건 (가)에 의하여 \( DG = \log_{\sqrt{5`

### `로그함수3단계/026a.webp`
- **P3(REVIEW)**: `해설 \(A (k, \log_2 k), B (k, -\log_2 (12-k))\)이고 \(AB=3\)이므로 \[|\log_2 k + \log_2 (12-k)| = 3\] \[|\log_2 k (12-k)| = 3\]`

### `로그함수3단계/029a.webp`
- **P3(REVIEW)**: `해설   \[ = 5 \log_2 x \left( 4 - \frac{1}{2} \log_2 x \right) \] \[ = -\frac{5}{2} (\log_2 x)^2 + 20 \log_2 x \]   ①  로 놓`

### `로그함수3단계/028a.webp`
- **P3(REVIEW)**: `두 점 A, C의  좌표가 같으므로  \log_6(n-k) = \log_{36}(x+70) 에서   \[ \therefore x = (n-k)^2 - 70 \] 즉, 점 C의  좌표가  이므로  S(k) = AB \`
- **P5(REVIEW)**: ` \[ \therefore x = (n-k)^2 - 70 \] 즉, 점 C의 ` — KaTeX parse error: Undefined control sequence: \[ at position 2:  \̲[̲ \therefore x =…
- **P5(REVIEW)**: `의 값이 자연수가 되어야 하므로 \[ n-k = 6, \ n-k = 36, \ n-k = 216, \ldots \] \[ \therefore k` — KaTeX parse error: Undefined control sequence: \[ at position 19: …이 자연수가 되어야 하므로 \̲[̲ n-k = 6, \ n-k…
- **P5(REVIEW)**: `의 개수가 1 이려면 \[ n-36 \leq \alpha, \ 즉, n \leq \alpha + 36 \] 따라서 ` — KaTeX parse error: Undefined control sequence: \[ at position 13: 의 개수가 1 이려면 \̲[̲ n-36 \leq \alp…
- **P5(REVIEW)**: `이다. \[ n = \alpha + 36 \]일 때, 두 곡선의 교점이 ` — KaTeX parse error: Undefined control sequence: \[ at position 5: 이다. \̲[̲ n = \alpha + 3…
- **P5(REVIEW)**: `에서 \[ \log_6 36 = 2 = \log_{36}(\alpha + 70) \] \[ \therefore \alpha + 70 = 36^2` — KaTeX parse error: Undefined control sequence: \[ at position 4: 에서 \̲[̲ \log_6 36 = 2 …

### `로그함수3단계/035.webp`
- **P3(REVIEW)**: `모든 실수  에 대하여 부등식   (1 - \log_4 a)x^2 - (2 - \log_2 a)x + \log_4 a \geq 0   이 성립하도록 하는 모든 자연수  의 값의 합을 구하시오.`

### `로그함수3단계/036.webp`
- **P3(REVIEW)**: `x에 대한 부등식  x^2 - 2(2 - \log_3 a)x + 10 - (\log_3 a)^2 > 0 이 항상 성립하도록 하는 실수  의 값의 범위는? ①   ②   ③   ④   또는   ⑤`

### `로그함수3단계/032a.webp`
- **P5(REVIEW)**: ` \n\n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n

### `로그함수3단계/031a.webp`
- **P3(REVIEW)**: `해설   에서 \n\n 3 \log_x y - \frac{2}{\log_y x} + 5 = 0 \n\n  로 놓으면  ,   에서   이고\n\n 3t - \frac{2}{t} + 5 = 0, \; 3t^2 + 5t`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: ` 이고\n\n` — KaTeX parse error: Undefined control sequence: \n at position 4:  이고\̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n즉, ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n즉, 
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: ` 에 대입하면\n\n` — KaTeX parse error: Undefined control sequence: \n at position 8:  에 대입하면\̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 

### `로그함수3단계/030a.webp`
- **P3(REVIEW)**: `해설 \( \frac{1}{9} < x < 16 \)에서\n\n\( 1 < 9x < 144, 1 < \frac{16}{x} < 144 \)이므로\n\n\( 0 < \log_{12} 9x < 2, 0 < \log_{1`

### `로그함수3단계/040.webp`
- **P3(REVIEW)**: `다음 그림과 같이  축 위에 있는 직사각형의 꼭짓점의  좌표를  라고 하자. 이때  ,  ,  이므로 직사각형의 넓이의 합은  1 \cdot 1 + 2(\log_2 3 - 1) + 3(2 - \log_2 3)   =`

### `로그함수3단계/042.webp`
- **P3(REVIEW)**: `진수 조건에서    \[ \frac{D}{4} = 2^2 - k < 0 \]  ∴   ……①   의 그래프가  축과 만나지 않으려면   이어야 한다.  그러므로 모든  에 대하여       \[ \frac{D}{4}`

### `로그함수3단계/043.webp`
- **P3(REVIEW)**: `원점  과 점  을  축의 방향으로 4만큼,  축의 방향으로 2만큼 평행이동한 점을 각각  이라 하면   \[ y = \log_3(x + a) \]의 그래프는 \[ y = \log_3 x \]의 그래프를  축의 방향`

### `로그함수3단계/044.webp`
- **P5(REVIEW)**: `\cdots \text{① ` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: \cdots \text{① 
- **P5(REVIEW)**: `이므로 \[x = \frac{1}{a}\] ` — KaTeX parse error: Undefined control sequence: \[ at position 5: 이므로 \̲[̲x = \frac{1}{a}…
- **P5(REVIEW)**: ` 위에 있어야 하므로 \[\frac{4}{b} = \frac{1}{a}\] \[\therefore a = \frac{b}{4}\] 또한, ` — KaTeX parse error: Undefined control sequence: \[ at position 13:  위에 있어야 하므로 \̲[̲\frac{4}{b} = \…
- **P5(REVIEW)**: `이므로 \[0 < \frac{b}{4} < 1\] \[\therefore 1 < b < 4\] 따라서 ` — KaTeX parse error: Undefined control sequence: \[ at position 5: 이므로 \̲[̲0 < \frac{b}{4}…

### `로그함수3단계/045.webp`
- **P3(REVIEW)**: `해설 직선   위의 점  라 하자. 직선  와 곡선  의 교점  의  좌표는  \left(\frac{1}{4}\right)^x = a \text{에서 } x = \log_{\frac{1}{4}} a  ∴   직선  `

### `로그함수3단계/048.webp`
- **P3(REVIEW)**: `위의 그림에서  ,   점  와  는  좌표가 같으므로   점  와 점  는  좌표가 같으므로   점  는 직선   위의 점이므로  \alpha = 3^{\log_9 \beta} = \beta^{\log_9 3} =`

### `로그함수3단계/047.webp`
- **P3(REVIEW)**: `해설  로 놓으면 선분  의 중점이 원의 중심  과 일치하므로  \frac{p+q}{2} = \frac{3\sqrt{5}}{5}  에서   … ①   \log_a pq = 0 pq = 1   P\left( \frac`

### `삼각함수3단계/005.webp`
- **P3(REVIEW)**: `다음 그림과 같이 한 변의 길이가  인 정육각형에 내접하는 크기가 같은 6개의 원이 서로 외접하고 있다. 색칠한 부분의 넓이가  S = p\sqrt{3} + q\pi 일 때,  의 값을 구하시오. (단,  ,  는 `

### `삼각함수3단계/008a.webp`
- **P3(REVIEW)**: `다음 그림과 같이 추를 매단 줄의 끝 부분을  라 하고 추가 멈춰있을 때의 추의 중심을  , 추가 가장 높이 올라갔을 때의 추의 중심을 각각  ,  라 하자. 직선  와 추의 중심 사이의 거리는 추의 중심이  일 때`

### `삼각함수3단계/009a.webp`
- **P3(REVIEW)**: `다음 그림과 같이 점  에 대하여   이므로   점  은 원   위의 점이므로   \[\therefore \ a = \frac{\sqrt{15}}{2} \ (\because \ a > 0)\] 각  를 나타내는 동경`

### `삼각함수3단계/010a.webp`
- **P3(REVIEW)**: `해설  를  에 대입하면  x^2 + 49x^2 = 1, \ x^2 = \frac{1}{50}   \therefore x = \frac{\sqrt{2}}{10} \ (\because x > 0)  따라서 점 P의 좌`

### `삼각함수3단계/012a.webp`
- **P3(REVIEW)**: `점  가 단위원 위의 점이므로\n x = \cos\theta, \ y = \sin\theta \n \frac{y}{x} + \frac{x}{y} = \frac{\sin\theta}{\cos\theta} + \frac`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲∴ 
- **P5(REVIEW)**: `\n따라서\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서\n
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲이때 
- **P5(REVIEW)**: `\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲∴ 

### `삼각함수3단계/018.webp`
- **P3(REVIEW)**: `0 < \theta < \pi일 때,   \theta와 3 \theta의 동경이 같은 직선 위에 있도록 하는 모든 \theta의 값의 합은? ①   \pi ② \pi ③   \pi ④   \pi ⑤   \pi`

### `삼각함수3단계/019.webp`
- **P3(REVIEW)**: `0 < \theta <   인 각 \theta와 각 10\theta를 나타내는 동경이 일직선 위에 있고 방향이 반대일 때, 각 \theta의 크기를 모두 더하면? ①  \pi ②  \pi ③  \pi ④  \pi ⑤`

### `삼각함수3단계/015a.webp`
- **P3(REVIEW)**: `해설   ... ①  \sin^2 \theta + \cos^2 \theta + 2 \sin \theta \cos \theta = 2 1 + 2 \sin \theta \cos \theta = 2 \therefore \`

### `삼각함수3단계/018a.webp`
- **P3(REVIEW)**: `와  의 동경을 각각 반직선  ,  라 하자. \n(i) 두 점  ,  가 같은 방향일 때, \n 3 \theta - \frac{1}{2} \theta = 2n\pi \ (단, \ n \text{은 정수})  \n `
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲이때 
- **P5(REVIEW)**: ` \n(ii) 두 점 ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲(ii) 두 점 
- **P5(REVIEW)**: `가 반대 방향일 때, \n` — KaTeX parse error: Undefined control sequence: \n at position 13: 가 반대 방향일 때, \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲이때 
- **P5(REVIEW)**: ` \n따라서 (i), (ii)로부터 모든 ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲따라서 (i), (ii)로부…
- **P5(REVIEW)**: `의 값의 합은 \n` — KaTeX parse error: Undefined control sequence: \n at position 9: 의 값의 합은 \̲n̲

### `삼각함수3단계/027.webp`
- **P3(REVIEW)**: `가 제2사분면의 각이라면\n\n 2k\pi + \frac{\pi}{2} < \frac{n}{4} \pi < 2k\pi + \pi \; (단, \; k \text{는 음이 아닌 정수}) \n\n \therefore \`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `가 제4사분면의 각이라면\n\n` — KaTeX parse error: Undefined control sequence: \n at position 14: 가 제4사분면의 각이라면\̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `삼각함수3단계/030.webp`
- **P3(REVIEW)**: `다음 그림에서 삼각형  는 한 변의 길이가  인 정삼각형이고, 삼각형  와 삼각형  는 한 변의 길이가  인 정삼각형이다.\n\n S = (\text{삼각형 } OPQ \text{의 넓이}) - \{ (\text{삼`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 색칠한 부분의 넓이는\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 색칠한 부분의 넓…

### `삼각함수3단계/028.webp`
- **P3(REVIEW)**: `해설  가 제3사분면의 각이라면  2k\pi + \pi < \frac{n}{5}\pi < 2k\pi + \frac{3}{2}\pi \; (\text{단, } k \text{는 정수})   \therefore \; 1`

### `삼각함수3단계/029.webp`
- **P3(REVIEW)**: `내접하는 원의 반지름의 길이를  라 하면 다음 그림과 같이 6등분한 사각형에서  \angle CAB = 2\pi \cdot \frac{1}{12} = \frac{\pi}{6}   \therefore \ AC = 2r`

### `삼각함수3단계/031.webp`
- **P3(REVIEW)**: `두 점  ,  가 출발한 지  초,  초,  초,  초 후의 두 원은 다음 그림과 같다. \n\n 이므로 출발한 지  초 후의 노란색 부분의 넓이는 출발한 지  초 후의 노란색 부분의 넓이와 같다. \n\n 초 후의`
- **P5(REVIEW)**: ` \n\n즉, ` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n즉, 

### `삼각함수3단계/025.webp`
- **P3(REVIEW)**: `동경  이 나타내는 각의 크기를  이라 하면\n\n \theta_1 = \pi + \frac{\pi}{4} = \frac{5}{4}\pi \n\n \theta_2 = 3\pi - \frac{2}{4}\pi = 2\p`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 동경 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 동경 

### `삼각함수그래프3단계/010.webp`
- **P3(REVIEW)**: `인 실수  와 음수  에 대하여  -\frac{\pi}{a} \leq x \leq \frac{2\pi}{a}  에서 정의된 함수  가 있다.↵함수  의 그래프가 두 점  을 지날 때,↵ 의 값을 구하시오.`

### `삼각함수그래프3단계/015.webp`
- **P3(REVIEW)**: `다음 식의 값을 구하시오.↵ \left( \frac{1}{\sin^2 1^\circ} + \frac{1}{\sin^2 2^\circ} + \frac{1}{\sin^2 3^\circ} + \cdots + \frac{1`

### `삼각함수그래프3단계/014.webp`
- **P3(REVIEW)**: `각  를 나타내는 동경과 각  를 나타내는 동경이 일치할 때,↵ 의 값은? (단,↵ ) ↵↵①  \frac{1}{2} \frac{\sqrt{2}}{2} \frac{\sqrt{3}}{2}`

### `삼각함수그래프3단계/020.webp`
- **P3(REVIEW)**: `아래 그림과 같이 어떤 용수철에 질량이  인 추를 매달아,↵아래쪽으로  만큼 잡아당겼다가 놓으면,↵추는 지면과 수직인 방향으로 진동한다.↵↵추를 놓은 지  초가 지난 후의 추의 높이를  라 하면↵다음 관계식이 성립한`

### `삼각함수그래프3단계/021.webp`
- **P3(REVIEW)**: `어떤 건물의 난방기에는 자동 온도 조절 장치가 있어서 실내 온도가 2시간 주기로 변한다.↵이 난방기의 온도를  로 설정하였을 때,↵가동한 지   분 후의 실내 온도는  가 되어 다음 식이 성립한다고 한다.↵ T = `

### `삼각함수그래프3단계/017.webp`
- **P5(REVIEW)**: `\n

① ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
̲
̲① 

### `삼각함수그래프3단계/020a.webp`
- **P3(REVIEW)**: `해설\n\n \n\n \n\n } m = a, L = 5\sqrt{2}, t = 3 \text{일 때} h = 15 - 5\sqrt{2} \cos \frac{6\pi}{\sqrt{a}} \quad \cdots \te`
- **P5(REVIEW)**: `= 15 - 10 \cdot \frac{1}{2} = 10 \quad \cdots \text{  ① ` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: …dots \text{  ① 
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n①과 ②이 같으므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n①과 ②이 같으므로\n\…
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n이때 
- **P5(REVIEW)**: ` 이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 ③에서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 ③에서 
- **P5(REVIEW)**: ` 이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `삼각함수그래프3단계/022a.webp`
- **P3(REVIEW)**: `정답   해설  로 놓으면  이고,↵주어진 방정식은   즉,↵  이므로   또는   ( ) (i)  ,↵즉   일 때   (ii)  ,↵즉  일 때   (i),↵(ii)에 의하여 주어진 방정식의 해는   또는   이`

### `삼각함수그래프3단계/027.webp`
- **P3(REVIEW)**: `0 \leq x \leq 2\pi 일 때,↵방정식  의 서로 다른 실근의 개수가 3이다.↵이 세 실근 중 가장 큰 실근을  라 할 때,↵ 의 값은? (단,↵ 는 상수이다.) ↵↵①   ②   ③   ④   ⑤`

### `삼각함수그래프3단계/023a.webp`
- **P3(REVIEW)**: `해설  에서   이것을  에 대입하면  (5 \cos \theta - 1)^2 + \cos^2 \theta = 1   26 \cos^2 \theta - 10 \cos \theta = 0   2 \cos \theta `

### `삼각함수그래프3단계/028a.webp`
- **P3(REVIEW)**: `해설  라 하면   따라서   이라 하면   에서  y = \frac{\sin(2x - \pi) + 1}{2} = \frac{-\sin(\pi - 2x) + 1}{2}   = \frac{-\sin 2x + 1}{2}`

### `삼각함수그래프3단계/031a.webp`
- **P3(REVIEW)**: `해설  에 대한 이차방정식  의 판별식을  라 하면 이 이차방정식이 중근을 가지므로  \frac{D}{4} = (-2\sin\theta)^2 - (4\sin\theta + 3) = 0 에서  4\sin^2\theta`

### `삼각함수그래프3단계/033.webp`
- **P3(REVIEW)**: `곡선  와 직선   이 만나는 점들 중 서로 다른 두 점  ,↵ 와 이 곡선 위의 점  에 대하여 삼각형  의 넓이의 최댓값이  이다.↵유리수  ,↵ 에 대하여  의 값을 구하시오.↵ \left( \text{단, 점`

### `삼각함수그래프3단계/032a.webp`
- **P3(REVIEW)**: `해설   에서 두 함수  ,↵ 의 그래프는 다음 그림과 같다.↵  에서   이므로     에서   이므로     점  는 함수  의 그래프 위의 점이므로 삼각형  의 넓이가 최대일 때의 점  의  좌표는  이다.↵따`

### `삼각함수그래프3단계/035.webp`
- **P3(REVIEW)**: `삼각형  에서 ↵↵ 2 \cos \frac{B+C-A}{2} = \sin C \cos\left(\frac{\frac{\pi}{2}-C}{2}\right) + \cos C \sin\left(\frac{\frac{\pi`

### `삼각함수그래프3단계/034a.webp`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n함수 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n함수 
- **P5(REVIEW)**: `,
\n\n최솟값은 ` — KaTeX parse error: Undefined control sequence: \n at position 3: ,
\̲n̲\n최솟값은 
- **P5(REVIEW)**: `이다.\n\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이다.\̲n̲\n
- **P5(REVIEW)**: `이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲\n

### `삼각함수그래프3단계/036.webp`
- **P3(REVIEW)**: `원점  와 점  을 이은 선분  를 12등분하는 점을 차례대로  이라 하자.↵점  를 지나고  축에 수직인 직선과 함수  의 그래프의 교점을  라 할 때,↵ \sqrt{A_1B_1^2} + \sqrt{A_2B_2^2`

### `삼각함수그래프3단계/033a.webp`
- **P3(REVIEW)**: `해설   에서  \cos  \frac{1}{4}(x - \pi) = \frac{\sqrt{3}}{2}  이때  에서  이므로  \frac{1}{4}x - \frac{\pi}{4} = \frac{\pi}{6} \tex`

### `삼각함수그래프3단계/035a.webp`
- **P3(REVIEW)**: `정답   해설  이므로   \[ \therefore \: 2\cos\left(\frac{B + C - A}{2}\right) = 2\cos\left(\frac{\pi - 2A}{2}\right) \] \[ = 2\c`

### `삼각함수그래프3단계/038.webp`
- **P3(REVIEW)**: `에서 함수 f(x)가  f(x) = \frac{3\sin^2\left(\frac{\pi}{2} - x\right) + \cos^2 x + 1}{\sin\left(\frac{\pi}{2} - x\right)}  일 때`

### `삼각함수그래프3단계/037.webp`
- **P3(REVIEW)**: `다음 그림과 같이 반지름의 길이가 1인 사분원의 호  를 6등분하는 점을 각각  라고 하자.↵점  에서 반지름  에 내린 수선의 발을  라고 할 때,↵ \frac{P_1Q_1^2}{P_2Q_2} + \frac{P_2`

### `삼각함수그래프3단계/041.webp`
- **P3(REVIEW)**: `0 \leq x < 2\pi일 때,↵방정식  가 하나의 실근을 갖도록 하는 모든 실수  의 값의 곱을 구하시오.`

### `삼각함수그래프3단계/039.webp`
- **P3(REVIEW)**: `a,↵b는 양수이고  이다.↵ 일 때,↵ 12 \sin^2(\pi + \alpha + \beta) + 8 \cos \gamma 의 최댓값을 구하시오.`

### `삼각함수그래프3단계/037a.webp`
- **P3(REVIEW)**: `해설 점   이 호  를 6등분하는 점이므로  \angle P_n OA = \frac{\pi}{2} \cdot \frac{n}{6} = \frac{n}{12} \pi  이때   이므로   따라서  P_1 Q_1^2 `

### `삼각함수그래프3단계/038a.webp`
- **P3(REVIEW)**: `정답   해설  이므로  f(x) = \frac{3\sin^2\left(\frac{\pi}{2} - x\right) + \cos^2 x + 1}{\sin\left(\frac{\pi}{2} - x\right)}   =`

### `삼각함수그래프3단계/036a.webp`
- **P3(REVIEW)**: `해설   이므로 점  의  좌표는 차례대로  \frac{\pi}{8}, \frac{\pi}{4}, \frac{3}{8} \pi, \frac{\pi}{2}, \frac{5}{8} \pi, \frac{3}{4} \pi,`

### `삼각함수그래프3단계/039a.webp`
- **P3(REVIEW)**: `해설  이므로              라 하자.↵ 라 하면    이므로    } a^2 + b^2 = 1ab \cos\gamma \cos\gamma = t = \frac{a^2 + b^2}{4ab} = \frac{a`
- **P5(REVIEW)**: `\cdots \; \bigcirc \text{  ① ` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: …circ \text{  ① 
- **P5(REVIEW)**: `\bigcirc \text{① ` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: …igcirc \text{① 

### `삼각함수그래프3단계/042a.webp`
- **P3(REVIEW)**: `해설  를  에 대입하여 정리하면  \frac{3}{2}x^2 \cos \theta + 2x \sin \theta + \cos^2 \theta + \sin^2 \theta = 0  주어진 직선이 곡선과 만나려면 위의`

### `삼각함수그래프3단계/047.webp`
- **P3(REVIEW)**: `두 조건 ↵(나),↵(다)에서  f(x) = \begin{cases} \sin 2x & (0 \leq x \leq \pi) \\ -\sin 2x & (\pi < x \leq 2\pi) \end{cases}  조건 ↵`

### `삼각함수그래프3단계/049.webp`
- **P3(REVIEW)**: `함수  의 주기는   주어진 그림에서  ,↵  이므로  f(\text{α} + \beta + \text{γ} - 2) = f(\text{α} + 4) = f(\text{α}) = \frac{1}{3}   f(\tex`

### `삼각함수그래프3단계/051.webp`
- **P3(REVIEW)**: `교점의  좌표가 2,↵10이므로 함수  의 주기는 12이다.↵ \frac{2\pi}{|b|} = 12, \ b = \frac{\pi}{6} \ (\because \ b > 0)  위의 그림과 같이  이라 하면  \o`

### `삼각함수그래프3단계/050.webp`
- **P3(REVIEW)**: `해설 두 점  ,↵ 는 직선  에 대하여 대칭이므로  \frac{\alpha + \beta}{2} = \frac{\pi}{4} \therefore \alpha + \beta = \frac{\pi}{2} \cdots `

### `삼각함수그래프3단계/055.webp`
- **P3(REVIEW)**: `해설   라 하면  \n f(x) = \begin{cases} 0 & (\cos 2 \pi x \geq 0) \\ \cos 2 \pi x & (\cos 2 \pi x < 0) \end{cases} 이고,↵직선  은 `
- **P5(REVIEW)**: `을 지난다.
\n위의 그림에서 ` — KaTeX parse error: Undefined control sequence: \n at position 8: 을 지난다.
\̲n̲위의 그림에서 
- **P5(REVIEW)**: `이 서로 다른 세 점에서 만나려면 직선의 기울기가  \n점 ` — KaTeX parse error: Undefined control sequence: \n at position 30: …만나려면 직선의 기울기가  \̲n̲점 
- **P5(REVIEW)**: `을 지날 때의 기울기보다는 작고,
\n점 ` — KaTeX parse error: Undefined control sequence: \n at position 20: … 때의 기울기보다는 작고,
\̲n̲점 
- **P5(REVIEW)**: `을 지날 때의 기울기보다 큰 값을 가져야 한다.
\n두 점 ` — KaTeX parse error: Undefined control sequence: \n at position 28: …다 큰 값을 가져야 한다.
\̲n̲두 점 
- **P5(REVIEW)**: `,
\n두 점 ` — KaTeX parse error: Undefined control sequence: \n at position 3: ,
\̲n̲두 점 
- **P5(REVIEW)**: `  \n이므로 ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲이므로 
- **P5(REVIEW)**: ` 이다.
\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 6:  이다.
\̲n̲∴ 
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲

### `삼각함수그래프3단계/053.webp`
- **P3(REVIEW)**: `해설  에서   \[ \therefore \ b=-2\cos\left(\frac{7a\pi}{2}\right) \quad \cdots \; \text{↵↵①  f\left(-\frac{\pi}{2}\right)=0 `
- **P5(REVIEW)**: `} \] ` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲ \] 
- **P5(REVIEW)**: ` \[ 2\cos\left(\frac{a\pi}{2}\right)+b=0 \] \[ \therefore \ b=-2\cos\left(\frac{` — KaTeX parse error: Undefined control sequence: \[ at position 2:  \̲[̲ 2\cos\left(\fr…
- **P5(REVIEW)**: `에서 \[ \cos\left(\frac{7a\pi}{2}\right)=\cos\left(\frac{a\pi}{2}\right) \quad \cd` — KaTeX parse error: Undefined control sequence: \[ at position 4: 에서 \̲[̲ \cos\left(\fra…
- **P5(REVIEW)**: `에서 \[ 0<\frac{a\pi}{2}<\frac{2}{7}\pi,` — KaTeX parse error: Undefined control sequence: \[ at position 4: 에서 \̲[̲ 0<\frac{a\pi}{…
- **P5(REVIEW)**: `에 대입하면} \] \[ b=-2\cos\left(\frac{a\pi}{2}\right)=-2\cdot\frac{\sqrt{2}}{2}=-\sq` — KaTeX parse error: Expected 'EOF', got '}' at position 7: 에 대입하면}̲ \] \[ b=-2\cos…

### `삼각함수그래프3단계/059.webp`
- **P3(REVIEW)**: `cos\left(\theta +  \pi\right) = \sin\theta,↵\sin\left(\theta +  \pi\right) = -\cos\theta\text{이므로} \newline Q(\sin\theta`

### `삼각함수그래프3단계/057.webp`
- **P3(REVIEW)**: `각  를 나타내는 동경과 각  를 나타내는 동경이 일치하므로\n 70 - \theta = 2n\pi \ (n \text{은 정수}) \n 60 = 2n\pi \ \therefore \theta = \frac{n\pi`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲이때 
- **P5(REVIEW)**: `\n즉,
` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲즉,

- **P5(REVIEW)**: `이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲

### `삼각함수그래프3단계/062.webp`
- **P3(REVIEW)**: `해설   이므로 주어진 함수의 식은  y = \sin^2\left(x - \frac{3}{2}\pi\right) - \cos(4\pi - x) + 2   = \cos^2 x - \cos x + 2    로 놓으면  `

### `삼각함수그래프3단계/061.webp`
- **P3(REVIEW)**: `해설     \[= 2\sin^2\left(x - \frac{\pi}{4} - \frac{\pi}{2}\right) - \sin\left(x - \frac{\pi}{4}\right) + k\]  \[= 2\cos^2`

### `삼각함수그래프3단계/058.webp`
- **P3(REVIEW)**: `해설   이므로  \left( \frac{1}{\sin^2 1^\circ} + \frac{1}{\sin^2 2^\circ} + \frac{1}{\sin^2 3^\circ} + \cdots + \frac{1}{\sin`

### `지수로그4단계/003.webp`
- **P3(REVIEW)**: `4 \leq n \leq 12\text{인 자연수 } n\text{에 대하여 } n^2 - 15n + 50\text{의 } n\text{제곱근 중 실수인 것의 개수를 } f(n)\text{이라 하자. } f(n) =`

### `지수로그4단계/001a.webp`
- **P3(REVIEW)**: `거듭제곱근 이해하기  인 자연수  에 대하여  이므로  f(n) = \begin{cases} 1 & (n = 3, 5, 7, 9) \\ 2 & (n = 2, 4, 6, 8, 10) \end{cases}  또한,  n`

### `지수로그4단계/006.webp`
- **P3(REVIEW)**: `2 이상의 자연수  에 대하여  에 대한 방정식  (x^n - 8)(x^{2n} - 8) = 0 의 모든 실근의 곱이  일 때,  의 값은? ① 2 ② 3 ③ 4 ④ 5 ⑤ 6`

### `지수로그4단계/005.webp`
- **P3(REVIEW)**: `두 집합  에 대하여 집합  를  라 할 때, \(보기\)에서 옳은 것만을 있는 대로 고른 것은? \n \langle 보기 \rangle \n ㄱ. \sqrt[3]{9} \in X \n ㄴ. 집합  의 원소의 개수는`

### `지수로그4단계/007.webp`
- **P3(REVIEW)**: `함수  에 대하여 다음 조건을 만족시키는 자연수  의 개수가 2일 때, 상수  의 값은?  \sqrt[3]{f(n)} 의 네제곱근 중 실수인 것을 모두 곱한 값이  이다. ① 8 ② 9 ③ 10 ④ 11 ⑤ 12`

### `지수로그4단계/005a.webp`
- **P3(REVIEW)**: `거듭제곱근의 정의를 이용하여 명제의 참, 거짓 추론하기\n집합  의 원소는  의  제곱근 중에서 실수인 것들이다.\n 일 때,  이고\n 일 때,  이므로\n집합  를 구하면\n X=\{\sqrt[3]{-9}, \s`
- **P5(REVIEW)**: `\n이다.\nㄱ. ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲이다.\nㄱ. 
- **P5(REVIEW)**: ` (참)\nㄴ. 집합 ` — KaTeX parse error: Undefined control sequence: \n at position 5:  (참)\̲n̲ㄴ. 집합 
- **P5(REVIEW)**: `의 원소의 개수는 8이다. (참)\nㄷ. 집합 ` — KaTeX parse error: Undefined control sequence: \n at position 19: …소의 개수는 8이다. (참)\̲n̲ㄷ. 집합 
- **P5(REVIEW)**: `이므로 모든 원소의 곱의 값은\n` — KaTeX parse error: Undefined control sequence: \n at position 17: …므로 모든 원소의 곱의 값은\̲n̲

### `지수로그4단계/003a.webp`
- **P3(REVIEW)**: `거듭제곱근 이해하기\n n^2 - 15n + 50 = (n-5)(n-10) \n(ⅰ)  이 홀수인 경우\n 이므로\n \n(ⅱ)  이 짝수인 경우\n 이면  이므로\n \n 이면  이므로\n \n 이면  이므로\n `
- **P5(REVIEW)**: `\n(ⅰ) ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲(ⅰ) 
- **P5(REVIEW)**: `이 홀수인 경우\n` — KaTeX parse error: Undefined control sequence: \n at position 9: 이 홀수인 경우\̲n̲
- **P5(REVIEW)**: `이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲
- **P5(REVIEW)**: `\n(ⅱ) ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲(ⅱ) 
- **P5(REVIEW)**: `이 짝수인 경우\n` — KaTeX parse error: Undefined control sequence: \n at position 9: 이 짝수인 경우\̲n̲
- **P5(REVIEW)**: `이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲
- **P5(REVIEW)**: `\n(ⅰ), (ⅱ)에 의하여\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲(ⅰ), (ⅱ)에 의하여\n
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 

### `지수로그4단계/007a.webp`
- **P3(REVIEW)**: `실수인 거듭제곱근을 이해하고 조건을 만족시키는  의 값을 지수법칙을 이용하여 구할 수 있는가?  의 네제곱근 중 실수인 것은  , \(-\sqrt[4]{\sqrt[3]{f(n)}}\) 이므로 \(\cdot \left`

### `지수로그4단계/009.webp`
- **P3(REVIEW)**: `자연수  에 대하여  이 다음과 같다.  f(n) = \begin{cases} \sqrt[4]{9 \times 2^{n+1}} & (n \text{이 홀수}) \\ \sqrt[4]{4 \times 3^n} & (n `

### `지수로그4단계/006a.webp`
- **P3(REVIEW)**: `거듭제곱근 이해하기\n(ⅰ)  이 짝수일 때\n (x^n - 8)(x^{2n} - 8) = 0 의 실근은\n x = \sqrt[n]\big{8}  또는  x = \text{±} \sqrt[2n]\big{8} \n이때`
- **P5(REVIEW)**: `의 실근은\n` — KaTeX parse error: Undefined control sequence: \n at position 6: 의 실근은\̲n̲
- **P5(REVIEW)**: `x = \sqrt[n]\big{8}` — KaTeX parse error: Expected group as argument to '\big' at position 13: x = \sqrt[n]\̲b̲i̲g̲{8}
- **P5(REVIEW)**: `x = \text{±} \sqrt[2n]\big{8}` — KaTeX parse error: Expected group as argument to '\big' at position 23: …xt{±} \sqrt[2n]\̲b̲i̲g̲{8}
- **P5(REVIEW)**: `\n이때 모든 실근의 곱이 양수이므로 모순이다.\n(ⅱ) ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲이때 모든 실근의 곱이 양수…
- **P5(REVIEW)**: `이 홀수일 때\n` — KaTeX parse error: Undefined control sequence: \n at position 8: 이 홀수일 때\̲n̲
- **P5(REVIEW)**: `의 실근은\n` — KaTeX parse error: Undefined control sequence: \n at position 6: 의 실근은\̲n̲
- **P5(REVIEW)**: `x = \sqrt[n]\big{8}` — KaTeX parse error: Expected group as argument to '\big' at position 13: x = \sqrt[n]\̲b̲i̲g̲{8}
- **P5(REVIEW)**: `x = \text{±} \sqrt[2n]\big{8}` — KaTeX parse error: Expected group as argument to '\big' at position 23: …xt{±} \sqrt[2n]\̲b̲i̲g̲{8}
- **P5(REVIEW)**: `\n이때 모든 실근의 곱은\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲이때 모든 실근의 곱은\n
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲∴ 
- **P5(REVIEW)**: `\n따라서 (ⅰ), (ⅱ)에 의하여\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 (ⅰ), (ⅱ)에 의…

### `지수로그4단계/011a.webp`
- **P3(REVIEW)**: `이차방정식의 근과 계수의 관계와 지수법칙을 이용하여 문제를 해결한다.  에 대한 이차방정식  의 두 근이  과  이므로 이차방정식의 근과 계수의 관계에 의하여  \sqrt[3]{3} + b = \sqrt[3]{81}`

### `지수로그4단계/012.webp`
- **P3(REVIEW)**: `[2019년 6월 고2 이과 30번/4점]  인 자연수  에 대하여 네 자연수  가 다음 조건을 만족시킨다. (가)  는 2 이상   이하이다.  \frac{1}{a^b} \times \frac{1}{c^d} = 2`

### `지수로그4단계/015a.webp`
- **P3(REVIEW)**: `정사각형의 넓이가   이므로 정사각형의 한 변의 길이  f(n) = \sqrt[n]{64} = 2^{\frac{6}{2n}} = 2^{\frac{3}{n}}  따라서`

### `지수로그4단계/016a.webp`
- **P3(REVIEW)**: `다항함수와 지수의 성질을 이용하여 미지수의 값을 구하는 문제를 해결한다. 점  의  좌표는 정사각형  의 한 변의 길이가  이므로   점  의  좌표는 정사각형  의 한 변의 길이가  이므로    bc = \sqrt`

### `지수로그4단계/018a.webp`
- **P3(REVIEW)**: `거듭제곱근의 정의를 이용하여 자연수의 합 추론하기 자연수  에 대하여  이 어떤 자연수의 네제곱근이 되려면  \left(n+\sqrt[4]{8}\right)^4 = \left\{(2^3)^{\frac{1}{n+1}}`

### `지수로그4단계/017a.webp`
- **P1(AUTO)** line 0: `지수법칙을 이용하여 식의 값을 구한다. $$5^{2a+b} \times 5^{a-b} = 32 \times 2$$ $$5^{(2a+b)+(a-b)} = 64$$ $$5^{3a} = 4^3$$ $$5^a = 4$$ $`
- **P3(REVIEW)**: `지수법칙을 이용하여 식의 값을 구한다.  5^{2a+b} \times 5^{a-b} = 32 \times 2   5^{(2a+b)+(a-b)} = 64   5^{3a} = 4^3   5^a = 4   5^{a-b} `
- **P5(REVIEW)**: `2a+b = \log_5 32 \quad \cdots \text{① ` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: …\cdots \text{① 

### `지수로그4단계/020a.webp`
- **P3(REVIEW)**: `거듭제곱근의 성질 이해하기  \left( \sqrt[3]{\sqrt{4}} \right)^n = 2^{\frac{5n}{6}}  이 자연수가 되도록 하는 자연수  은 6의 배수이다. \n 일 때,   \n 일 때, `
- **P5(REVIEW)**: `은 6의 배수이다. \n` — KaTeX parse error: Undefined control sequence: \n at position 12: 은 6의 배수이다. \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` \n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲
- **P5(REVIEW)**: ` 이 네 자리 자연수가 되어야 하므로 \n` — KaTeX parse error: Undefined control sequence: \n at position 22: …리 자연수가 되어야 하므로 \̲n̲

### `지수로그4단계/021a.webp`
- **P3(REVIEW)**: `거듭제곱근을 이해하여 자연수의 개수를 구한다.  이 자연수  의  제곱근이므로 거듭제곱근의 정의에 의하여  이다. 따라서  N = \left(\sqrt[5]{8}\right)^n = 8 = \left(2^3\righ`

### `지수로그4단계/019a.webp`
- **P3(REVIEW)**: `거듭제곱근의 성질 이해하기  \left( \frac{\sqrt{6} \sqrt{5}}{\sqrt{4} \sqrt{2}} \right)^m \cdot n = 5^{\frac{m}{6}} \cdot \left( \fra`

### `지수로그4단계/025.webp`
- **P3(REVIEW)**: `\sqrt{\frac{3}{2}} \times \sqrt[4]{a} 가 자연수가 되도록 하는 자연수  의 최소값을 구하시오.`

### `지수로그4단계/023a.webp`
- **P3(REVIEW)**: `거듭제곱근을 이해하여 자연수의 최소값을 구한다.   의 값이 자연수이려면  m = 2p^2 \ (p \text{는 자연수})  …… ①  \sqrt[3]{3m}   \sqrt{2m}, \sqrt[3]{3m}   m `

### `지수로그4단계/024a.webp`
- **P3(REVIEW)**: `지수법칙을 이용하여 수학 내적 문제 해결하기\n \sqrt[4]{n^m} = n^{\frac{m}{4}}  에서\n(i)  일 때\n 의 값에 관계없이 유리수가 되므로\n \n(ii)   또는  일 때\n 이 어떤 `
- **P5(REVIEW)**: ` 에서\n(i) ` — KaTeX parse error: Undefined control sequence: \n at position 4:  에서\̲n̲(i) 
- **P5(REVIEW)**: `일 때\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 일 때\̲n̲
- **P5(REVIEW)**: `의 값에 관계없이 유리수가 되므로\n` — KaTeX parse error: Undefined control sequence: \n at position 19: …에 관계없이 유리수가 되므로\̲n̲
- **P5(REVIEW)**: `\n(ii) ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲(ii) 
- **P5(REVIEW)**: `일 때\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 일 때\̲n̲
- **P5(REVIEW)**: `이 어떤 자연수의 네제곱인 수가 되어야 하므로\n` — KaTeX parse error: Undefined control sequence: \n at position 26: …네제곱인 수가 되어야 하므로\̲n̲
- **P5(REVIEW)**: `\n(iii) ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲(iii) 
- **P5(REVIEW)**: `일 때\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 일 때\̲n̲
- **P5(REVIEW)**: `이 어떤 자연수의 제곱인 수가 되어야 하므로\n` — KaTeX parse error: Undefined control sequence: \n at position 25: … 제곱인 수가 되어야 하므로\̲n̲
- **P5(REVIEW)**: `\n(i), (ii), (iii)에 의하여\n모든 순서쌍 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲(i), (ii), (iii…
- **P5(REVIEW)**: `의 개수는\n` — KaTeX parse error: Undefined control sequence: \n at position 6: 의 개수는\̲n̲

### `지수로그4단계/028a.webp`
- **P3(REVIEW)**: `지수법칙을 활용하여 문제해결하기  \left( \sqrt{3^n} \right)^{\frac{1}{2}} = \left( 3^{\frac{n}{2}} \right)^{\frac{1}{2}} = 3^{\frac{n}{`

### `지수로그4단계/026a.webp`
- **P3(REVIEW)**: `거듭제곱근과 지수법칙 이해하기  \left( \sqrt[n]{a} \right)^3 = \frac{a^3}{n}  (i)  일 때,    가 6의 약수이어야 하므로     (ii)  일 때,    가 9의 약수이어야`

### `지수로그4단계/025a.webp`
- **P3(REVIEW)**: `거듭제곱근의 성질을 이용하여 최소값을 구한다.  \sqrt{\frac{3}{2}} \times \sqrt[4]{a} = n \ (n \text{은 자연수})  라 하고 양변을 네제곱하면  \frac{9}{4}a = `

### `지수로그4단계/029.webp`
- **P3(REVIEW)**: `두 자연수  에 대하여  \sqrt{\frac{2^a \times 5^b}{2}}  이 자연수,  \sqrt[3]{\frac{3^b}{2^{a+1}}}  이 유리수일 때,  의 최소값은? ① 11 ② 13 ③ 15 `

### `지수로그4단계/030.webp`
- **P3(REVIEW)**: `자연수  에 대하여 집합  을  A_m = \left\{ \left( a, b \right) \middle| \; 2^a = \frac{m}{b}, \; a, b \text{는 자연수} \right\}  라 할 때,`

### `지수로그4단계/027a.webp`
- **P3(REVIEW)**: `a의  제곱근의 의미를 이해하고 있는가? 함수  는 최고차항의 계수가 1이고 최소값이 음수이므로 방정식  은 서로 다른 두 실근을 갖는다. (i)  이 홀수일 때, 방정식  의 실근의 개수는 1이다. 따라서 방정식 `

### `지수로그4단계/029a.webp`
- **P3(REVIEW)**: `지수법칙을 활용하여 추론하기  \sqrt{\frac{2^a \times 5^b}{2}} = 2^{\frac{a-1}{2}} \times 5^{\frac{b}{2}}  이 자연수이므로  a-1 = 2m, \ a = 2`

### `지수로그4단계/032.webp`
- **P3(REVIEW)**: `양수  와 두 실수  가  15^x = 8, \, a^y = 2, \, \frac{3}{x} + \frac{1}{y} = 2  를 만족시킬 때,  의 값은? ①   ②   ③   ④   ⑤`

### `지수로그4단계/032a.webp`
- **P3(REVIEW)**: `해설  에서  이고, \[ a^y = 2에서 \ a = 2^{\frac{1}{y}} \] \[ 15 \times a = 2^x \times 2^{\frac{1}{y}} = 2^{x + \frac{1}{y}} = 2^`

### `지수로그4단계/033.webp`
- **P3(REVIEW)**: `두 실수  에 대하여  2^a = 100, \; 25^b = 10  이 성립할 때,  의 값은? ①  \frac{13}{4} \frac{7}{2} \frac{15}{4}`

### `지수로그4단계/033a.webp`
- **P3(REVIEW)**: `지수법칙을 이용하여 수학 내적 문제 해결하기  \frac{4}{a} = 100에서\ 2^4 = 100^a 이므로\ 2^4 = 10^{2a}   \frac{2}{b} = 10에서\ 25^2 = 10^b 이므로\ 5^4`

### `지수로그4단계/031a.webp`
- **P3(REVIEW)**: `지수법칙을 이용하여 문제 해결하기  라 하면  3^a + 3^{-a} \geq 2\sqrt{3^a \cdot 3^{-a}} = 2 이므로  t \geq 2   t^2 = 2t + 8 에서  이고  t \geq 2 이`

### `지수로그4단계/035.webp`
- **P3(REVIEW)**: `두 양수  에 대하여  2^a = 3^b, \ (a-2)(b-2) = 4  일 때,  의 값은? ① 12 ② 18 ③ 36 ④ 54 ⑤ 72`

### `지수로그4단계/034a.webp`
- **P3(REVIEW)**: `정답 ①\n\n해설\n 2^{ab+a+b} = (2^a)^b \times 2^a \times 2^b \n = 3^b \times 3 \times 2^b \n = (3 \times 2)^b \times 3 \n = 5`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n\n[다른 풀이]\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n[다른 풀이]\n
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲

### `지수로그4단계/038a.webp`
- **P3(REVIEW)**: `해설  B_1 = \frac{k I_0 r_1^2}{2 (x_1^2 + r_1^2)^{\frac{3}{2}}}   B_2 = \frac{k I_0 (3r_1)^2}{2 \left( (3x_1)^2 + (3r_1)^2`

### `지수로그4단계/037.webp`
- **P3(REVIEW)**: `반지름의 길이가  인 원형 도선에 세기가  인 전류가 흐를 때, 원형 도선의 중심에서 수직 거리  만큼 떨어진 지점에서의 자기장의 세기를  라 하면 다음과 같은 관계식이 성립한다고 한다.  B = \frac{kIr^`

### `지수로그4단계/035a.webp`
- **P3(REVIEW)**: `지수법칙 이해하기\n 이라 놓으면\n 2 = k^{\frac{1}{a}}, \ 3 = k^{\frac{1}{b}} \n (a-2)(b-2) = 4 에서  \frac{a+b}{ab} = \frac{1}{2} \n \f`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 
- **P5(REVIEW)**: `\n\n[다른 풀이]\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n[다른 풀이]\n
- **P5(REVIEW)**: `이라 놓으면\n` — KaTeX parse error: Undefined control sequence: \n at position 7: 이라 놓으면\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 

### `지수로그4단계/039a.webp`
- **P3(REVIEW)**: `지수법칙을 이용하여 외적문제 해결하기   R = k \left( \frac{W}{D+10} \right)^{\frac{1}{3}}  에서  R_1 = k \left( \frac{160}{d+10} \right)^{\`

### `지수로그4단계/038.webp`
- **P3(REVIEW)**: `반지름의 길이가  인 원형 도선에 세기가  인 전류가 흐를 때, 원형 도선의 중심에서 수직 거리  만큼 떨어진 지점에서의 자기장의 세기를  라 하면 다음과 같은 관계식이 성립한다고 한다.  B = \frac{kIr^`

### `지수로그4단계/037a.webp`
- **P3(REVIEW)**: `해설    B_2 = \frac{kI_0 (3r_1)^2}{2\{(3x_1)^2 + (3r_1)^2\}^{\frac{3}{2}}}   = \frac{kI_0 \times 9r_1^2}{2(9x_1^2 + 9r_1^2`

### `지수로그4단계/042.webp`
- **P3(REVIEW)**: `자연수  에 대하여 두 집합  A = \{ \sqrt{a} \mid a \text{는 자연수}, 1 \leq a \leq k \},   B = \{ \log_{\sqrt{3}} b \mid b \text{는 자연수}`

### `지수로그4단계/043a.webp`
- **P3(REVIEW)**: `로그 문제 해결하기  라 하면  \frac{n}{6} = 2^k, \ n = 3 \times 2^{k+1} 이다.  이 100 이하인 자연수이므로 가능한  는 1, 2, 3, 4이다. 그러므로 모든 자연수  의 값의`

### `지수로그4단계/046.webp`
- **P3(REVIEW)**: `다음 조건을 만족시키는 20 이하의 모든 자연수  의 값의 합을 구하시오.  \text{log}_2(na-a^2) \text{과} \text{log}_2(nb-b^2) \text{은 같은 자연수이고}   0 < b-`

### `지수로그4단계/042a.webp`
- **P3(REVIEW)**: `지수와 로그 문제 해결하기\n집합  의 자연수인 원소는 다음과 같다.\n \begin{array}{c|cccccc}\na & 1 & 4 & 9 & 16 & 25 & 36 & 49 & 64 & \cdots \\n\sq`
- **P5(REVIEW)**: `\begin{array}{c|cccccc}\na & 1 & 4 & 9 & 16 & 25 & 36 & 49 & 64 & \cdots \\n\sqr` — KaTeX parse error: Undefined control sequence: \na at position 24: …rray}{c|cccccc}\̲n̲a̲ ̲& 1 & 4 & 9 & 1…
- **P5(REVIEW)**: `\n그리고 집합 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲그리고 집합 
- **P5(REVIEW)**: `의 자연수인 원소는 다음과 같다.\n` — KaTeX parse error: Undefined control sequence: \n at position 19: …연수인 원소는 다음과 같다.\̲n̲
- **P5(REVIEW)**: `\begin{array}{c|cccc}\nb & 3 & 9 & 27 & 81 & \cdots \\n\log_{\sqrt{3}} b & 2 & 4` — KaTeX parse error: Undefined control sequence: \nb at position 22: …{array}{c|cccc}\̲n̲b̲ ̲& 3 & 9 & 27 & …
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 
- **P5(REVIEW)**: `이다.\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 4: 이다.\̲n̲따라서 

### `지수로그4단계/047a.webp`
- **P3(REVIEW)**: `로그의 정의 이해하기  이 정의되기 위해서는  이어야 한다. 모든 실수  에 대하여 부등식  이 성립하기 위해서는 이차방정식  의 판별식을  라 하면  이어야 한다.  D = a^2 - 4(a + 8)   = a^2`

### `지수로그4단계/044a.webp`
- **P3(REVIEW)**: `로그의 성질을 이용하여 조건을 만족시키는 모든 자연수를 찾을 수 있는가?  4 \log_{64} \left( \frac{3}{4n+16} \right) = \log_8 \left( \frac{3}{4n+16} \ri`
- **P5(REVIEW)**: ` (\(m\)은 정수)의 꼴이 되어야 한다. 우선 \(4n+16\)이 3의 배수가 되어야 하므로 \(n = 3k-1\) (\(k\)는 \(1 \` — KaTeX parse error: Can't use function '\(' in math mode at position 3:  (\̲(̲m\)은 정수)의 꼴이 되어…

### `지수로그4단계/049a.webp`
- **P3(REVIEW)**: `로그의 밑과 진수의 조건을 이용하여 문제를 해결한다.  가 밑이므로  x > 0, \; x \neq 1 \quad \cdots \; \text{①}  진수  이므로  x^2 - 4x - 5 < 0, \; (x + 1`

### `지수로그4단계/050a.webp`
- **P3(REVIEW)**: `로그의 성질 이해하기   이므로  \log_a b \cdot \log_b c \cdot \log_c a = 1 = 6k^3  따라서   이므로  120k^3 = 20`

### `지수로그4단계/051.webp`
- **P3(REVIEW)**: `log_{4} 2n^2 -   \log_{2}  의 값이 40 이하의 자연수가 되도록 하는 자연수 n의 개수를 구하시오.`

### `지수로그4단계/051a.webp`
- **P3(REVIEW)**: `로그의 성질을 이용하여 조건을 만족시키는 자연수의 개수를 구할 수 있는가?  \log_4 2n^2 - \frac{1}{2} \log_2 \sqrt{n} = \log_4 2n^2 - \log_4 \sqrt{n}   =`

### `지수로그4단계/046a.webp`
- **P3(REVIEW)**: `로그의 성질과 함수의 그래프를 이용하여 주어진 조건을 만족시키는  의 값을 구할 수 있는가? 진수의 조건에서  ,  이므로  ,   또  에서  na - a^2 = nb - b^2   (b-a)(b+a-n) = 0 `

### `지수로그4단계/057.webp`
- **P3(REVIEW)**: `1보다 큰 두 실수  ,  에 대하여  \n\log_a a^2 b^3 = 3\n  이 성립할 때,  의 값은? ①  \frac{5}{2} \frac{7}{2}`
- **P5(REVIEW)**: `\n\log_a a^2 b^3 = 3\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\log_a a^2 b^3 …

### `지수로그4단계/056.webp`
- **P3(REVIEW)**: `두 양수  가 다음 조건을 만족시킬 때,  의 값은?  \begin{aligned} &\text{(가)} \ (\log_2 a)(\log_b 3^3) = 0 \\ &\text{(나)} \ \log_2 a + \log`

### `지수로그4단계/057a.webp`
- **P3(REVIEW)**: `로그의 성질을 이용하여 수학 내적 문제 해결하기\n \log_a a^2 b^3 = \log_a a^2 + \log_a b^3 \n = 2 + 3 \log_a b = 3  이므로\n \log_a b = \frac{1}`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: ` 이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 

### `지수로그4단계/053a.webp`
- **P1(AUTO)** line 0: `로그의 성질을 활용하여 추론하기 $10 < a < 100$인 실수 $a$에 대하여 $1 < \log_a < 2$ $$\log_a 10 = \frac{1}{\log_a} \text{이므로} \frac{1}{2} < \`
- **P5(REVIEW)**: `2 < \log 10a < 3 \cdots \text{① ` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: …\cdots \text{① 

### `지수로그4단계/056a.webp`
- **P3(REVIEW)**: `조건 (가)에서  이므로   또는    을 만족시키는  는 존재하지 않는다.  이므로   조건 (나)에서  이므로   따라서   [다른 풀이]  와  을 두 근으로 하고 최고차항의 계수가 1인 이차방정식은  x^2 `

### `지수로그4단계/059a.webp`
- **P3(REVIEW)**: `로그의 성질 이해하기  라고 하자.  X + Y = 2, \frac{1}{X} + \frac{1}{Y} = \frac{X + Y}{XY} = -1  이므로  이다.  (\log_a 2)^2 + (\log_b 2)^2`

### `지수로그4단계/060a.webp`
- **P3(REVIEW)**: `로그의 성질을 이해하여 상수를 구한다. 선분  를  로 외분하는 점을  라 하자. 점  의  좌표는  \frac{3\log_3 2\sqrt{2} - 4}{3 - 1} = \frac{1}{2} \cdot \left(3`

### `지수로그4단계/058a.webp`
- **P3(REVIEW)**: `로그의 정의를 이용하여 집합의 원소의 개수 추론하기  \log_a b = \frac{k}{2} \iff b = a^{\frac{k}{2}} \iff b^2 = a^k  이므로  A_k = \left\{ \frac{b`
- **P5(REVIEW)**: `A_k = \left\{ \frac{b}{a} \middle| b^2 = a^k, \right. a와\ b는\ 2\ 이상\ 100\ 이하의\ 자` — KaTeX parse error: Expected 'EOF', got '\right' at position 84: … 100\ 이하의\ 자연수 \̲r̲i̲g̲h̲t̲\}

### `지수로그4단계/062a.webp`
- **P3(REVIEW)**: `로그의 정의와 성질을 이용하여 미지수의 값을 구할 수 있는가? 수직선 위의 두 점  ,  에 대하여 선분  를  으로 내분하는 점의 좌표가 1이므로  m \cdot \log_5 12 + (1-m) \cdot \log`

### `지수로그4단계/055a.webp`
- **P3(REVIEW)**: `로그를 이용하여 추론하기  라 하면 서로 다른 유리수  의 개수는 서로 다른 순서쌍  의 개수와 같다.  \log_a b = \frac{q}{p} \text{이므로 } b = a^{\frac{q}{p}}, \ a^q`

### `지수로그4단계/067.webp`
- **P3(REVIEW)**: `1보다 큰 두 실수  에 대하여  \log_{\sqrt{3}} a = \log_9 ab  가 성립할 때,  의 값은? ① 1 ② 2 ③ 3 ④ 4 ⑤ 5`

### `지수로그4단계/065a.webp`
- **P3(REVIEW)**: `함수와 로그의 성질을 이용하여 집합의 개수를 구하는 문제를 해결한다.  이 자연수가 되려면  은  의 거듭제곱이어야 하므로  의 값은 1부터 300 사이의 자연수 중  의 거듭제곱으로 나타내어지는 수의 개수이다.  `

### `지수로그4단계/064a.webp`
- **P5(REVIEW)**: `\n(나)에서\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲(나)에서\n
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 
- **P5(REVIEW)**: ` 이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲

### `지수로그4단계/067a.webp`
- **P3(REVIEW)**: `로그의 성질을 이용하여 주어진 식의 값을 구할 수 있는가?  \n\log_{\sqrt{3}} a = 2 \log_{9} a = 4 \log_{9} a = \log_{9} a^4   \n\log_{9} a^4 = \l`
- **P5(REVIEW)**: `\n\log_{\sqrt{3}} a = 2 \log_{9} a = 4 \log_{9} a = \log_{9} a^4` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\log_{\sqrt{3}}…
- **P5(REVIEW)**: `\n\log_{9} a^4 = \log_{9} ab` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\log_{9} a^4 = …
- **P5(REVIEW)**: `\na^4 = ab` — KaTeX parse error: Undefined control sequence: \na at position 1: \̲n̲a̲^4 = ab
- **P5(REVIEW)**: `\na(a^3 - b) = 0` — KaTeX parse error: Undefined control sequence: \na at position 1: \̲n̲a̲(a^3 - b) = 0
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 

### `지수로그4단계/068.webp`
- **P3(REVIEW)**: `세 양수  가  2^a = 3^b = c, a^2 + b^2 = 2ab(a+b-1) 을 만족시킬 때,  의 값은? ①   ②   ③   ④ 1 ⑤`

### `지수로그4단계/066a.webp`
- **P3(REVIEW)**: `로그의 성질을 이용하여 식의 값을 구하는 문제 해결하기 로그의 정의로부터  이다.  \frac{1}{\log_8 a^y} + \log_8 b^x = \log_8 2^y + \log_8 2^x = \log_8 2^{\`

### `지수로그4단계/063a.webp`
- **P3(REVIEW)**: `로그의 정의와 성질을 활용하여 식의 값을 구할 수 있는가? 두 점  ,  를 지나는 직선의 방정식은  y = \frac{\log_2 b^b - \log_2 a^a}{b-a}(x-a) + \log_2 a  그러므로 이`

### `지수로그4단계/070a.webp`
- **P3(REVIEW)**: `해설 유리함수의 그래프와 로그의 성질을 이용하여 문제를 해결한다. 함수  의 그래프가 점  를 지남으로  \sqrt{b} = \frac{1}{\sqrt[3]{a}}   b^{\frac{1}{2}} = \frac{1}`

### `지수로그4단계/072a.webp`
- **P3(REVIEW)**: `로그의 성질을 이해하여 상수의 값을 구한다. 두 점  를 지나는 직선의 기울기는  \frac{k-0}{\log_2 9 - 0} = \frac{k}{2 \log_2 3}  직선  의 기울기는  \frac{\log_4 `

### `지수로그4단계/069a.webp`
- **P3(REVIEW)**: `조건 (가)에서  라 하면  에서     ①  에서     ②  에서     ③ 조건 (나)에서           ④ ①, ②, ③을 ④에 대입하면    \frac{1}{\log_k k} \times \frac{2}`

### `지수로그4단계/073a.webp`
- **P3(REVIEW)**: `로그의 성질을 활용하여 문제해결하기\n \log_n 4 \cdot \left( \frac{4}{\log_m 2 + \log_2 n} \right) \n = 2 \log_n 2 \cdot (4 \log_2 m + \l`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲이때 
- **P5(REVIEW)**: ` 에서\n` — KaTeX parse error: Undefined control sequence: \n at position 4:  에서\̲n̲
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 
- **P5(REVIEW)**: ` 이어야 한다.\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 9:  이어야 한다.\̲n̲이때 
- **P5(REVIEW)**: ` 이다.\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이다.\̲n̲
- **P5(REVIEW)**: ` 이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: ` 이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 

### `지수로그4단계/074a.webp`
- **P3(REVIEW)**: `로그의 성질을 이용하여 식의 값 구하는 문제 해결하기 주어진 식에서 로그의 밑을  로 모두 변환하면  \frac{\log_c b}{\log_c a} = 81 이므로  \log_c b = 81 \cdot \log_c `

### `지수로그4단계/075a.webp`
- **P3(REVIEW)**: `로그의 성질을 활용하여 문제해결하기\n\n 라 하면\n\n k^3 = -4\log_a b \cdot 54\log_b c \cdot \log_c a \n\n = \frac{-4\log b}{\log a} \cdot \`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: ` 이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n1이 아닌 자연수 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n1이 아닌 자연수 
- **P5(REVIEW)**: `이어야 한다.\n\n` — KaTeX parse error: Undefined control sequence: \n at position 8: 이어야 한다.\̲n̲\n
- **P5(REVIEW)**: `의 값은 2, 3, 4뿐이다.\n\n따라서 구하는 모든 자연수 ` — KaTeX parse error: Undefined control sequence: \n at position 17: … 값은 2, 3, 4뿐이다.\̲n̲\n따라서 구하는 모든 자연…
- **P5(REVIEW)**: `의 값의 합은\n\n` — KaTeX parse error: Undefined control sequence: \n at position 8: 의 값의 합은\̲n̲\n

### `지수로그4단계/077a.webp`
- **P3(REVIEW)**: `로그의 성질을 이용하여 식의 값 구하는 문제 해결하기  \log_{16}a \cdot \log_b4 = 1 에서  \frac{1}{2}\log_4a \cdot \log_b4 = 1 이므로  \frac{\log a}{`
- **P5(REVIEW)**: ` \(\therefore \log_b a = 2, \text{즉 } a = b^2\) 한편, ` — KaTeX parse error: Can't use function '\(' in math mode at position 2:  \̲(̲\therefore \log…

### `지수로그4단계/082a.webp`
- **P3(REVIEW)**: `해설    = \frac{4 \log 3}{\log n}   = 4 \log_n 3   이라 하자.  n = (3^4)^{\frac{1}{m}}   일 때,    일 때,    일 때,   따라서 모든  의 값의 합`

### `지수로그4단계/083a.webp`
- **P3(REVIEW)**: `로그를 활용하여 문제해결하기   우물의 반지름의 길이가  인 우물  의 양수량  는  Q_A = \frac{k(8^2-6^2)}{\log \left( \frac{512}{1} \right)} = \frac{28k}{`

### `지수로그4단계/080a.webp`
- **P3(REVIEW)**: `로그의 성질을 이용하여 상용로그를 계산한다.  \n  에서  \n   \n   \n로그의 밑의 변환 공식에 의하여  \n f(\log_3 6) = \frac{\log_3 18}{\log_3 12}   \n = \fr`
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n【다른 풀이】  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲【다른 풀이】  \n
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲

### `지수로그4단계/086a.webp`
- **P3(REVIEW)**: `로그를 활용하여 문제해결하기  \sqrt{3}H_A = 2H_B,\ L_A = 2L_B  이므로  \frac{k}{L_A} \log \frac{1}{S_A} = \frac{k}{2L_B} \log \frac{1}{S`

### `지수로그4단계/083.webp`
- **P3(REVIEW)**: `우물에서 단위 시간당 끌어올리는 물의 양을 양수량이라 한다. 양수량이 일정하면 우물의 수위는 일정한 높이를 유지하게 된다. 우물의 영향권의 반지름의 길이가  인 어느 지역에 반지름의 길이가  인 우물의 양수량을  ,`

### `지수로그함수4단계/005a.webp`
- **P3(REVIEW)**: `해설 함수  이므로 조건에 의하여  f(2+x)f(2-x) = a^{2+x-k} \times a^{2-x-k}   = a^{4-2k} = 1   4-2k = 0, \ k = 2 이므로 함수   ㄱ.   (참) ㄴ. `

### `지수로그함수4단계/002.webp`
- **P3(REVIEW)**: `두 상수  에 대하여 함수  를  f(x) = \begin{cases} \frac{x^2 + 3}{x} + b & (x \leq a) \\ \frac{2 - x + 5}{3b} & (x > a) \end{cases}`
- **P5(REVIEW)**: `)  \n\n` — KaTeX parse error: Undefined control sequence: \n at position 4: )  \̲n̲\n

### `지수로그함수4단계/001a.webp`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n(i) ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n(i) 
- **P5(REVIEW)**: `일 때\n\n함수 ` — KaTeX parse error: Undefined control sequence: \n at position 4: 일 때\̲n̲\n함수 
- **P5(REVIEW)**: `의 값은 감소한다.\n\n따라서 함수 ` — KaTeX parse error: Undefined control sequence: \n at position 11: 의 값은 감소한다.\̲n̲\n따라서 함수 
- **P5(REVIEW)**: `의 값은 감소하고,\n\n` — KaTeX parse error: Undefined control sequence: \n at position 11: 의 값은 감소하고,\̲n̲\n
- **P5(REVIEW)**: `의 값은 증가한다.\n\n따라서 함수 ` — KaTeX parse error: Undefined control sequence: \n at position 11: 의 값은 증가한다.\̲n̲\n따라서 함수 
- **P5(REVIEW)**: `의 그래프는 다음과 같다.\n\n함수 ` — KaTeX parse error: Undefined control sequence: \n at position 15: 의 그래프는 다음과 같다.\̲n̲\n함수 
- **P5(REVIEW)**: `이다.\n\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이다.\̲n̲\n
- **P5(REVIEW)**: `가 되어 조건을 만족시키지 않는다.\n\n(ii) ` — KaTeX parse error: Undefined control sequence: \n at position 20: … 조건을 만족시키지 않는다.\̲n̲\n(ii) 
- **P5(REVIEW)**: `일 때\n\n함수 ` — KaTeX parse error: Undefined control sequence: \n at position 4: 일 때\̲n̲\n함수 
- **P5(REVIEW)**: `의 값도 증가한다.\n\n따라서 함수 ` — KaTeX parse error: Undefined control sequence: \n at position 11: 의 값도 증가한다.\̲n̲\n따라서 함수 
- **P5(REVIEW)**: `의 값도 증가하고,\n\n` — KaTeX parse error: Undefined control sequence: \n at position 11: 의 값도 증가하고,\̲n̲\n

### `지수로그함수4단계/010.webp`
- **P3(REVIEW)**: `그림과 같이 1보다 큰 두 실수  에 대하여 직선  가 두 곡선  과 만나는 점을 각각  라 하고 직선  이 두 곡선  과 만나는 점을 각각  라 하자. <보기>에서 옳은 것만을 있는 대로 고른 것은? \( \tex`
- **P5(REVIEW)**: `ㄱ} \quad \text{② ㄷ} \quad \text{③ ㄱ, ㄴ} \quad \text{④ ㄴ, ㄷ} \quad \text{⑤ ㄱ, ㄴ, ` — KaTeX parse error: Expected 'EOF', got '}' at position 2: ㄱ}̲ \quad \text{② …

### `지수로그함수4단계/007a.webp`
- **P3(REVIEW)**: `지수함수의 그래프를 이용하여 식의 값 구하는 문제 해결하기\n\n점 A는 직선  가 곡선  과 만나는 점이므로\n\n 4 = a^{1-x} \text{에서 } x = 1 - \log_a 4 \n\n따라서 점 A의 좌`
- **P5(REVIEW)**: `\n\n따라서 점 A의 좌표는 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 점 A의 좌표는 
- **P5(REVIEW)**: `이다.\n\n점 B는 직선 ` — KaTeX parse error: Undefined control sequence: \n at position 4: 이다.\̲n̲\n점 B는 직선 
- **P5(REVIEW)**: `과 만나는 점이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 11: 과 만나는 점이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 점 B의 좌표는 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 점 B의 좌표는 
- **P5(REVIEW)**: `이다.\n\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 4: 이다.\̲n̲\n따라서 
- **P5(REVIEW)**: `\n\n점 C는 직선 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n점 C는 직선 
- **P5(REVIEW)**: `과 만나는 점이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 11: 과 만나는 점이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 점 C의 좌표는 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 점 C의 좌표는 
- **P5(REVIEW)**: `이다.\n\n점 D는 직선 ` — KaTeX parse error: Undefined control sequence: \n at position 4: 이다.\̲n̲\n점 D는 직선 
- **P5(REVIEW)**: `과 만나는 점이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 11: 과 만나는 점이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 점 D의 좌표는 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 점 D의 좌표는 
- **P5(REVIEW)**: `이다.\n\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 4: 이다.\̲n̲\n따라서 
- **P5(REVIEW)**: `\n\n사각형 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n사각형 
- **P5(REVIEW)**: `\n\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n이때 
- **P5(REVIEW)**: `\n\n사각형 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n사각형 
- **P5(REVIEW)**: `의 넓이가\n\n` — KaTeX parse error: Undefined control sequence: \n at position 6: 의 넓이가\̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 

### `지수로그함수4단계/009a.webp`
- **P3(REVIEW)**: `지수함수의 그래프를 이용하여 방정식 문제 해결하기 함수  의 그래프와 직선  가 제1사분면에서 만나는 점이 A이므로 점 A의  좌표는  2^x - 1 = t 에서  x = \log_2(1 + t)  한편, 함수  의`

### `지수로그함수4단계/010a.webp`
- **P3(REVIEW)**: `지수함수의 그래프를 이용하여 추론하기\n네 점 A, B, C, D의 좌표는 각각  ,  ,  ,   이다.\nㄱ.  이면\n AB = \log_2 a - \log_{\frac{1}{4}} a = \frac{3}{2}`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲∴ 
- **P5(REVIEW)**: ` (참)\nㄴ. ` — KaTeX parse error: Undefined control sequence: \n at position 5:  (참)\̲n̲ㄴ. 
- **P5(REVIEW)**: ` 이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲∴ 
- **P5(REVIEW)**: ` (참)\nㄷ. 직선 AC의 기울기를 ` — KaTeX parse error: Undefined control sequence: \n at position 5:  (참)\̲n̲ㄷ. 직선 AC의 기울기를 
- **P5(REVIEW)**: `이라 하면\n직선 BD의 기울기는 ` — KaTeX parse error: Undefined control sequence: \n at position 6: 이라 하면\̲n̲직선 BD의 기울기는 
- **P5(REVIEW)**: `이고,\n직선 AC와 직선 BD가 서로 수직이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이고,\̲n̲직선 AC와 직선 BD가 서…
- **P5(REVIEW)**: ` 에서\n` — KaTeX parse error: Undefined control sequence: \n at position 4:  에서\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: ` 이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲
- **P5(REVIEW)**: `\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲∴ 
- **P5(REVIEW)**: ` ... ②\n①, ②에 의하여\n` — KaTeX parse error: Undefined control sequence: \n at position 7:  ... ②\̲n̲①, ②에 의하여\n

### `지수로그함수4단계/014.webp`
- **P3(REVIEW)**: `0 \leq x \leq 8에서 정의된 함수  가 다음 조건을 만족시킨다.  \text{(가)} \quad f(x) = \begin{cases} 2^x - 1 & (0 \leq x \leq 1) \\ 2 - 2^{x`

### `지수로그함수4단계/011a.webp`
- **P3(REVIEW)**: `지수함수의 그래프를 활용하여 문제해결하기\n점 A는 두 곡선  과  가 만나는 점이므로\n 2^{x-3} + 1 = 2^{x-1} - 2, \; 3 \cdot 2^{x-3} = 3 \n \therefore \; x `
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n따라서 점 A의 좌표는 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 점 A의 좌표는 
- **P5(REVIEW)**: `이다.\n이때 점 B의 ` — KaTeX parse error: Undefined control sequence: \n at position 4: 이다.\̲n̲이때 점 B의 
- **P5(REVIEW)**: `라 하면 점 B의 좌표는\n` — KaTeX parse error: Undefined control sequence: \n at position 14: 라 하면 점 B의 좌표는\̲n̲
- **P5(REVIEW)**: `\n두 점 B, C는 기울기가 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲두 점 B, C는 기울기가 
- **P5(REVIEW)**: `인 직선 위의 점이고\n` — KaTeX parse error: Undefined control sequence: \n at position 12: 인 직선 위의 점이고\̲n̲
- **P5(REVIEW)**: `이므로 점 C의 좌표는\n` — KaTeX parse error: Undefined control sequence: \n at position 13: 이므로 점 C의 좌표는\̲n̲
- **P5(REVIEW)**: `\n점 C는 곡선 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲점 C는 곡선 
- **P5(REVIEW)**: ` 위의 점이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 9:  위의 점이므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n이때 점 B(5, 5)는 직선 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲이때 점 B(5, 5)는 직…
- **P5(REVIEW)**: ` 위의 점이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 9:  위의 점이므로\̲n̲
- **P5(REVIEW)**: `\n점 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲점 
- **P5(REVIEW)**: ` 사이의 거리는\n` — KaTeX parse error: Undefined control sequence: \n at position 9:  사이의 거리는\̲n̲
- **P5(REVIEW)**: `\n따라서 삼각형 ABC의 넓이는\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 삼각형 ABC의 넓이…

### `지수로그함수4단계/013a.webp`
- **P3(REVIEW)**: `지수함수의 그래프를 이용하여 식의 값 구하는 문제 해결하기\n\n양수  에 대하여 점  의  좌표를  라 하면 점  의  좌표는  이다.\n\n따라서  이므로  \left( \frac{1}{2} \right)^{-a`
- **P5(REVIEW)**: `이다.\n\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 4: 이다.\̲n̲\n이때 
- **P5(REVIEW)**: `이고\n\n` — KaTeX parse error: Undefined control sequence: \n at position 3: 이고\̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 점 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 점 
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `지수로그함수4단계/016a.webp`
- **P3(REVIEW)**: `지수의 성질과 지수함수의 그래프를 이용하여 주어진 값을 구할 수 있는가? 곡선   과 직선   는 다음 그림과 같다.  인 모든 실수  에 대하여   ①  y=\left(\frac{1}{5}\right)^{x-3} `

### `지수로그함수4단계/018a.webp`
- **P3(REVIEW)**: `지수함수를 이용하여 문제를 해결한다. 점  에서 직선  에 내린 수선의 발을  라 하자.  이라 하면 직선  의 기울기가  이므로  이고  이다. 직각삼각형  에서 피타고라스 정리에 의하여  (5-t)^2 + (2t`

### `지수로그함수4단계/020a.webp`
- **P3(REVIEW)**: `지수함수의 그래프를 활용하여 문제 해결하기\n점 D의 좌표를  이라 하자.\n점 D는 선분  를  으로 외분하는 점이므로\n CA : AD = 2 : 3 \n점 A의  좌표는  , 즉  \n점 C의  좌표는  , 즉`
- **P5(REVIEW)**: `\n점 A의 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲점 A의 
- **P5(REVIEW)**: `\n점 C의 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲점 C의 
- **P5(REVIEW)**: `\n직선 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲직선 
- **P5(REVIEW)**: `\n점 B는 두 직선 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲점 B는 두 직선 
- **P5(REVIEW)**: `의 교점이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 8: 의 교점이므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n이때 삼각형 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲이때 삼각형 
- **P5(REVIEW)**: `의 넓이는\n` — KaTeX parse error: Undefined control sequence: \n at position 6: 의 넓이는\̲n̲
- **P5(REVIEW)**: `\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲이때 
- **P5(REVIEW)**: `이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲
- **P5(REVIEW)**: `\n또한, ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲또한, 
- **P5(REVIEW)**: `이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲

### `지수로그함수4단계/014a.webp`
- **P3(REVIEW)**: `조건 (가)에서\n f(x) = \begin{cases} 2^x - 1 & (0 \leq x \leq 1) \\ 2 - 2^{x-1} & (1 < x \leq 2) \end{cases} \n조건 (나)에서\n(i) `
- **P5(REVIEW)**: `\n조건 (나)에서\n(i) \( n = 1 \)일 때, \( 2f(x) = f(x-2) \) \( (2 < x \leq 4) \)\n즉, \(` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲조건 (나)에서\n(i) \…
- **P5(REVIEW)**: `\n(ii) \( n = 2 \)일 때, \( 2^2 f(x) = f(x-4) \) \( (4 < x \leq 6) \)\n즉, \( f(x) ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲(ii) \( n = 2 \…
- **P5(REVIEW)**: `\n(iii) \( n = 3 \)일 때, \( 2^3 f(x) = f(x-6) \) \( (6 < x \leq 8) \)\n즉, \( f(x)` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲(iii) \( n = 3 …

### `지수로그함수4단계/023a.webp`
- **P3(REVIEW)**: `지수함수의 그래프를 활용하여 문제해결하기 점 B의 좌표가  이므로    \overline{OB} = 3 \cdot \overline{OH} \text{에서} \overline{OH} = \frac{2^a}{3}  점`

### `지수로그함수4단계/017a.webp`
- **P3(REVIEW)**: `지수함수의 그래프를 이용하여 조건을 만족시키는 사각형의 넓이를 구할 수 있는가? 두 점 A, B의  좌표를  라 하면  이므로  \overline{AB} = 2^a - (1-2^{-a}) = 2^a + 2^{-a} `

### `지수로그함수4단계/021a.webp`
- **P3(REVIEW)**: `지수함수의 그래프를 활용하여 문제를 해결한다. \( \overline{OA} : \overline{OB} = \sqrt{3} : \sqrt{19} \) 이므로 \( \overline{OA} = \sqrt{3}k \ `
- **P5(REVIEW)**: `} \] 또, 점 \( B \)는 곡선 \( y = a^x - 1 \) 위의 점이므로 \[ \frac{7}{2}k = a^{\frac{3\sqr` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲ \] 또, 점 \( B \…

### `지수로그함수4단계/024a.webp`
- **P3(REVIEW)**: `지수함수의 그래프를 이용하여 문제를 해결한다.  g(x) = 2^x, \ h(x) = \left( \frac{1}{4} \right)^{x+a} - \left( \frac{1}{4} \right)^{3+a} + 8 `

### `지수로그함수4단계/025a.webp`
- **P1(AUTO)** line 0: `지수함수의 그래프와 직선의 위치 관계를 이해하고 지수방정식을 이용하여 지수함수 식을 구할 수 있는가? 두 점 $A$, $B$는 직선 $y = x$ 위의 점이므로 $A(\alpha, \alpha)$, $B(\beta,`
- **P3(REVIEW)**: `지수함수의 그래프와 직선의 위치 관계를 이해하고 지수방정식을 이용하여 지수함수 식을 구할 수 있는가? 두 점  ,  는 직선   위의 점이므로  ,    로 놓으면  ,  ,   이때 사각형  의 넓이가 300이므로`
- **P5(REVIEW)**: `\beta^2 - \alpha^2 = (\beta - \alpha)(\beta + \alpha) = 60 \quad \cdots \; \text` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: …ots \; \text{① 

### `지수로그함수4단계/022a.webp`
- **P3(REVIEW)**: `지수함수의 그래프를 이용하여 조건을 만족시키는 점의 좌표를 구할 수 있는가? 위 그림과 같이 두 점  ,  에서  축에 내린 수선의 발을 각각  ,  라 하자.  PB = k 라 하면  AP = \overline{A`

### `지수로그함수4단계/031a.webp`
- **P3(REVIEW)**: `지수함수를 활용하여 문제 해결하기 함수  에서  f(x) = 4^{x-a} - 8 \cdot 2^{x-a}   = 2^{2-a} \cdot 2^{2x} - 2^3 \cdot 2^{-a} \cdot 2^x   = 2^`

### `지수로그함수4단계/032.webp`
- **P3(REVIEW)**: `양의 실수  에 대하여 함수  를  f(x) = \begin{cases} 2x + 2^x - a - 2 & (x < a) \\ 2^{-x} + 2^a - 2 & (x \ge a) \end{cases}  라고 할 때,`

### `지수로그함수4단계/028a.webp`
- **P3(REVIEW)**: `지수함수의 그래프와 이차함수의 그래프를 이용하여 주어진 부등식의 참, 거짓 판별하기\n\n ,  \n 로 놓으면 두 함수  ,  의 그래프는 오른쪽 그림과 같다.\n\nㄱ.  ,  \n  이므로\n\n f\left(`
- **P5(REVIEW)**: `\n\nㄴ. 두 점 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\nㄴ. 두 점 
- **P5(REVIEW)**: `를 지나는 직선의 기울기는\n\n` — KaTeX parse error: Undefined control sequence: \n at position 15: 를 지나는 직선의 기울기는\̲n̲\n
- **P5(REVIEW)**: `이고,\n\n두 점 ` — KaTeX parse error: Undefined control sequence: \n at position 4: 이고,\̲n̲\n두 점 
- **P5(REVIEW)**: `를 지나는 직선의 기울기는 1이다.\n두 점 ` — KaTeX parse error: Undefined control sequence: \n at position 20: …는 직선의 기울기는 1이다.\̲n̲두 점 
- **P5(REVIEW)**: `를 지나는 직선의 기울기가 1보다 작으므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 24: …의 기울기가 1보다 작으므로\̲n̲\n
- **P5(REVIEW)**: `\n\nㄷ. ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\nㄷ. 
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n즉, ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n즉, 
- **P5(REVIEW)**: ` ㉠\n\n또, 오른쪽 그림과 같이 이차함수 ` — KaTeX parse error: Undefined control sequence: \n at position 3:  ㉠\̲n̲\n또, 오른쪽 그림과 같이…
- **P5(REVIEW)**: `축에 대하여 대칭이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 13: 축에 대하여 대칭이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n즉, ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n즉, 
- **P5(REVIEW)**: `\n\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n이때 
- **P5(REVIEW)**: ` 이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: ` ㉡\n\n㉠, ㉡에서 ` — KaTeX parse error: Undefined control sequence: \n at position 3:  ㉡\̲n̲\n㉠, ㉡에서 

### `지수로그함수4단계/038.webp`
- **P3(REVIEW)**: `두 양수  ,  에 대하여  에서 정의된 함수  는  f(x) = \begin{cases} a(4-x^2) & (0 \leq x < 3) \\ b \log_2 \frac{x}{3} - 5a & (x \geq 3) \`

### `지수로그함수4단계/036a.webp`
- **P3(REVIEW)**: `해설 곡선  를 원점에 대하여 대칭이동한 곡선은   이를 다시  축의 방향으로   만큼 평행이동한 곡선은  y = -\log_2 \left\{ -\left( x - \frac{5}{2} \right) \right\}`

### `지수로그함수4단계/039a.webp`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n점 A의 좌표는 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲점 A의 좌표는 
- **P5(REVIEW)**: `\n점 B의 좌표를 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲점 B의 좌표를 
- **P5(REVIEW)**: `이라 하면\n` — KaTeX parse error: Undefined control sequence: \n at position 6: 이라 하면\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n이때 점 C의 좌표를 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲이때 점 C의 좌표를 
- **P5(REVIEW)**: `이라 하면\n` — KaTeX parse error: Undefined control sequence: \n at position 6: 이라 하면\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n또, 점 D의 좌표를 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲또, 점 D의 좌표를 
- **P5(REVIEW)**: `이라 하면\n` — KaTeX parse error: Undefined control sequence: \n at position 6: 이라 하면\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲이때 
- **P5(REVIEW)**: ` 이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 
- **P5(REVIEW)**: `에서\n` — KaTeX parse error: Undefined control sequence: \n at position 3: 에서\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲

### `지수로그함수4단계/042a.webp`
- **P3(REVIEW)**: `로그함수의 그래프를 이용하여 문제 해결하기 직선  가  축과 만나는 점을  라 하면 삼각형  와 삼각형  의 넓이의 비가  이므로  \frac{1}{2} \cdot \overline{CB} \cdot \overlin`

### `지수로그함수4단계/041a.webp`
- **P3(REVIEW)**: `로그함수의 그래프를 이용하여 명제 추론하기\n\n 라 하자.\n\nㄱ. 점  는 함수  의 그래프 위의 점이므로\n\n , 즉   (참)\n\nㄴ.  이면  이고\n\n 이면  이다.\n\n 이고  이므로\n\n ,`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n한편, ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n한편, 
- **P5(REVIEW)**: `에서\n\n` — KaTeX parse error: Undefined control sequence: \n at position 3: 에서\̲n̲\n
- **P5(REVIEW)**: `이다.\n\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 4: 이다.\̲n̲\n따라서 
- **P5(REVIEW)**: `이다.\n\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 4: 이다.\̲n̲\n∴ 

### `지수로그함수4단계/040a.webp`
- **P3(REVIEW)**: `로그함수의 그래프를 이용하여 명제 추론하기\nㄱ.  일 때,  ,  이므로\n S(1) = \frac{1}{2} \cdot (4-2) \cdot 1 = 1 \text{ (참)} \nㄴ.  일 때,  ,  이므로\n `
- **P5(REVIEW)**: `\nㄴ. ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲ㄴ. 
- **P5(REVIEW)**: `이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 
- **P5(REVIEW)**: ` (참)\nㄷ. 0이 아닌 모든 실수 ` — KaTeX parse error: Undefined control sequence: \n at position 5:  (참)\̲n̲ㄷ. 0이 아닌 모든 실수 
- **P5(REVIEW)**: `에 대하여\n` — KaTeX parse error: Undefined control sequence: \n at position 6: 에 대하여\̲n̲
- **P5(REVIEW)**: `이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n따라서\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서\n
- **P5(REVIEW)**: `이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲

### `지수로그함수4단계/052a.webp`
- **P3(REVIEW)**: `로그함수의 그래프를 활용하여 추론하기  일 때,  ,  ,  ,  ,  이고  \overline{DE} = \frac{15}{4}  이므로    2^a = 4, \ a = 2   \therefore \overline`

### `지수로그함수4단계/046a.webp`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `지수로그함수4단계/044a.webp`
- **P3(REVIEW)**: `로그함수의 성질을 활용하여 추론하기\n f(x) = \begin{cases} x+2 & (0 \leq x < 1) \\ -2x+5 & (1 \leq x \leq 2) \end{cases} \n f(x) = f(x),`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n따라서 함수 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 함수 
- **P5(REVIEW)**: `을 지난다.\n(i) ` — KaTeX parse error: Undefined control sequence: \n at position 7: 을 지난다.\̲n̲(i) 
- **P5(REVIEW)**: `의 그래프가 만나는 점의 개수는 5이다.\n` — KaTeX parse error: Undefined control sequence: \n at position 23: …만나는 점의 개수는 5이다.\̲n̲
- **P5(REVIEW)**: `\n(ii) ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲(ii) 
- **P5(REVIEW)**: `의 그래프가 만나는 모든 점의 개수는\n` — KaTeX parse error: Undefined control sequence: \n at position 21: …가 만나는 모든 점의 개수는\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n(iii) ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲(iii) 
- **P5(REVIEW)**: `의 그래프가 만나는 모든 점의 개수는\n` — KaTeX parse error: Undefined control sequence: \n at position 21: …가 만나는 모든 점의 개수는\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n(i), (ii), (iii)에 의하여\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲(i), (ii), (iii…

### `지수로그함수4단계/050a.webp`
- **P3(REVIEW)**: `두 점  ,  에서  축에 내린 수선의 발을 각각  ,  이라 하자. 사각형  과 삼각형  은 닮음이므로   점  의 좌표를  이라 하면 점  의 좌표는      25a^2 - 30a + 9 = 10a - 3   2`

### `지수로그함수4단계/051a.webp`
- **P5(REVIEW)**: ` \(\overline{BD}\)와 \(\overline{CA}\)가 평행하고, \(\overline{BD} = \overline{CA} = a` — KaTeX parse error: Can't use function '\(' in math mode at position 2:  \̲(̲\overline{BD}\)…
- **P5(REVIEW)**: `라 하면 \(\overline{CA}=a\), \(\overline{AH}=\log_2 k\)이므로 ` — KaTeX parse error: Can't use function '\(' in math mode at position 6: 라 하면 \̲(̲\overline{CA}=a…

### `지수로그함수4단계/056a.webp`
- **P3(REVIEW)**: `로그함수의 그래프를 활용하여 문제 해결하기 두 점 A, B의 좌표를 각각  라 하면 직선  의 기울기가   이므로  \frac{\log_2 4b - \log_2 2a}{b-a} = \frac{1}{2}  에서  \l`

### `지수로그함수4단계/058.webp`
- **P5(REVIEW)**: `  \n이 있다. 직선 ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲이 있다. 직선 

### `지수로그함수4단계/055a.webp`
- **P1(AUTO)** line 0: `로그함수를 활용하여 문제를 해결한다. 두 점 A, B의 좌표를 각각 $(x_1, y_1), (x_2, y_2)$라 하자. $-\log_2(-x) = \log_2(x+2a)$에서 $$\log_2(x+2a) + \log`
- **P3(REVIEW)**: `로그함수를 활용하여 문제를 해결한다. 두 점 A, B의 좌표를 각각  라 하자.  에서  \log_2(x+2a) + \log_2(-x) = 0   \log_2\{-x(x+2a)\} = 0   -x(x+2a) = 1 `
- **P5(REVIEW)**: `\therefore x^2 + 2ax + 1 = 0 \quad \cdots \text{① ` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: …\cdots \text{① 

### `지수로그함수4단계/057a.webp`
- **P3(REVIEW)**: `지수함수와 로그함수의 그래프를 이해하여 사각형의 넓이를 구한다. 점 A의 좌표는  이고  이므로 점 B의 좌표는  이다. 직선  의 기울기가  이고  이므로 두 점 B, C의  좌표의 차와  좌표의 차는 모두 2이다`

### `지수로그함수4단계/059a.webp`
- **P3(REVIEW)**: `로그함수의 그래프가 만나는 점이 조건을 만족하도록 하는  의 값을 구할 수 있는가? 진수 조건에서    - \log_n (x+3) + 1 = \log_n \frac{n}{x+3}  이므로  \log_n x = \lo`

### `지수로그함수4단계/064a.webp`
- **P3(REVIEW)**: `로그의 성질을 이용하여 선분의 길이를 구하는 문제를 해결한다. \n\n 에서  이므로   \n\n 에서  이므로   \n\n \therefore A_m B_m = 2^m - \log_3 m  \n\n 이 자연수이기 `
- **P5(REVIEW)**: ` \n\n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n
- **P5(REVIEW)**: `이 음이 아닌 정수이어야 한다. \n\n` — KaTeX parse error: Undefined control sequence: \n at position 19: …이 아닌 정수이어야 한다. \̲n̲\n
- **P5(REVIEW)**: ` \n\n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n
- **P5(REVIEW)**: ` \n\n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n
- **P5(REVIEW)**: ` \n\n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n
- **P5(REVIEW)**: ` \n\n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n

### `지수로그함수4단계/063a.webp`
- **P3(REVIEW)**: `로그함수를 활용하여 문제해결하기\n \overline{OC} = \overline{CA} = \overline{AB}  이므로 점 A의 좌표는  이고, 점 B의 좌표는  이다.\n점 A는 곡선   위의 점이므로\n `
- **P5(REVIEW)**: `이다.\n점 A는 곡선 ` — KaTeX parse error: Undefined control sequence: \n at position 4: 이다.\̲n̲점 A는 곡선 
- **P5(REVIEW)**: ` 위의 점이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 9:  위의 점이므로\̲n̲
- **P5(REVIEW)**: `\n점 B는 곡선 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲점 B는 곡선 
- **P5(REVIEW)**: ` 위의 점이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 9:  위의 점이므로\̲n̲
- **P5(REVIEW)**: `\n①, ②를 연립하면 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲①, ②를 연립하면 
- **P5(REVIEW)**: `에서\n` — KaTeX parse error: Undefined control sequence: \n at position 3: 에서\̲n̲
- **P5(REVIEW)**: `\n곡선 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲곡선 
- **P5(REVIEW)**: `라 하면\n` — KaTeX parse error: Undefined control sequence: \n at position 5: 라 하면\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n②에서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲②에서 
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲

### `지수로그함수4단계/066a.webp`
- **P3(REVIEW)**: `두 곡선  와  는 선  에 대하여 대칭이고, 직선  는 직선  에 수직이므로 두 점  는 직선  에 대하여 대칭이다. 점  의 좌표를  이라 하면 점  의 좌표는  이므로  이다. 선분  의 중점을  이라 하면  `

### `지수로그함수4단계/065a.webp`
- **P3(REVIEW)**: `로그함수의 그래프를 이용하여 문제를 해결한다. \( y = \log_3(x+3) \) \( y = \log_3|2x| \) \( x < 0 \)일 때의 교점 \( A \)의 \( x \)좌표는 방정식 \( \log_`
- **P5(REVIEW)**: ` 이므로 점 \( A \)를 지나고 직선 \( AB \)와 수직인 직선의 방정식은 \( y - \log_3 2 = -4(x + 1) \) \( ` — KaTeX parse error: Can't use function '\(' in math mode at position 8:  이므로 점 \̲(̲ A \)를 지나고 직선 \…

### `지수로그함수4단계/069a.webp`
- **P3(REVIEW)**: `로그함수의 그래프와 원이 만나는 두 점이 원의 지름임을 이용하여 미지수의 값을 구할 수 있는가?  로 놓으면 선분  의 중점이 원의 중심  이므로  \frac{p+q}{2} = \frac{5}{4}, \frac{\l`

### `지수로그함수4단계/068a.webp`
- **P5(REVIEW)**: `\n곡선 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲곡선 
- **P5(REVIEW)**: `축과 만나므로\n` — KaTeX parse error: Undefined control sequence: \n at position 8: 축과 만나므로\̲n̲
- **P5(REVIEW)**: `\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲∴ 
- **P5(REVIEW)**: `\n점 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲점 
- **P5(REVIEW)**: `라 하면\n삼각형 ` — KaTeX parse error: Undefined control sequence: \n at position 5: 라 하면\̲n̲삼각형 
- **P5(REVIEW)**: `의 넓이는\n` — KaTeX parse error: Undefined control sequence: \n at position 6: 의 넓이는\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲∴ 
- **P5(REVIEW)**: `\n점 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲점 
- **P5(REVIEW)**: ` 위의 점이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 9:  위의 점이므로\̲n̲
- **P5(REVIEW)**: `\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲∴ 
- **P5(REVIEW)**: `\n선분 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲선분 
- **P5(REVIEW)**: `이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 

### `지수로그함수4단계/073a.webp`
- **P3(REVIEW)**: `로그함수의 그래프를 이용하여 문제 해결하기  에서 함수  는  일 때 최댓값  ,  일 때 최솟값  를 갖는다.      k^2 - 9k - 36 = 0   (k-12)(k+3) = 0  이때  이므로`

### `지수로그함수4단계/074.webp`
- **P3(REVIEW)**: `양수  에 대하여  에서 정의된 함수  는  f(x) = \begin{cases} -x^2 + 6x & (-1 \leq x < 6) \\ a \log_4 (x-5) & (x > 6) \end{cases}  이다.  `

### `지수로그함수4단계/074a.webp`
- **P3(REVIEW)**: `로그함수의 그래프를 이해하고 함수  가 최소값을 갖도록 하는  의 값의 범위를 구할 수 있는가?  일 때, 구간  에서 함수  는  에서 최댓값 5를 가지므로   한편, 함수  는 직선  에 대하여 대칭이고  이므로`

### `지수로그함수4단계/077a.webp`
- **P3(REVIEW)**: `지수함수와 로그함수를 활용하여 문제 해결하기  에서 함수  의 최댓값을  , 최솟값을  이라 하자. (i)  인 경우  a-1 < a+1 < 1 이므로  M = f(a-1) = -2^{a-1} + 2   m = f(`

### `지수로그함수4단계/078a.webp`
- **P3(REVIEW)**: `지수함수의 그래프를 활용하여 문제해결하기\n점  의 좌표를  라 하면 점  는 선분  를  로 외분하는 점이므로 점  의 좌표는  이다.\n함수  의 그래프와 함수  의 그래프는 직선  에 대하여 서로 대칭이고,\n`
- **P5(REVIEW)**: `에서\n` — KaTeX parse error: Undefined control sequence: \n at position 3: 에서\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n이때 점 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲이때 점 
- **P5(REVIEW)**: ` 위의 점이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 9:  위의 점이므로\̲n̲
- **P5(REVIEW)**: `\n점 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲점 
- **P5(REVIEW)**: ` 위의 점이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 9:  위의 점이므로\̲n̲
- **P5(REVIEW)**: `\n두 식을 연립하면\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲두 식을 연립하면\n
- **P5(REVIEW)**: `\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲이때 
- **P5(REVIEW)**: `이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲

### `지수로그함수4단계/079a.webp`
- **P3(REVIEW)**: `지수함수와 로그함수를 활용하여 문제 해결하기 함수  의 역함수  의 그래프에 대하여 함수  의 그래프는 함수  의 그래프를  축의 방향으로  만큼,  축의 방향으로  만큼 평행이동한 그래프와 일치한다. 함수  의 그`

### `지수로그함수4단계/072a.webp`
- **P3(REVIEW)**: `(i)  일 때\n 이고  이므로\n두 함수  와  의 그래프는 그림과 같다.\n방정식  의 해는  의 그래프와 직선  의 세 교점의   좌표이다.\n그래서 함수  의 그래프는 점  을 지나며\n 이므로  을 만족시`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: ` ②\n① - ②에서\n` — KaTeX parse error: Undefined control sequence: \n at position 3:  ②\̲n̲① - ②에서\n
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 

### `지수로그함수4단계/082a.webp`
- **P3(REVIEW)**: `지수함수와 로그함수의 역함수 관계를 이용하여 식의 값을 구하는 문제 해결하기\n직선  의 기울기가  이고\n곡선  를  축의 방향으로  만큼,\n 축의 방향으로  만큼 평행이동한 것이\n곡선  이므로\n점 B를  축`
- **P5(REVIEW)**: `\n또, 점 A의 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲또, 점 A의 
- **P5(REVIEW)**: `이고\n두 함수 ` — KaTeX parse error: Undefined control sequence: \n at position 3: 이고\̲n̲두 함수 
- **P5(REVIEW)**: `는 역함수 관계이므로\nB` — KaTeX parse error: Undefined control sequence: \nB at position 12: 는 역함수 관계이므로\̲n̲B̲
- **P5(REVIEW)**: `\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲이때 
- **P5(REVIEW)**: `이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n따라서 점 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 점 
- **P5(REVIEW)**: ` 위의 점이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 9:  위의 점이므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲

### `지수로그함수4단계/085a.webp`
- **P3(REVIEW)**: `두 점 A, B의 좌표는  이므로 두 사각형의 넓이  는  f(t) = \frac{1}{2}(\log_2 t + \log_2 2t)(2t - t) = \frac{t}{2} \log_2 2t^2   g(t) = \fr`

### `지수로그함수4단계/086a.webp`
- **P3(REVIEW)**: `해설 직선  이  축과 만나는 점을  라 하자. (i)  일 때, 점  , 점  이므로    이므로   따라서  일 때 주어진 식을 만족시키지 않는다. (ii)  일 때, 점  의 좌표는   직선  이 직선  과 만`

### `지수로그함수4단계/089a.webp`
- **P3(REVIEW)**: `지수함수를 이용하여 추론하기\n\n곡선  을 직선  에 대하여 대칭이동하면 곡선  이고  이므로 점 P는 직선   위의 점이다.\n\n점 P의 좌표를  라 하면 점 P는 곡선   위의 점이므로  \n\n삼각형 OHP`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n∴ 
- **P5(REVIEW)**: `\n\n따라서 곡선 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 곡선 
- **P5(REVIEW)**: `이 점 P(2, 2)를 지나므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 18: …점 P(2, 2)를 지나므로\̲n̲\n
- **P5(REVIEW)**: `\n\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n∴ 

### `지수로그함수4단계/091.webp`
- **P3(REVIEW)**: `자연수  에 대하여 함수  를  f(x) = \begin{cases} 3x^2 + 2 - n & (x < 0) \\ \log_2(x+4) - n & (x \geq 0) \end{cases}  이라 하자. 실수  에 `

### `지수로그함수4단계/088a.webp`
- **P3(REVIEW)**: `지수함수와 로그함수의 그래프를 이용하여 상수의 값을 구하는 문제를 해결한다. 선분  를 지름으로 하는 원의 중심을 점  라 할 때, 점  는 선분  의 중점이다. 두 곡선  ,  를  축의 방향으로 각각  만큼 평행`

### `지수로그함수4단계/083a.webp`
- **P1(AUTO)** line 0: `지수함수와 로그함수의 성질을 활용하여 문제 해결하기\n점 $B$에서 $x$축에 내린 수선의 발을 $P$,\n점 $A$에서 선분 $BP$에 내린 수선의 발을 $Q$,\n점 $C$에서 선분 $BP$에 내린 수선의 발을 `
- **P3(REVIEW)**: `지수함수와 로그함수의 성질을 활용하여 문제 해결하기\n점  에서  축에 내린 수선의 발을  ,\n점  에서 선분  에 내린 수선의 발을  ,\n점  에서 선분  에 내린 수선의 발을  라 하자.\n\n직선  의 기울`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: ` 이고\n` — KaTeX parse error: Undefined control sequence: \n at position 4:  이고\̲n̲
- **P5(REVIEW)**: ` 이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲
- **P5(REVIEW)**: `\n또, ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲또, 
- **P5(REVIEW)**: ` 이므로\n두 삼각형 ` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲두 삼각형 
- **P5(REVIEW)**: `는 합동이다.\n즉, ` — KaTeX parse error: Undefined control sequence: \n at position 8: 는 합동이다.\̲n̲즉, 
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n두 점 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲두 점 
- **P5(REVIEW)**: ` 위에 있으므로\n` — KaTeX parse error: Undefined control sequence: \n at position 9:  위에 있으므로\̲n̲
- **P5(REVIEW)**: `y_1 = \log_4 ax_1 \quad \cdots \quad \text{① ` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: … \quad \text{① 
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n\n점 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n점 
- **P5(REVIEW)**: ` 위에 있으므로\n` — KaTeX parse error: Undefined control sequence: \n at position 9:  위에 있으므로\̲n̲
- **P5(REVIEW)**: `\n\n①, ②을 연립하면 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n①, ②을 연립하면 
- **P5(REVIEW)**: `\n\n①, ③에 의하여 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n①, ③에 의하여 
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n따라서 옳은 것은 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 옳은 것은 

### `지수로그함수4단계/062a.webp`
- **P3(REVIEW)**: `로그함수의 그래프를 이용하여 문제 해결하기 조건 (가)에 의하여 삼각형  의 넓이를  라 하면 삼각형  의 넓이는  이다.  에서  이고 점  에서  축에 내린 수선의 발을  이라 하면  이다.  라 하면  이므로 `

### `지수로그함수4단계/087a.webp`
- **P3(REVIEW)**: `지수함수와 로그함수의 그래프를 이용하여 문제를 해결할 수 있는가? 두 점  의 좌표를 각각  이라 하면 조건 (가)에 의하여  \frac{2^{b_n} - 2^{a_n}}{b_n - a_n} = 3  조건 (나)에 `

### `지수로그함수4단계/094.webp`
- **P3(REVIEW)**: `그림과 같이 좌표평면에서 곡선   위의 점  가 제2사분면에 있다. 점  를 직선  에 대하여 대칭이동시킨 점  와 곡선   위의 점  에 대하여   이다.  \overline{PR} = \frac{5\sqrt{2}`

### `지수로그함수4단계/090a.webp`
- **P3(REVIEW)**: `지수함수와 로그함수를 이용하여 문제를 해결한다. 두 점  와  의  좌표는 모두  이므로  ,  이다. 두 점  와  의  좌표는 모두  이므로  ,  이다. 두 선분  와  가 만나는 점을  라 하면  이므로  \`

### `지수로그함수4단계/096a.webp`
- **P3(REVIEW)**: `지수함수와 로그함수의 그래프를 활용하여 추론하기 두 곡선  ,  은 직선  에 대하여 대칭이므로 점  가 주어진 영역에 포함되면 점  도 포함된다. 영역의 내부 또는 경계에 포함되는 점의 개수가 4일 때의 네 점은 `

### `지수로그함수4단계/094a.webp`
- **P3(REVIEW)**: `지수함수와 로그함수의 그래프를 이용하여 문제를 해결한다. 점 P의 좌표를    이라 하면 점 P를 직선  에 대하여 대칭이동시킨 점 Q의 좌표는  이다.  이고 직선  의 기울기가  이므로 두 점 Q, R의  좌표는`
- **P5(REVIEW)**: `a^t = -\frac{3}{4}t \tag{\textcircled{1}}` — KaTeX parse error: \tag works only in display equations
- **P5(REVIEW)**: `a^{2t} + t^2 = \frac{25}{4} \tag{\textcircled{2}}` — KaTeX parse error: \tag works only in display equations

### `지수로그함수4단계/092a.webp`
- **P3(REVIEW)**: `지수함수와 로그함수의 그래프의 성질을 이용하여 삼각형의 넓이를 구할 수 있는가? 곡선  은 곡선  을  축의 방향으로 1만큼 평행이동한 것이고, 곡선  은 곡선  를  축의 방향으로 1만큼 평행이동한 것이므로 두 곡`

### `지수로그함수4단계/093a.webp`
- **P3(REVIEW)**: `지수함수와 로그함수의 그래프를 이용하여 두 교점의 관계를 추론한다.  ,  ,  의 그래프는 다음 그림과 같다. \[ 0 < x < 1 \]일 때, 두 곡선  ,  의 교점은 직선   위에 있으므로  이고 \[ x_`

### `지수로그함수4단계/097a.webp`
- **P1(AUTO)** line 0: `지수방정식을 이용하여 그래프의 성질을 추론한다. 점 $(2a-p, a-q)$가 곡선 $y = f(x)$ 위의 점이므로 $f(p) = q, f(2a-p) = a-q$에서 $$\frac{3^{2a-p}}{3^{2a-p}`
- **P3(REVIEW)**: `지수방정식을 이용하여 그래프의 성질을 추론한다. 점  가 곡선   위의 점이므로  에서  \frac{3^{2a-p}}{3^{2a-p} + 3} = a-q = a = \frac{3^p}{3^p + 3} \quad \c`
- **P5(REVIEW)**: `\frac{3^{2a-p}}{3^{2a-p} + 3} = a-q = a = \frac{3^p}{3^p + 3} \quad \cdots \bigc` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: …igcirc \text{① 

### `삼각함수그래프/004.webp`
- **P3(REVIEW)**: `그림과 같이 두 점  ,  을 각각 중심으로 하고 반지름의 길이가 3인 두 원  ,  이 한 평면 위에 있다. 두 원  ,  이 만나는 점을 각각  ,  라 할 때,  \angle AOB = \frac{5}{6} \`

### `삼각함수그래프/001.webp`
- **P3(REVIEW)**: `그림과 같이 반지름의 길이가 4, 호의 길이가  인 부채꼴  가 있다. 부채꼴  의 넓이를  , 선분   위의 점  에 대하여 삼각형  의 넓이를  라 하자.  \frac{S}{T} = \pi 일 때, 선분  의 길`

### `삼각함수그래프/018.webp`
- **P3(REVIEW)**: `두 실수  ,  에 대하여 함수  를  f(x) = a \sin \frac{\pi}{6} (x-1) + b  라 하고, 양수  에 대하여  에서 함수  의 그래프가 직선  와 만나는 점의 개수를  라 하자.  ,  `

### `삼각함수그래프/015.webp`
- **P3(REVIEW)**: `그림과 같이 두 양수  ,  에 대하여 함수  f(x) = a \sin bx \left( 0 \leq x \leq \frac{\pi}{b} \right)  의 그래프가 직선  와 만나는 점을  ,  축과 만나는 점 `

### `삼각함수그래프/029.webp`
- **P3(REVIEW)**: `0 \leq x \leq 2\pi에서 정의된 함수  의 그래프가 두 직선  ,  와 만나는 점의 개수가 각각 3, 7이 되도록 하는 두 양수  ,  에 대하여  의 값을 구하시오.`

### `삼각함수그래프/035.webp`
- **P3(REVIEW)**: `두 자연수  에 대하여 세 함수  가 다음 조건을 만족시킨다. (가)  일 때, 방정식  의 서로 다른 실근의 개수는 홀수이다. (나)  일 때, 방정식  의 서로 다른 모든 실근의 합이 56이 되도록 하는 실수  `

### `삼각함수그래프/034.webp`
- **P3(REVIEW)**: `자연수  에 대하여  에서 정의된 함수  를  f(x) = \begin{cases} \frac{1}{2} \sin \pi x & (0 \leq x < k) \\ \left(\frac{2}{3}\right)^{x-k}`

### `삼각함수그래프/036.webp`
- **P3(REVIEW)**: `두 실수  와  에 대하여  에서 정의된 함수  는  f(x) = \begin{cases} \sin x - \frac{1}{2} & (0 \leq x < a) \\ k \sin x - \frac{1}{2} & (a `

### `삼각함수그래프/041.webp`
- **P3(REVIEW)**: `자연수  에 대하여 집합  를  A_k = \left\{ \sin \frac{2(m-1)}{k} \pi \mid m \text{은 자연수} \right\}  라 할 때, <보기>에서 옳은 것만을 있는 대로 고른 것은`

### `삼각함수그래프/044.webp`
- **P3(REVIEW)**: `자연수  에 대하여  \frac{n-1}{6}\pi \leq x \leq \frac{n+2}{6}\pi 에서 함수  의 최댓값을  이라 하자. 40 이하의 자연수  에 대하여  가 무리수가 되도록 하는 모든  의 값`

### `삼각함수그래프/046.webp`
- **P3(REVIEW)**: `0 \leq x < 2\pi 일 때, 곡선  와 직선  가 만나는 서로 다른 점의 개수는? ① 3 ② 6 ③ 9 ④ 12 ⑤ 15`

### `삼각함수그래프/047a.webp`
- **P3(REVIEW)**: `해설 삼각함수를 이용하여 추론하기 함수  의 그래프는 다음과 같다. 함수  의 주기는   함수  의 주기는   두 함수  의 주기가 서로 같으므로  \frac{2\pi}{|a|} = \frac{\pi}{3}   는 `

### `삼각함수그래프/048a.webp`
- **P3(REVIEW)**: `삼각함수의 그래프를 이용하여 조건에 맞는 함수 추론하기 함수  의 주기가  이고  -2 \leq 2 \sin \frac{\pi}{k} x \leq 2  이므로`

### `삼각함수그래프/049.webp`
- **P3(REVIEW)**: `두 실수  와 두 함수  에 대하여  에서 정의된 함수  h(x) = \frac{|f(x) - g(x)| + f(x) + g(x)}{2} 가 다음 조건을 만족시킨다. (가) 함수  의 최소값은  이다. (나)  인 `

### `삼각함수그래프/051.webp`
- **P3(REVIEW)**: `그림과 같이 좌표평면에서 직선  가 두 원  ,  와 제2사분면에서 만나는 점을 각각 A, B라 하자. 점 C(3, 0)에 대하여  ,  라 할 때,  의 값은? \( \text{단, O는 원점이고, } \frac{`

### `삼각함수그래프/051a.webp`
- **P3(REVIEW)**: `직선  가 원  와 제2사분면에서 만나는 점 A의 좌표는  이고  OA = \sqrt{5}  이므로   직선  가 원  와 제2사분면에서 만나는 점 B의 좌표는  이고  OB = 3  이므로   따라서`

### `삼각함수그래프/050a.webp`
- **P3(REVIEW)**: `삼각함수의 그래프의 성질을 활용하여 문제를 해결한다. 함수  의 그래프가 직선  와 만나는 점의  좌표는  일 때 방정식  \left| 4\sin\left(ax - \frac{\pi}{3}\right) + 2 \ri`

### `삼각함수그래프/049a.webp`
- **P3(REVIEW)**: `해설  이고  이므로 함수  는  h(x) = \begin{cases} g(x) & (f(x) \leq g(x)) \\ f(x) & (f(x) > g(x)) \end{cases}  이때 조건 (나)에서   인 어떤 `

### `삼각함수그래프/052a.webp`
- **P3(REVIEW)**: `삼각함수의 그래프를 이용하여 자연수의 최댓값 구하는 문제 해결하기\n\n함수  의 주기는   이므로\n\n원점을 지나고 기울기가 양수인 직선이   에서 함수  의 그래프와 만나는 원점이 아닌 두 점  와  는 원점에`
- **P5(REVIEW)**: `\n\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n∴ 
- **P5(REVIEW)**: `\n\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n이때 
- **P5(REVIEW)**: `이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 

### `삼각함수그래프/055a.webp`
- **P3(REVIEW)**: `해설  로 놓으면  3 + 2\sin^2\theta + \frac{1}{3 - 2\cos^2\theta} = t + \frac{1}{t - 2}  이다.  에서  이므로  이다.  t + \frac{1}{t - 2}`

### `삼각함수그래프/057.webp`
- **P3(REVIEW)**: `실수  에 대하여 함수  f(x) = \text{cos}^2 \left( x - \frac{3}{4} \pi \right) - \text{cos} \left( x - \frac{\pi}{4} \right) + k  `

### `삼각함수그래프/054a.webp`
- **P3(REVIEW)**: `삼각함수를 이용하여 부채꼴의 넓이 증명하기 삼각형  에서  ,   이므로   이다. 한편,   이고   이므로   이다. 같은 방법으로   이고   이므로   이다. 따라서 부채꼴  의 넓이  는  S(\theta)`

### `삼각함수그래프/056.webp`
- **P3(REVIEW)**: `다음은  에서  의 최솟값을 구하는 과정이다.  로 놓으면  3 + 2\sin^2\theta + \frac{1}{3 - 2\cos^2\theta} = t + \frac{1}{\text{(가)}}  이다.  에서  이`

### `삼각함수그래프/054.webp`
- **P3(REVIEW)**: `그림과 같이  ,  인 이등변삼각형  가 있다. 선분  를 지름으로 하는 반원의 선분  와 만나는 점 중  가 아닌 점을  , 선분  와 만나는 점 중  가 아닌 점을  라 하자. 선분  의 중점을  이라 할 때, `

### `삼각함수그래프/056a.webp`
- **P3(REVIEW)**: `해설  로 놓으면  3 + 2\sin^2\theta + \frac{1}{3 - 2\text{cos}^2\theta} = t + \frac{1}{t - 2}  이다.  에서  이므로  이다.  t + \frac{1}{`

### `삼각함수그래프/058a.webp`
- **P3(REVIEW)**: `삼각함수의 그래프를 이용하여 추론하기\n\n 인  에 대하여\n\n \frac{3}{2}\pi + b \leq 3x + b \leq 3a + b 이므로\n\n닫힌구간   에서 함수  의\n\n최댓값, 최솟값은 각각\`
- **P5(REVIEW)**: `이므로\n\n닫힌구간 ` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲\n닫힌구간 
- **P5(REVIEW)**: `의\n\n최댓값, 최솟값은 각각\n\n닫힌구간 ` — KaTeX parse error: Undefined control sequence: \n at position 2: 의\̲n̲\n최댓값, 최솟값은 각각\…
- **P5(REVIEW)**: `의\n\n최댓값, 최솟값과 같다.\n\n함수 ` — KaTeX parse error: Undefined control sequence: \n at position 2: 의\̲n̲\n최댓값, 최솟값과 같다.…

### `삼각함수그래프/061.webp`
- **P3(REVIEW)**: `0 \leq x < \pi 일 때, \( x \)에 대한 방정식 \( \sin nx = \frac{1}{5} \) \((n \text{은 자연수})\)의 모든 해의 합을 \( f(n) \)이라 하자. \( f(2) `
- **P5(REVIEW)**: `\( \frac{3}{2} \pi \) ② \( 2\pi \) ③ \( \frac{5}{2} \pi \) ④ \( 3\pi \) ⑤ \( \fr` — KaTeX parse error: Can't use function '\(' in math mode at position 1: \̲(̲ \frac{3}{2} \p…

### `삼각함수그래프/062.webp`
- **P3(REVIEW)**: `0 \leq x \leq \pi 일 때, 방정식  2\cos^2x + (2 + \sqrt{3})\sin x - (2 + \sqrt{3}) = 0  의 모든 해의 합은? ①   ②   ③   ④   ⑤`

### `삼각함수그래프/057a.webp`
- **P3(REVIEW)**: `삼각함수의 최댓값과 최솟값을 구할 수 있는가?  f(x) = \text{cos}^2 \left( x - \frac{3}{4} \pi \right) - \text{cos} \left( x - \frac{\pi}{4} `

### `삼각함수그래프/059a.webp`
- **P3(REVIEW)**: `해설   에서   이고 함수   는 증가하므로  3 \tan \frac{\pi}{6} \leq 3 \tan \left( x + \frac{\pi}{6} \right) \leq 3 \tan \frac{\pi}{3}  `

### `삼각함수그래프/064.webp`
- **P5(REVIEW)**: `3 ② \(\frac{7}{2}\) ③ 4 ④ \(\frac{9}{2}\) ⑤ 5` — KaTeX parse error: Can't use function '\(' in math mode at position 5: 3 ② \̲(̲\frac{7}{2}\) ③…

### `삼각함수그래프/066.webp`
- **P3(REVIEW)**: `0 < x < 2\pi일 때, 방정식 2\cos^2 x - \sin(\pi + x) - 2 = 0의 모든 해의 합은? ①  \frac{3}{2} \frac{5}{2}`

### `삼각함수그래프/062a.webp`
- **P3(REVIEW)**: `삼각함수의 그래프 이해하기\n\n 이므로\n\n 2(1 - \sin^2 x) + (2 + \sqrt{3}) \sin x - (2 + \sqrt{3}) = 0 \n\n 2 \sin^2 x - (2 + \sqrt{3})`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲\n
- **P5(REVIEW)**: `에서\n\n` — KaTeX parse error: Undefined control sequence: \n at position 3: 에서\̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 모든 해의 합은 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 모든 해의 합은 

### `삼각함수그래프/065.webp`
- **P3(REVIEW)**: `0 \leq x < 2\pi 일 때, 방정식  의 모든 해의 합은? ①   ②   ③   ④   ⑤`

### `삼각함수그래프/061a.webp`
- **P3(REVIEW)**: `삼각함수의 그래프 이해하기  의 주기는   (i)  일 때,  의 주기는    0 \leq x < \pi 에서 방정식  은 직선  에 대하여 대칭인 해를 2개 가지므로  f(2) = \frac{\pi}{4} \cdo`
- **P5(REVIEW)**: `y = \sinnx` — KaTeX parse error: Undefined control sequence: \sinnx at position 5: y = \̲s̲i̲n̲n̲x̲

### `삼각함수그래프/065a.webp`
- **P3(REVIEW)**: `삼각함수를 활용하여 문제해결하기\n\n  이므로\n\n 3(1 - \sin^2 x) + 5 \sin x - 1 = 0 \n\n 3 \sin^2 x - 5 \sin x - 2 = 0 \n\n (3 \sin x + 1)`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `라 하면\n\n` — KaTeX parse error: Undefined control sequence: \n at position 5: 라 하면\̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 모든 해의 합은 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 모든 해의 합은 

### `삼각함수그래프/066a.webp`
- **P3(REVIEW)**: `삼각함수 이해하기  2\text{cos}^2x - \sin(\text{π} + x) - 2   = 2(1 - \sin^2x) + \sinx - 2   = -2\sin^2x + \sinx   = -\sinx(2\sin`
- **P5(REVIEW)**: `= 2(1 - \sin^2x) + \sinx - 2` — KaTeX parse error: Undefined control sequence: \sinx at position 20: …1 - \sin^2x) + \̲s̲i̲n̲x̲ ̲- 2
- **P5(REVIEW)**: `= -2\sin^2x + \sinx` — KaTeX parse error: Undefined control sequence: \sinx at position 15: = -2\sin^2x + \̲s̲i̲n̲x̲
- **P5(REVIEW)**: `= -\sinx(2\sinx - 1) = 0` — KaTeX parse error: Undefined control sequence: \sinx at position 4: = -\̲s̲i̲n̲x̲(2\sinx - 1) = …
- **P5(REVIEW)**: `\sinx = 0 \text{ 또는 } \sinx = \frac{1}{2}` — KaTeX parse error: Undefined control sequence: \sinx at position 1: \̲s̲i̲n̲x̲ ̲= 0 \text{ 또는 }…
- **P5(REVIEW)**: `\sinx = 0 \text{에서 } x = \text{π}` — KaTeX parse error: Undefined control sequence: \sinx at position 1: \̲s̲i̲n̲x̲ ̲= 0 \text{에서 } …
- **P5(REVIEW)**: `\sinx = \frac{1}{2} \text{에서 } x = \frac{\text{π}}{6} \text{ 또는 } x = \frac{5}{6` — KaTeX parse error: Undefined control sequence: \sinx at position 1: \̲s̲i̲n̲x̲ ̲= \frac{1}{2} \…

### `삼각함수그래프/067.webp`
- **P3(REVIEW)**: `0 \leq x < 4\pi일 때, 방정식  의 모든 해의 합은? ①   ②   ③   ④   ⑤`

### `삼각함수그래프/071.webp`
- **P3(REVIEW)**: `방정식  \frac{2}{\sqrt{3}} \sin \left( x + \frac{\pi}{3} \right) - \frac{7}{8} = 0  의 모든 실근의 합이  일 때,  의 값을 구하시오. (단,  이고, `

### `삼각함수그래프/069a.webp`
- **P5(REVIEW)**: `y = \tan \frac{\n \times}{\n}` — KaTeX parse error: Undefined control sequence: \n at position 16: y = \tan \frac{\̲n̲ ̲\times}{\n}
- **P5(REVIEW)**: `\frac{\n}{\n} = 1` — KaTeX parse error: Undefined control sequence: \n at position 7: \frac{\̲n̲}{\n} = 1
- **P5(REVIEW)**: `0 \n \times \n 2` — KaTeX parse error: Undefined control sequence: \n at position 3: 0 \̲n̲ ̲\times \n 2
- **P5(REVIEW)**: `y = \tan \frac{\n \times}{\n}` — KaTeX parse error: Undefined control sequence: \n at position 16: y = \tan \frac{\̲n̲ ̲\times}{\n}
- **P5(REVIEW)**: `\frac{3}{10} n \n 2` — KaTeX parse error: Undefined control sequence: \n at position 16: \frac{3}{10} n \̲n̲ ̲2
- **P5(REVIEW)**: `n \n \frac{20}{3}` — KaTeX parse error: Undefined control sequence: \n at position 3: n \̲n̲ ̲\frac{20}{3}

### `삼각함수그래프/067a.webp`
- **P3(REVIEW)**: `삼각함수로 표현된 방정식의 해를 구할 수 있는가? \( \cos\left(\frac{\pi}{2} + x\right) = -\sin x \)이므로 주어진 방정식은  4\sin^2 x + 4\sin x - 3 = 0 `
- **P5(REVIEW)**: ` \( \therefore \sin x = \frac{1}{2} \) (\( -1 \leq \sin x \leq 1 \)) 이때 \( 0 \le` — KaTeX parse error: Can't use function '\(' in math mode at position 2:  \̲(̲ \therefore \si…

### `삼각함수그래프/068a.webp`
- **P3(REVIEW)**: `삼각함수의 그래프를 이용하여 문제 해결하기  이므로 점 A의 좌표는  이다.  -\frac{3}{2}\pi \leq x \leq \frac{3}{2}\pi 에서 직선  와 함수  의 그래프가 만나는 두 점의  좌표는`

### `삼각함수그래프/076.webp`
- **P3(REVIEW)**: `0 \leq x \leq \pi 일 때, 2 이상의 자연수  에 대하여 두 곡선  와  의 교점의 개수를  이라 하자.  의 값을 구하시오.`

### `삼각함수그래프/070a.webp`
- **P3(REVIEW)**: `삼각함수의 그래프 이해하기\n\n함수  의 그래프는 직선  에 대하여 대칭이므로 함수  의 그래프와 직선  가 만나는 두 점의  좌표  ,  에 대하여\n\n \frac{\alpha + \beta}{2} = \fra`
- **P5(REVIEW)**: ` \n\n` — KaTeX parse error: Undefined control sequence: \n at position 2:  \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n따라서\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서\n\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n이므로 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n이므로 

### `삼각함수그래프/075.webp`
- **P3(REVIEW)**: `닫힌구간  에서 정의된 함수  는  f(x) = \begin{cases} \sin x & (0 \leq x \leq \frac{k}{6}\pi) \\ 2\sin\left(\frac{k}{6}\pi\right) - \`

### `삼각함수그래프/078.webp`
- **P3(REVIEW)**: `0 \leq x \leq 2\pi일 때,  에 대한 방정식  \left(\sin x - \frac{1}{4}k\right)\left(\sin x + \frac{1}{4}k^2 - \frac{3}{4}k\right) `

### `삼각함수그래프/077.webp`
- **P3(REVIEW)**: `음이 아닌 세 정수  ,  ,  에 대하여   (a^2 + b^2 + 2ab - 4) \text{cos} \frac{n}{4} \\ + (b^2 + ab + 2) \text{tan} \frac{2n+1}{4} \\ `

### `삼각함수그래프/080.webp`
- **P3(REVIEW)**: `0 \leq x \leq 2\pi 일 때, 방정식  의 서로 다른 실근의 개수가 3이다. 이 세 실근 중 가장 큰 실근을  라 할 때,  의 값은? (단,  는 상수이다.) ①   ②   ③   ④   ⑤`

### `삼각함수그래프/080a.webp`
- **P3(REVIEW)**: `삼각함수를 이용하여 추론하기  2(1-\cos^2x)-3\cos x=k   2\cos^2x+3\cos x+k-2=0   0 \leq x \leq 2\pi 에서 함수  의 그래프는 그림과 같다. 상수  에 대하여  0`

### `삼각함수그래프/079.webp`
- **P3(REVIEW)**: `0 \leq t \leq 3\text{인 실수 } t \text{와 상수 } k \text{에 대하여} \ t \leq x \leq t+1 \text{에서 방정식 } \sin   x = k \text{의 모든 해의 `

### `삼각함수그래프/079a.webp`
- **P3(REVIEW)**: `삼각함수의 그래프를 이용하여 추론하기 함수  의 치역은  이고, 주기가 4이다. 따라서  에서 함수  의 그래프가 직선  와 두 점에서 만나려면  이어야 한다.  에서 함수  의 그래프가 직선  와 만나는 두 점의 `

### `삼각함수그래프/078a.webp`
- **P3(REVIEW)**: `삼각함수의 그래프를 이용하여 추론하기\n\n \frac{1}{4}k = -\frac{1}{4}k^2 + \frac{3}{4}k 에서  \n\n∴   또는  \n\n(ⅰ)   또는  일 때\n\n방정식  의\n\n서로`
- **P5(REVIEW)**: `\n\n∴ ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n∴ 
- **P5(REVIEW)**: `\n\n(ⅰ) ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n(ⅰ) 
- **P5(REVIEW)**: `일 때\n\n방정식 ` — KaTeX parse error: Undefined control sequence: \n at position 4: 일 때\̲n̲\n방정식 
- **P5(REVIEW)**: `의\n\n서로 다른 해의 개수는 방정식 ` — KaTeX parse error: Undefined control sequence: \n at position 2: 의\̲n̲\n서로 다른 해의 개수는 …
- **P5(REVIEW)**: `의 서로\n\n다른 해의 개수와 같다.\n\n방정식 ` — KaTeX parse error: Undefined control sequence: \n at position 5: 의 서로\̲n̲\n다른 해의 개수와 같다.…
- **P5(REVIEW)**: `의 서로 다른 해의 개수는\n\n` — KaTeX parse error: Undefined control sequence: \n at position 15: 의 서로 다른 해의 개수는\̲n̲\n
- **P5(REVIEW)**: `일 때 2이다.\n\n따라서 방정식\n\n` — KaTeX parse error: Undefined control sequence: \n at position 9: 일 때 2이다.\̲n̲\n따라서 방정식\n\n
- **P5(REVIEW)**: `의 서로 다른\n\n해의 개수가 2가 되도록 하는 ` — KaTeX parse error: Undefined control sequence: \n at position 8: 의 서로 다른\̲n̲\n해의 개수가 2가 되도록…
- **P5(REVIEW)**: `의 값은 2이다.\n\n(ⅱ) ` — KaTeX parse error: Undefined control sequence: \n at position 10: 의 값은 2이다.\̲n̲\n(ⅱ) 
- **P5(REVIEW)**: `일 때\n\n방정식 ` — KaTeX parse error: Undefined control sequence: \n at position 4: 일 때\̲n̲\n방정식 
- **P5(REVIEW)**: `의\n\n서로 다른 해의 개수는 방정식 ` — KaTeX parse error: Undefined control sequence: \n at position 2: 의\̲n̲\n서로 다른 해의 개수는 …
- **P5(REVIEW)**: `의 서로\n\n다른 해의 개수와 방정식 ` — KaTeX parse error: Undefined control sequence: \n at position 5: 의 서로\̲n̲\n다른 해의 개수와 방정식…
- **P5(REVIEW)**: `의\n\n서로 다른 해의 개수의 합과 같다.\n\n(a) 방정식 ` — KaTeX parse error: Undefined control sequence: \n at position 2: 의\̲n̲\n서로 다른 해의 개수의 …
- **P5(REVIEW)**: `의 서로 다른 해의 개수가\n\n0일 때\n\n` — KaTeX parse error: Undefined control sequence: \n at position 15: 의 서로 다른 해의 개수가\̲n̲\n0일 때\n\n
- **P5(REVIEW)**: `일 때 방정식\n\n` — KaTeX parse error: Undefined control sequence: \n at position 8: 일 때 방정식\̲n̲\n
- **P5(REVIEW)**: `의 서로 다른 해의 개수는\n\n0이다.\n\n따라서 방정식\n\n` — KaTeX parse error: Undefined control sequence: \n at position 15: 의 서로 다른 해의 개수는\̲n̲\n0이다.\n\n따라서 방…

### `삼각함수그래프/087.webp`
- **P3(REVIEW)**: `0 \leq x < 2\pi에서 x에 대한 부등식  (2a + 6)\cos x - a\sin^2 x + a + 12 < 0 의 해가 존재하도록 하는 자연수  의 최소값을 구하시오.`

### `삼각함수그래프/083a.webp`
- **P3(REVIEW)**: `삼각함수의 정의를 이용하여 삼각함수의 값 구하는 문제 해결하기\n\n\( \angle APB = \frac{\pi}{2} \) 이므로 \( \angle PBA = \frac{\pi}{2} - \theta \) 이고,`

### `삼각함수그래프/086.webp`
- **P3(REVIEW)**: `0 \leq x \leq 2\pi \text{일 때, 부등식 } \cos x \leq \sin   \text{를 만족시키는 모든 } x \text{의 값의 범위는 }   \leq x \leq   \text{이다. }`

### `삼각함수그래프/087a.webp`
- **P3(REVIEW)**: `삼각함수를 활용하여 문제해결하기       a\cos^2 x + (2a+6)\cos x + 12 < 0     (a\cos x + 6)(\cos x + 2) < 0   에서   이므로   이때   이므로   \cos`

### `삼각함수그래프/084a.webp`
- **P3(REVIEW)**: `삼각함수를 활용하여 문제해결하기 함수  의 최댓값이 3, 최솟값이  이고  가 양수이므로   함수  의 주기가   이므로  \overline{AB} = \frac{2\pi}{b}    에서 방정식  의 해는  x =`

### `삼각함수그래프/088.webp`
- **P3(REVIEW)**: `0 \leq \theta < 2\pi 일 때, \( x \)에 대한 이차방정식  x^2 - (2\sin\theta)x - 3\cos^2\theta - 5\sin\theta + 5 = 0 이 실근을 갖도록 하는 \( `

### `삼각함수그래프/091.webp`
- **P3(REVIEW)**: `반원  의 중심을  , 반지름의 길이는  라 하면  이므로  이\n선분  와 반원  의 접점을  라 하면  \n부채꼴의 중심각의 크기가   이므로\n \sin \frac{\pi}{6} = \frac{r}{4-r} =`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲따라서 

### `삼각함수그래프/092.webp`
- **P3(REVIEW)**: `부채꼴의 넓이를 이용하여 문제를 해결한다. 원  에서 중심각의 크기가  인 부채꼴  의 넓이를  이라 하고 원  에서 중심각의 크기가  인 부채꼴  의 넓이를  라 하면  S_1 = T_1 + S_2 - T_2   `

### `삼각함수그래프/088a.webp`
- **P3(REVIEW)**: `삼각함수가 포함된 부등식의 해 구하기 주어진 이차방정식  의 판별식을  라 하면 이 이차방정식이 실근을 가져야 하므로  \frac{D}{4} = (-\sin\theta)^2 - (-3\text{cos}^2\theta`

### `삼각함수그래프/090.webp`
- **P3(REVIEW)**: `원  의 중심을  , 원  의 중심을  , 직선  가 선분  와 만나는 점을  이라 하고, 직선  가 원  과 만나는 두 점 중에서 점  에 가까운 점을  이라 하자.  ,    이므로   원  에서 점  를 포함하`

### `삼각함수그래프/093.webp`
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n또, ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲또, 
- **P5(REVIEW)**: `이므로\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲
- **P5(REVIEW)**: `\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲

### `삼각함수그래프/097.webp`
- **P3(REVIEW)**: `삼각함수의 정의를 이용하여 식의 값 구하는 문제 해결하기\n동경  가 나타내는 각의 크기가  이고  이므로\n\n \sin \theta = \frac{a}{r}, \cos \theta = \frac{5}{r} \n\`
- **P5(REVIEW)**: `\n\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n이때 
- **P5(REVIEW)**: `이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n또, ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n또, 
- **P5(REVIEW)**: `이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 4: 이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `삼각함수그래프/098.webp`
- **P3(REVIEW)**: `삼각함수 이해하기  의 양변에  를 곱하면  3\sin\theta\cos\theta - 4\sin\theta = 4\cos\theta   3\sin\theta\cos\theta = 4(\sin\theta + \cos`

### `삼각함수그래프/095.webp`
- **P3(REVIEW)**: `삼각함수의 정의를 이해한다. 원점을 중심으로 하고 반지름의 길이가 3인 원이 세 동경  ,  ,  와 만나는 점을 각각  ,  ,  라 하자. 점  가 제1사분면 위에 있고,   이므로 점  의 좌표는   점  가 `

### `삼각함수그래프/096.webp`
- **P3(REVIEW)**: `반지름의 길이가  인 원의 중심을  , 선분  의 중점을  라 하자.   라 할 때,  \cos \theta = \frac{4}{5} \text{ 이므로 } \sin \theta = \frac{3}{5} \left(`

### `삼각함수그래프/100.webp`
- **P3(REVIEW)**: `삼각형  는 빗변의 길이가  인 직각삼각형이고  AP = \sqrt{3}  이므로   원점을  라 하면   이고, 점  의 좌표는  \left( \cos\left(-\frac{\pi}{3}\right), \sin\l`

### `삼각함수그래프/103.webp`
- **P3(REVIEW)**: `함수  의 주기가   이므로 두 점 A, B의 좌표는   점 A에서  축에 내린 수선의 발을 H라 하자.  \overline{OH} = \overline{BH} = \overline{AH} = a  이므로   삼각형`

### `삼각함수그래프/104.webp`
- **P3(REVIEW)**: `삼각함수의 그래프를 이해하고 조건을 만족시키는 삼각함수를 구할 수 있는가? 함수  의 주기는   이므로 두 점  의 좌표는   따라서 삼각형  의 넓이가 5이므로  \frac{1}{2} \cdot a \cdot \l`

### `삼각함수그래프/102.webp`
- **P3(REVIEW)**: `삼각함수의 그래프 이해하기\n\n방정식  에서\n\n \frac{\pi x}{4} = \frac{\pi}{4} \quad \text{또는} \quad \frac{\pi x}{4} = \frac{3}{4} \pi \n`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n점 A의 좌표는 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n점 A의 좌표는 
- **P5(REVIEW)**: `\n\n점 B와 점 C는 원점에 대하여 서로 대칭이므로\n\n점 C의 좌표는 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n점 B와 점 C는 원점에…
- **P5(REVIEW)**: `\n\n점 C에서 직선 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n점 C에서 직선 
- **P5(REVIEW)**: `에 내린 수선의 발을 H라 하면\n\n점 H의 좌표는 ` — KaTeX parse error: Undefined control sequence: \n at position 18: …내린 수선의 발을 H라 하면\̲n̲\n점 H의 좌표는 
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n이므로 직각삼각형 ACH에서\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n이므로 직각삼각형 ACH…
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `삼각함수그래프/109.webp`
- **P3(REVIEW)**: `삼각함수의 성질 이해하기\n\n  라 하면\n\n 3\sin^2\left(\theta + \frac{2}{3}\pi\right) = 3\sin^2(\pi + \alpha) \n\n = 3\sin^2\alpha = 3`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n또, ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n또, 
- **P5(REVIEW)**: `\n\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 
- **P5(REVIEW)**: ` 에서\n\n` — KaTeX parse error: Undefined control sequence: \n at position 4:  에서\̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n이때 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n이때 
- **P5(REVIEW)**: ` 이므로\n\n` — KaTeX parse error: Undefined control sequence: \n at position 5:  이므로\̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n

### `삼각함수그래프/108.webp`
- **P3(REVIEW)**: `삼각함수의 성질을 이용하여 확률을 구할 수 있는가? 주사위를 두 번 던져서 나올 수 있는 경우의 수는    이고 점  에서 직선  에 내린 수선의 발을  라 하면 선분  의 길이는 점  의  좌표의 절댓값과 같다. `

### `삼각함수그래프/110.webp`
- **P3(REVIEW)**: `삼각함수의 그래프의 성질을 이용하여 조건을 만족하는 삼각형의 넓이를 구할 수 있는가?  \frac{\pi}{a} = a  이므로 함수  의 주기는  이다. 직선  는 원점을 지나고 기울기가  인 직선이므로 양수  에`

### `삼각함수그래프/105.webp`
- **P3(REVIEW)**: `삼각함수의 그래프를 이용하여 추론하기 함수  의 주기는  \frac{2\pi}{\frac{\pi}{6}} = 12 이고, 최댓값과 최솟값은 각각 2, -2이다. 또한, 함수  의 그래프는 함수  의 그래프를  축의 `

### `삼각함수그래프/106.webp`
- **P3(REVIEW)**: `함수  의 주기는  \frac{2\pi}{\left| \frac{\pi}{6} \right|} = 12 이고,  \n\n 에서    \n\n 의 값은  에서 함수  의 그래프가 직선  와 만나는 점의 개수이므로  \`
- **P5(REVIEW)**: `이고,  \n\n` — KaTeX parse error: Undefined control sequence: \n at position 6: 이고,  \̲n̲\n
- **P5(REVIEW)**: `  \n\n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲\n
- **P5(REVIEW)**: `와 만나는 점의 개수이므로  \n` — KaTeX parse error: Undefined control sequence: \n at position 17: … 만나는 점의 개수이므로  \̲n̲
- **P5(REVIEW)**: `와 만나는 점의 개수의 합과 같다.  \n(i) ` — KaTeX parse error: Undefined control sequence: \n at position 22: …점의 개수의 합과 같다.  \̲n̲(i) 
- **P5(REVIEW)**: `이고,  \n함수 ` — KaTeX parse error: Undefined control sequence: \n at position 6: 이고,  \̲n̲함수 
- **P5(REVIEW)**: `의 그래프의 개형은 다음 그림과 같다.  \n\n그러므로 함수 ` — KaTeX parse error: Undefined control sequence: \n at position 24: …형은 다음 그림과 같다.  \̲n̲\n그러므로 함수 
- **P5(REVIEW)**: `의 값은 최대이고 그 값은 4이다.  \n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 22: …대이고 그 값은 4이다.  \̲n̲따라서 
- **P5(REVIEW)**: `가 존재하지 않는다.  \n(ii) ` — KaTeX parse error: Undefined control sequence: \n at position 14: 가 존재하지 않는다.  \̲n̲(ii) 
- **P5(REVIEW)**: `의 값은 다음과 같다.  \n(a) ` — KaTeX parse error: Undefined control sequence: \n at position 15: 의 값은 다음과 같다.  \̲n̲(a) 
- **P5(REVIEW)**: `  \n(b) ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲(b) 
- **P5(REVIEW)**: `  \n(c) ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲(c) 
- **P5(REVIEW)**: `일 때  \n` — KaTeX parse error: Undefined control sequence: \n at position 6: 일 때  \̲n̲
- **P5(REVIEW)**: `  \n(d) ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲(d) 
- **P5(REVIEW)**: `일 때  \n` — KaTeX parse error: Undefined control sequence: \n at position 6: 일 때  \̲n̲
- **P5(REVIEW)**: `  \n(e) ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲(e) 
- **P5(REVIEW)**: `일 때  \n` — KaTeX parse error: Undefined control sequence: \n at position 6: 일 때  \̲n̲
- **P5(REVIEW)**: `  \n(f) ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲(f) 
- **P5(REVIEW)**: `일 때  \n` — KaTeX parse error: Undefined control sequence: \n at position 6: 일 때  \̲n̲
- **P5(REVIEW)**: `  \n(i), (ii)에서 ` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲(i), (ii)에서 
- **P5(REVIEW)**: `이다.  \n\n그러므로 ` — KaTeX parse error: Undefined control sequence: \n at position 6: 이다.  \̲n̲\n그러므로 
- **P5(REVIEW)**: `이고,  \n함수 ` — KaTeX parse error: Undefined control sequence: \n at position 6: 이고,  \̲n̲함수 
- **P5(REVIEW)**: `의 그래프는 다음 그림과 같다.  \n\n` — KaTeX parse error: Undefined control sequence: \n at position 20: …프는 다음 그림과 같다.  \̲n̲\n
- **P5(REVIEW)**: `  \n` — KaTeX parse error: Undefined control sequence: \n at position 3:   \̲n̲
- **P5(REVIEW)**: `이므로  \n` — KaTeX parse error: Undefined control sequence: \n at position 6: 이므로  \̲n̲

### `삼각함수그래프/114.webp`
- **P3(REVIEW)**: `코사인함수의 최댓값과 주기를 구할 수 있는가? 함수  의 그래프는 함수  의 그래프를  축의 방향으로 3만큼 평행이동시킨 것이다. 이때  가 자연수이므로   이때 함수  의 주기는  \frac{2\pi}{b}  또한`
- **P5(REVIEW)**: `}` — KaTeX parse error: Expected 'EOF', got '}' at position 1: }̲

### `삼각함수그래프/111.webp`
- **P3(REVIEW)**: `삼각함수의 그래프와 직선의 교점의 개수를 구한다.  의 주기는  이고  의 그래프는  의 그래프를  축의 방향으로  만큼 평행이동한 그래프이다. 다음 그림은  일 때의 그래프이다.  y = \tan \left( 2x`

### `삼각함수그래프/113.webp`
- **P3(REVIEW)**: `함수  의 그래프에서\n\n(ⅰ)  일 때,  이므로 함수의 그래프는 제1사분면을 지나지 않는다.\n\n(ⅱ)  일 때,  의 최댓값은  이고, 함수의 그래프가 제1사분면을 지나지 않으려면 최댓값이 0보다 작거나 같`
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 
- **P5(REVIEW)**: `\n\n(ⅲ) ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n(ⅲ) 
- **P5(REVIEW)**: `이고, 함수의 그래프가 제1사분면을 지나지 않으려면 최댓값이 0보다 작거나 같아야 한다.\n\n` — KaTeX parse error: Undefined control sequence: \n at position 50: …0보다 작거나 같아야 한다.\̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n
- **P5(REVIEW)**: `\n\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 
- **P5(REVIEW)**: `\n\n따라서 ` — KaTeX parse error: Undefined control sequence: \n at position 1: \̲n̲\n따라서 

### `삼각함수그래프/120.webp`
- **P3(REVIEW)**: `함수  의 최댓값과 최솟값이 각각 2, -4이고  이므로  ,  에서  ,   함수  의 주기는  이고  이므로  \frac{2\pi}{b} = \pi 에서   따라서`

### `삼각함수그래프/115.webp`
- **P3(REVIEW)**: `닫힌구간에서 탄젠트함수의 최댓값과 최솟값을 이용하여 두 상수의 곱을 구할 수 있는가? 함수  의 그래프의 주기는   이다. 함수  가 닫힌구간   에서 최댓값과 최솟값을 가지므로   또한, 함수  의 그래프는 구간 `

### `삼각함수그래프/122.webp`
- **P3(REVIEW)**: `정답 ②  0 \leq x < k -\frac{1}{2} \leq f(x) \leq \frac{1}{2} y = \frac{1}{2} \sin \pi x y = g(x) y = g(x) f(k) = \left(\fr`

### `삼각함수그래프/118.webp`
- **P3(REVIEW)**: `삼각함수의 그래프의 성질을 이용하여 문제를 해결한다. 답힌구간   에서   이므로   이다. 함수  의 그래프가 두 점  을 지나므로  f\left( -\frac{\pi}{2} \right) = 2\sin\left(`

### `삼각함수그래프/121.webp`
- **P3(REVIEW)**: `삼각함수의 그래프를 활용하여 문제해결하기\n 일 때, 방정식  에서\n \n\[ \frac{\sin x}{\cos x} = \tan x = \frac{1}{k} \quad (\cos x \neq 0) \]\n따라서 `

### `삼각함수그래프/127.webp`
- **P3(REVIEW)**: `삼각함수의 그래프의 성질을 활용하여 문제를 해결한다. 삼각형  의 넓이가   이므로   이때  , 함수  의 주기는  이므로   ∴   선분  의 중점의  좌표가 3이므로 점  의 좌표는  이다. 점  는 곡선   `

### `삼각함수그래프/132.webp`
- **P3(REVIEW)**: `삼각함수의 그래프를 활용하여 문제 해결하기 함수  의 주기는  \frac{2\pi}{\pi} = 2  함수  는 최댓값  , 최솟값  을 가지므로 함수  의 그래프의 개형은 다음과 같다.`

### `삼각함수그래프/131.webp`
- **P3(REVIEW)**: `삼각함수를 활용하여 문제 해결하기 함수  의 주기는  \frac{2\pi}{\frac{\pi}{2}} = 4  곡선  와 직선  가 만나는 점의  좌표 중 가장 작은 값을  이라 할 때, 두 점  ,  를  ,  라`

### `삼각함수그래프/124.webp`
- **P3(REVIEW)**: `만약   라 하면 함수   의 그래프에서   일 때   이므로   이다. 따라서 조건 (가)를 만족시키지 않는다.   … ①  k > 0 \pi < a < x < 2\pi y = k \sin x - \frac{1}{`

### `삼각함수그래프/134.webp`
- **P3(REVIEW)**: `삼각함수의 그래프를 활용하여 문제 해결하기 함수  의 그래프의 개형은 다음과 같다. 함수  의 그래프가 직선  과 만나는 서로 다른 점의 개수는  0 < k_0 \leq \frac{1}{3}  일 때 8,   일 때`

### `삼각함수그래프/133.webp`
- **P5(REVIEW)**: `y = \sinx - \frac{1}{2}` — KaTeX parse error: Undefined control sequence: \sinx at position 5: y = \̲s̲i̲n̲x̲ ̲- \frac{1}{2}

### `3)지수로그함수의극한/006.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \lim_{x \to 0} \frac{e^{2x} - 1}{x^2 - x}`

### `3)지수로그함수의극한/008.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \text{함수 } f(x)=(x^2 + 2x + 3)e^{x^{-1}} \text{에 대해 } \ \lim_{x \to 1} \frac{f(x)-6}{x-1} \tex`

### `3)지수로그함수의극한/011.webp`
- **P5(REVIEW)**: ` \rac{e^{7x} + e^{4x} + e^{x} - 3}{x} ` — KaTeX parse error: Undefined control sequence: \ at position 2:  \̲̲rac{e^{7x} + e^…

### `3)지수로그함수의극한/013.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \lim_{x \to 0} \frac{2^x - 1}{4x}`

### `3)지수로그함수의극한/018.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \lim_{x \to 0} \frac{(a+5)^x - a^x}{x} = \ln3`

### `3)지수로그함수의극한/026.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \text{점 } P의 좌표를 (a, \ln a) (a > 0)라 하면 점 Q의 좌표는 (a, e^a)`

### `3)지수로그함수의극한/027.webp`
- **P5(REVIEW)**: ` \lim_{x \to 0} \frac{(1 + ax)^{\frac{b}{x}}} ` — KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: …{\frac{b}{x}}} 

### `3)지수로그함수의극한/028.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \lim_{x \to 0} \frac{f(x)}{e^x - 1} = 2   이고,   \lim_{x \to 0} \frac{f(2x)}{e^{2x} - 1} = 2   `

### `3)지수로그함수의극한/031.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  f(x) = e^x - x^2 + 7x  에 대해   f'(0)  의 값을 구해야 합니다.`

### `3)지수로그함수의극한/032.webp`
- **P5(REVIEW)**: ` f(x)=(2x-1)\lnx ` — KaTeX parse error: Undefined control sequence: \lnx at position 13:  f(x)=(2x-1)\̲l̲n̲x̲ ̲

### `3)지수로그함수의극한/033.webp`
- **P3(REVIEW)**: `함수   f(x) = x^3 \ln x^2  에 대해   f'(1)  의 값을 구해봅시다.`

### `3)지수로그함수의극한/036.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \lim_{x \to 0} \frac{e^{2a+x} - b}{2x} = e^2`

### `3)지수로그함수의극한/037.webp`
- **P5(REVIEW)**: ` \tan 2\theta = \rac{5}{12} ` — KaTeX parse error: Undefined control sequence: \ at position 17: …\tan 2\theta = \̲̲rac{5}{12} 

### `4)삼각함수합성과미분/003.webp`
- **P5(REVIEW)**: `\begin{align*} \sin \, \theta + \cos \, \beta &= \frac{1}{3}, \\ \cos \, \theta ` — KaTeX parse error: {align*} can be used only in display mode.

### `4)삼각함수합성과미분/007.webp`
- **P3(REVIEW)**: `주어진 문제를 살펴봅시다.↵  \begin{align*} \sin \, \beta + \sin \, \beta &= \frac{\text{√}2}{3}, \\ \cos \, \beta - \cos \, \beta &`

### `4)삼각함수합성과미분/009.webp`
- **P5(REVIEW)**: ` f(x) = \sinx \cosx ` — KaTeX parse error: Undefined control sequence: \sinx at position 9:  f(x) = \̲s̲i̲n̲x̲ ̲\cosx 

### `4)삼각함수합성과미분/015.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \lim_{x \to 0} \frac{6 \ln(1+x^2)}{x \tan 2x}`

### `4)삼각함수합성과미분/016.webp`
- **P5(REVIEW)**: ` \lim_{x \to \text{∞}} igg( 1 + \sin \frac{1}{x} igg)^{x} ` — KaTeX parse error: Unexpected character: '' at position 24: … \to \text{∞}} ̲igg( 1 + \sin \…

### `4)삼각함수합성과미분/018.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \lim_{x \to 0} \frac{\sin(x^3 + x^2 - 2x)}{x - x^2}`

### `4)삼각함수합성과미분/022.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \text{함수 } f(x) = e^x - 1, g(x) = \sinx   \text{일 때 극한이 존재하는 것을 찾아야 합니다.}`
- **P5(REVIEW)**: ` \text{함수 } f(x) = e^x - 1, g(x) = \sinx ` — KaTeX parse error: Undefined control sequence: \sinx at position 36: …^x - 1, g(x) = \̲s̲i̲n̲x̲ ̲

### `4)삼각함수합성과미분/023.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \lim_{\theta \to 0} igg( \frac{2}{\sin^2 \theta} - \frac{1}{1 - \cos \theta} igg)`
- **P5(REVIEW)**: ` \lim_{\theta \to 0} igg( \frac{2}{\sin^2 \theta} - \frac{1}{1 - \cos \theta} ` — KaTeX parse error: Unexpected character: '' at position 22: …{\theta \to 0} ̲igg( \frac{2}{\…

### `4)삼각함수합성과미분/024.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \text{주어진 함수 } f(x) = e^{-x} \sin x + g(x) \text{에 대해 } \\ \lim_{x \to 0} \frac{f(x)}{x} = 1 \`

### `4)삼각함수합성과미분/026.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  f(\theta) \text{가 } (1 - \cos \theta)f(\theta) = 2\theta^2 \text{를 만족시킬 때, } f(0) \text{의 값을 구`

### `4)삼각함수합성과미분/028.webp`
- **P5(REVIEW)**: ` (1 - \cosx)f(x) = (e^{2x} - 1)\lnigg(1 + \frac{1}{2}xigg) ` — KaTeX parse error: Undefined control sequence: \cosx at position 7:  (1 - \̲c̲o̲s̲x̲)f(x) = (e^{2x}…

### `4)삼각함수합성과미분/033.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \lim_{\theta \to 0} \frac{S(\theta)}{\theta^3}`

### `4)삼각함수합성과미분/036.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \lim_{\theta \to 0^+} \frac{f(\theta) - g(\theta)}{\theta^3} = a`

### `4)삼각함수합성과미분/037.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \lim_{\theta \to 0^+} \frac{g(\theta)}{\theta^4 \times f(\theta)}`

### `4)삼각함수합성과미분/039.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \lim_{\theta \to 0} \frac{\sqrt{g(\theta)}}{\theta \times f(\theta)}`

### `4)삼각함수합성과미분/040.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \lim_{\theta \to 0^+} \frac{g(\theta)}{\theta^2 \times f(\theta)}`

### `4)삼각함수합성과미분/043.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \lim_{\theta \to 0} \frac{S(\theta)}{\theta^2}`

### `4)삼각함수합성과미분/046.webp`
- **P3(REVIEW)**: `이 문제에서 찾아야 할 핵심을 살펴봅시다.↵  \lim_{\theta \to 0^+} \frac{g(\theta)}{\theta^2 \times f(\theta)}`

### `4)삼각함수합성과미분/047.webp`
- **P3(REVIEW)**: `주어진 함수는   f(x) = \sin x \cos x  입니다. 이 함수의 도함수   f' \left( \frac{\pi}{3} \right)  의 값을 구해야 합니다.`

### `4)삼각함수합성과미분/048.webp`
- **P3(REVIEW)**: `함수   f(x) = x^2 \sin x   에 대해   f' \left( \frac{\pi}{2} \right)   의 값을 찾아봅시다.`

---

## 섹션 B — AVS 해설 (avs_answers) | 이슈 항목 수: 84

**패턴별 건수:** P3(REVIEW): 83, P5(REVIEW): 1

> value 열: 원본 값 앞 80자 (REVIEW 항목 판단용)

### `3)지수로그삼각함수의 미분법 4단계/011`
> value: `\pi^2/2`

- **P3(REVIEW)**: `\pi^2/2`

### `3)지수로그삼각함수의 미분법 4단계/023`
> value: `a + b = \frac{15}{2} \pi`

- **P3(REVIEW)**: `a + b = \frac{15}{2} \pi`

### `3)지수로그삼각함수의 미분법 4단계/025`
> value: `= \frac{\sqrt{2} - 1}{2}`

- **P3(REVIEW)**: `= \frac{\sqrt{2} - 1}{2}`

### `3)지수로그삼각함수의 미분법 4단계/028`
> value: `\therefore \lim_{\theta \to 0^+} \frac{\sqrt{g(\theta)}}{\theta \times f(\theta)`

- **P3(REVIEW)**: `\therefore \lim_{\theta \to 0^+} \frac{\sqrt{g(\theta)}}{\theta \times f(\theta)`

### `등차등비2단계/078`
> value: `-\frac{\sqrt{5}}{2}`

- **P3(REVIEW)**: `-\frac{\sqrt{5}}{2}`

### `등차등비3단계/032`
> value: `\frac{1}{2^3}`

- **P3(REVIEW)**: `\frac{1}{2^3}`

### `등차등비수열4단계/042`
> value: `따라서, $$r^9$$의 값은 64입니다.`

- **P3(REVIEW)**: `따라서,  r^9 의 값은 64입니다.`

### `삼각함수활용 4단계(68)/092_v2`
> value: `frac34+fracsqrt22`

- **P3(REVIEW)**: `frac34+fracsqrt22`

### `삼각함수활용 4단계(68)/001_v2`
> value: `2R을사용하여외접원의반지름R을도출한후,원의넓이piR^2을계산합니다.원의넓이는frac85pi입니다`

- **P3(REVIEW)**: `2R을사용하여외접원의반지름R을도출한후,원의넓이piR^2을계산합니다.원의넓이는frac85pi입니다`

### `삼각함수활용 4단계(68)/004_v2`
> value: `fracpi-theta2의관계를통해최종해를도출하면그값은fracsqrt1410이됩니다`

- **P3(REVIEW)**: `fracpi-theta2의관계를통해최종해를도출하면그값은fracsqrt1410이됩니다`

### `삼각함수활용 4단계(68)/006_v2`
> value: `외접원의넓이16pi에서사인법칙을통해미지수x를풀면전체삼각형의넓이를알수있습니다`

- **P3(REVIEW)**: `외접원의넓이16pi에서사인법칙을통해미지수x를풀면전체삼각형의넓이를알수있습니다`

### `삼각함수활용 4단계(68)/037`
> value: `frac5425`

- **P3(REVIEW)**: `frac5425`

### `삼각함수활용 4단계(68)/040`
> value: `frac203`

- **P3(REVIEW)**: `frac203`

### `삼각함수활용 4단계(68)/055`
> value: `frac83`

- **P3(REVIEW)**: `frac83`

### `삼각함수활용 4단계(68)/068`
> value: `frac85pi`

- **P3(REVIEW)**: `frac85pi`

### `삼각함수활용 4단계(68)/075_v2`
> value: `fracsqrt24pi`

- **P3(REVIEW)**: `fracsqrt24pi`

### `삼각함수활용 4단계(68)/078_v2`
> value: `따라서선분BP의길이는(frac4sqrt63)이다`

- **P3(REVIEW)**: `따라서선분BP의길이는(frac4sqrt63)이다`

### `삼각함수활용 4단계(68)/079_v2`
> value: `따라서선분AP의길이는frac83이다`

- **P3(REVIEW)**: `따라서선분AP의길이는frac83이다`

### `삼각함수활용 4단계(68)/080_v2`
> value: `frac43`

- **P3(REVIEW)**: `frac43`

### `삼각함수활용 4단계(68)/085_v2`
> value: `따라서삼각형APC의외접원의넓이는frac716pi이다`

- **P3(REVIEW)**: `따라서삼각형APC의외접원의넓이는frac716pi이다`

### `삼각함수활용 4단계(68)/086_v2`
> value: `frac16`

- **P3(REVIEW)**: `frac16`

### `삼각함수활용 4단계(68)/088_v2`
> value: `frac3sqrt314+frac9sqrt314`

- **P3(REVIEW)**: `frac3sqrt314+frac9sqrt314`

### `삼각함수활용 4단계(68)/089_v2`
> value: `2cdotoverlineQR^2`

- **P3(REVIEW)**: `2cdotoverlineQR^2`

### `삼각함수활용 4단계(68)/097_v2`
> value: `frac15r^2`

- **P3(REVIEW)**: `frac15r^2`

### `삼각함수활용2단계/025_v2`
> value: `frac3740`

- **P3(REVIEW)**: `frac3740`

### `삼각함수활용2단계/002_v3`
> value: `sqrt3:2:1`

- **P3(REVIEW)**: `sqrt3:2:1`

### `삼각함수활용2단계/002_v4`
> value: `sqrt3:2:1`

- **P3(REVIEW)**: `sqrt3:2:1`

### `삼각함수활용2단계/002_v5`
> value: `sqrt3:2:1`

- **P3(REVIEW)**: `sqrt3:2:1`

### `삼각함수활용2단계/004_v3`
> value: `frac59`

- **P3(REVIEW)**: `frac59`

### `삼각함수활용2단계/004_v4`
> value: `frac59`

- **P3(REVIEW)**: `frac59`

### `삼각함수활용2단계/004_v5`
> value: `frac59`

- **P3(REVIEW)**: `frac59`

### `삼각함수활용2단계/004_v6`
> value: `frac59`

- **P3(REVIEW)**: `frac59`

### `삼각함수활용2단계/004_v7`
> value: `frac59`

- **P3(REVIEW)**: `frac59`

### `삼각함수활용2단계/005_v3`
> value: `sqrt2cdotCP`

- **P3(REVIEW)**: `sqrt2cdotCP`

### `삼각함수활용2단계/016_v3`
> value: `90^circ임을확인합니다`

- **P3(REVIEW)**: `90^circ임을확인합니다`

### `삼각함수활용2단계/016_v4`
> value: `90^circ인직각삼각형이다`

- **P3(REVIEW)**: `90^circ인직각삼각형이다`

### `삼각함수활용2단계/016_v5`
> value: `90^circ인직각삼각형이다`

- **P3(REVIEW)**: `90^circ인직각삼각형이다`

### `삼각함수활용2단계/017_v3`
> value: `ACcdotfracsin20^circsin45^circ`

- **P3(REVIEW)**: `ACcdotfracsin20^circsin45^circ`

### `삼각함수활용2단계/018_v3`
> value: `900pi(m^2)`

- **P3(REVIEW)**: `900pi(m^2)`

### `삼각함수활용2단계/018_v4`
> value: `900pi(m^2)`

- **P3(REVIEW)**: `900pi(m^2)`

### `삼각함수활용2단계/020_v2`
> value: `frac1123`

- **P3(REVIEW)**: `frac1123`

### `삼각함수활용2단계/020_v4`
> value: `frac1123`

- **P3(REVIEW)**: `frac1123`

### `삼각함수활용2단계/023_v2`
> value: `frac2425`

- **P3(REVIEW)**: `frac2425`

### `삼각함수활용2단계/024_v2`
> value: `triangleABC의최대각의크기는120^circ이다`

- **P3(REVIEW)**: `triangleABC의최대각의크기는120^circ이다`

### `삼각함수활용2단계/031_v2`
> value: `frac1121`

- **P3(REVIEW)**: `frac1121`

### `삼각함수활용2단계/039_v2`
> value: `sqrt7km`

- **P3(REVIEW)**: `sqrt7km`

### `삼각함수활용2단계/048_v2`
> value: `1)+9(sqrt3`

- **P3(REVIEW)**: `1)+9(sqrt3`

### `삼각함수활용2단계/055_v2`
> value: `1800(m^2)`

- **P3(REVIEW)**: `1800(m^2)`

### `삼각함수활용2단계/061_v2`
> value: `frac12`

- **P3(REVIEW)**: `frac12`

### `삼각함수활용3단계/001_v2`
> value: `frac4sinbetasinalpha로도출됩니다.올바른정답이완성되었습니다`

- **P3(REVIEW)**: `frac4sinbetasinalpha로도출됩니다.올바른정답이완성되었습니다`

### `삼각함수활용3단계/002_v2`
> value: `frac5sinbetasin(fracalpha-beta2)가됩니다.정답은3번입니다`

- **P3(REVIEW)**: `frac5sinbetasin(fracalpha-beta2)가됩니다.정답은3번입니다`

### `삼각함수활용3단계/007_v2`
> value: `frac5sqrt5511이도출됩니다!정답은2번입니다`

- **P3(REVIEW)**: `frac5sqrt5511이도출됩니다!정답은2번입니다`

### `삼각함수활용3단계/008_v2`
> value: `overlineCP^2는최솟값90을가집니다.정답은3번입니다+이때overlineBP^2`

- **P3(REVIEW)**: `overlineCP^2는최솟값90을가집니다.정답은3번입니다+이때overlineBP^2`

### `삼각함수활용3단계/009_v2`
> value: `따라서값은frac973이됩니다.정답은4번입니다`

- **P3(REVIEW)**: `따라서값은frac973이됩니다.정답은4번입니다`

### `삼각함수활용3단계/015_v2`
> value: `frac32ab가됩니다.정답은2번입니다`

- **P3(REVIEW)**: `frac32ab가됩니다.정답은2번입니다`

### `삼각함수활용3단계/025_v2`
> value: `kx^2를만족시키는k를찾습니다`

- **P3(REVIEW)**: `kx^2를만족시키는k를찾습니다`

### `삼각함수활용3단계/031`
> value: `k^2의값을구하시오`

- **P3(REVIEW)**: `k^2의값을구하시오`

### `삼각함수활용3단계/031_v2`
> value: `k^2의값을구하시오`

- **P3(REVIEW)**: `k^2의값을구하시오`

### `삼각함수활용3단계/033_v2`
> value: `frac2sinfracbeta2sinfracalpha2`

- **P3(REVIEW)**: `frac2sinfracbeta2sinfracalpha2`

### `삼각함수활용3단계/034_v2`
> value: `frac5sinbetasinleft(fracalpha-beta2right)`

- **P3(REVIEW)**: `frac5sinbetasinleft(fracalpha-beta2right)`

### `삼각함수활용3단계/035_v2`
> value: `삼각형ADC의외접원의넓이는125pi이다`

- **P3(REVIEW)**: `삼각형ADC의외접원의넓이는125pi이다`

### `삼각함수활용3단계/039_v2`
> value: `frac5sqrt5511`

- **P3(REVIEW)**: `frac5sqrt5511`

### `삼각함수활용3단계/041`
> value: `frac973`

- **P3(REVIEW)**: `frac973`

### `삼각함수활용3단계/041_v2`
> value: `frac973`

- **P3(REVIEW)**: `frac973`

### `삼각함수활용3단계/044_v2`
> value: `frac5sqrt294`

- **P3(REVIEW)**: `frac5sqrt294`

### `삼각함수활용3단계/045_v2`
> value: `sqrt2quad(becauseBE>0)로항상일정하다.quad(참)`

- **P3(REVIEW)**: `sqrt2quad(becauseBE>0)로항상일정하다.quad(참)`

### `삼각함수활용3단계/047`
> value: `frac32ab`

- **P3(REVIEW)**: `frac32ab`

### `삼각함수활용3단계/047_v2`
> value: `frac32ab`

- **P3(REVIEW)**: `frac32ab`

### `삼각함수활용3단계/049`
> value: `frac809pi`

- **P3(REVIEW)**: `frac809pi`

### `삼각함수활용3단계/049_v2`
> value: `frac809pi`

- **P3(REVIEW)**: `frac809pi`

### `삼각함수활용3단계/051_v2`
> value: `2(sqrt2+sqrt6)`

- **P3(REVIEW)**: `2(sqrt2+sqrt6)`

### `3)지수로그함수의극한/002`
> value: `_x  0 e^4x - 12x = 2`

- **P3(REVIEW)**: `_x  0 e^4x - 12x = 2`

### `3)지수로그함수의극한/004`
> value: `e^9/2`

- **P3(REVIEW)**: `e^9/2`

### `3)지수로그함수의극한/005`
> value: `_x  0 e^3x - 12x = 3/2`

- **P3(REVIEW)**: `_x  0 e^3x - 12x = 3/2`

### `3)지수로그함수의극한/006`
> value: `_x  0 e^2x - 1x^2 - x = -2`

- **P3(REVIEW)**: `_x  0 e^2x - 1x^2 - x = -2`

### `3)지수로그함수의극한/012`
> value: `_x  0 e^4x - e^-5x-x = -9`

- **P3(REVIEW)**: `_x  0 e^4x - e^-5x-x = -9`

### `3)지수로그함수의극한/023`
> value: `_t  0 S(t)/t^2 = 1/2`

- **P3(REVIEW)**: `_t  0 S(t)/t^2 = 1/2`

### `3)지수로그함수의극한/036`
> value: `정답을 확인합니다.↵\text{결과적으로 } b = 2e^2 \text{입니다.}`

- **P3(REVIEW)**: `정답을 확인합니다.↵\text{결과적으로 } b = 2e^2 \text{입니다.}`

### `4)삼각함수합성과미분/013`
> value: `_x  0  4x/e^2x - 1 = 2`

- **P3(REVIEW)**: `_x  0  4x/e^2x - 1 = 2`

### `4)삼각함수합성과미분/014`
> value: `_x  0 e^4x - 1 \, 2x = 2`

- **P3(REVIEW)**: `_x  0 e^4x - 1 \, 2x = 2`

### `4)삼각함수합성과미분/016`
> value: `정답을 확인합니다. 따라서, $$ \lim_{x \to \text{∞}} igg( 1 + \sin \frac{1}{x} igg)^{x} = `

- **P5(REVIEW)**: ` \lim_{x \to \text{∞}} igg( 1 + \sin \frac{1}{x} igg)^{x} = e ` — KaTeX parse error: Unexpected character: '' at position 24: … \to \text{∞}} ̲igg( 1 + \sin \…

### `4)삼각함수합성과미분/024`
> value: `g(0) = 0  _x   g(x)/x^2 = 1`

- **P3(REVIEW)**: `g(0) = 0  _x   g(x)/x^2 = 1`

### `4)삼각함수합성과미분/033`
> value: `a^2 + b^2 = 65`

- **P3(REVIEW)**: `a^2 + b^2 = 65`

### `4)삼각함수합성과미분/039`
> value: `정답을 확인합니다.↵$$ \lim_{\theta \to 0} \frac{\sqrt{g(\theta)}}{\theta \times f(\theta`

- **P3(REVIEW)**: `정답을 확인합니다.↵  \lim_{\theta \to 0} \frac{\sqrt{g(\theta)}}{\theta \times f(\theta)} = \lim_{\theta \t`

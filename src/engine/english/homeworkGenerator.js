export function generateEnglishHomework(lessonResult) {
  const rankStr = (lessonResult.rank || []).join('');
  const lessonContent = lessonResult.lessonContent || {};
  
  const passages = lessonContent.reading?.passages || [];
  const script = lessonContent.hearing?.script || "I think the new schedule will be okay.";
  const words = lessonContent.vocab?.words || [];

  const safeWords = words.length > 0 ? words.map(w => w.word).join(', ') : "important, crucial, essential, significant, major";
  const shortSnippet = passages.length > 0 ? passages[0].text.substring(0, 50) + "..." : "The development of artificial intelligence has...";

  let items = [];

  // [NEW] Check if the highly-curated AI SSOT homework exists on the lessonContent
  if (lessonContent.homework && lessonContent.homework.items) {
      items = lessonContent.homework.items;
  } else {
      // Static Fallback
      if (rankStr.includes('1') || rankStr.includes('2')) {
          items = [
              { type: 'reading', title: `[Reading] 다음 지문의 10문장을 분석하고 빈칸 7개, 순서 배열 3개, 요약 2줄을 작성하세요.\n내용: ${shortSnippet}` },
              { type: `listening`, title: `[Listening] 다음 대화문 기반 20문제를 풀고 딕테이션하세요.\n대화: ${script.substring(0, 60)}...` },
              { type: `vocab`, title: `[Vocab] 다음 단어 30개의 유의어(Synonyms)를 포함해 완벽히 암기하세요.\n단어: ${safeWords.substring(0, 100)}...` }
          ];
      } else if (rankStr.includes('3')) {
          items = [
              { type: 'reading', title: `[Reading] 다음 지문의 8문장을 나누어 해석하고, 빈칸 5개, 문장 재배열 2문제를 푸세요.\n내용: ${shortSnippet}` },
              { type: `listening`, title: `[Listening] 실전 모의 듣기 15문제를 연속해서 풀어보세요.\n대화: ${script.substring(0, 60)}...` },
              { type: `vocab`, title: `[Vocab] 수능 빈출 필수 단어 20개의 예문을 작성하며 복습하세요.\n단어: ${safeWords.substring(0, 80)}...` }
          ];
      } else {
          items = [
              { type: `reading`, title: `[Reading] 다음 본문 5문장을 직독직해하고, 기초 핵심 빈칸 3개를 채우세요.\n내용: ${shortSnippet}` },
              { type: `listening`, title: `[Listening] 기초 대화문 듣기 내용 일치 10문제를 풀어주세요.\n대화: ${script.substring(0, 60)}...` },
              { type: 'vocab', title: `[Vocab] 오늘 다룬 기초 단어 10개 철자를 쓰고 뜻을 연결하세요.\n단어: ${safeWords.substring(0, 50)}...` }
          ];
      }
  }

  const homeworkId = `eng_hw_${Date.now()}_${Math.random().toString(36).substring(2,7)}`;

  const homework = {
    homeworkId: homeworkId,
    studentId: lessonResult.studentId,
    teacherId: lessonResult.teacherId,
    subject: "english",
    round: lessonResult.round,
    assignedAt: Date.now(),
    status: "assigned",
    items
  };

  lessonResult.homework = homework;
  
  const dbStr = localStorage.getItem('mentos_eng_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  db.push(homework);
  localStorage.setItem('mentos_eng_homework_db', JSON.stringify(db));

  console.log('[generateEnglishHomework] Homework assigned:', homework);

  return homework;
}

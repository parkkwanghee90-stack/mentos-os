
export const loadLesson = async (teacher_id, lesson_no) => {
  try {
    const p = `/teachers/${teacher_id}/lesson_0${lesson_no}/`;
    const meta = await fetch(p + 'meta.json').then(r=>r.json());
    const vocab = await fetch(p + 'vocab.json').then(r=>r.json());
    const reading = await fetch(p + 'reading.txt').then(r=>r.text());
    return { meta, vocab, reading };
  } catch(e) {
    console.error("Lesson fetch error", e);
    return null;
  }
};

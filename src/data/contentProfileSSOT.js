// src/data/contentProfileSSOT.js
// Single Source of Truth for Content Profiles & Difficulty Mapping

export const LEVEL_RANK_MAP = {
  "고3-1등급": "highest",
  "고3-2등급": "high",
  "고3-3등급": "mid",
  "고3-4등급": "mid",
  "고2-1등급": "high",
  "고2-2등급": "high",
  "고2-3등급": "mid",
  "고1-1등급": "mid",
  "고1-2등급": "mid"
};

export const CONTENT_PROFILES = {
  gpa_1st_defense: {
    difficulty: "high",
    examType: "school",
    sentenceStyle: "complex",
    phases: {
      vocab: {
        wordLevel: "advanced",
        count: 20
      },
      reading: {
        length: "long",
        sentenceComplexity: "high",
        topic: "academic"
      },
      concept: {
        explanationStyle: "logic-based"
      },
      problem: {
        type: "inference",
        difficulty: "hard"
      }
    }
  },
  suneung_absolute: {
    difficulty: "highest",
    examType: "suneung",
    sentenceStyle: "complex",
    phases: {
      vocab: {
        wordLevel: "advanced",
        count: 30
      },
      reading: {
        length: "long",
        sentenceComplexity: "high",
        topic: "philosophy_and_science"
      },
      concept: {
        explanationStyle: "logic-based"
      },
      problem: {
        type: "inference",
        difficulty: "hardest"
      }
    }
  }
};

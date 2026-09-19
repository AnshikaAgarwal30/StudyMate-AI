const genai = require('@google/genai');

// ======================================================
// GEMINI SETUP
// ======================================================

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    'GEMINI_API_KEY is not set in environment variables. Please add it to backend/.env file.'
  );
}

const client = new genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const MODEL = 'gemini-3.6-flash';

// ======================================================
// HELPER - CHECK QUOTA ERROR
// ======================================================

const isQuotaError = (error) => {
  const message = error?.message?.toLowerCase() || '';

  return (
    error?.status === 429 ||
    error?.code === 429 ||
    error?.status === 503 ||
    error?.code === 503 ||
    message.includes('resource_exhausted') ||
    message.includes('quota') ||
    message.includes('quota exceeded') ||
    message.includes('unavailable') ||
    message.includes('high demand') ||
    message.includes('temporarily unavailable')
  );
};

// ======================================================
// HELPER - CLEAN STUDY TEXT
// ======================================================

const cleanStudyText = (text = '') => {
  return text
    .replace(/\r/g, ' ')
    .replace(/\n+/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
};

// ======================================================
// HELPER - REMOVE REPEATED WORDS / PHRASES
// ======================================================

const removeRepeatedContent = (text) => {
  if (!text) return '';

  const words = text.split(/\s+/);
  const result = [];

  for (let i = 0; i < words.length; i++) {
    const current = words[i];

    // Avoid immediate repeated words
    if (
      result.length > 0 &&
      result[result.length - 1].toLowerCase() === current.toLowerCase()
    ) {
      continue;
    }

    result.push(current);
  }

  return result.join(' ');
};

// ======================================================
// HELPER - GET UNIQUE SENTENCES
// ======================================================

const getUniqueSentences = (text) => {
  const cleaned = removeRepeatedContent(
    cleanStudyText(text).replace(/\n/g, ' ')
  );

  return [
    ...new Set(
      cleaned
        .split(/(?<=[.!?])\s+/)
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length >= 20)
    )
  ];
};

// ======================================================
// FALLBACK - SUMMARY
// ======================================================

const generateFallbackSummary = (text) => {
  const cleanedText = cleanStudyText(text);
  const sentences = getUniqueSentences(cleanedText);

  const words = cleanedText
    .replace(/\n/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  // If material is very small
  if (words.length < 5) {
    return `# 🧠 Study Material

## 💡 In One Line

The uploaded material contains limited content for study and revision.

## 🔑 Key Concepts

- Review the available material carefully.
- Focus on important terms and definitions.

## 📚 Study Notes

${cleanedText || 'No readable study content was found.'}

## 🎯 Exam Focus

- ⭐ Understand the main topic.
- ⭐ Remember important terms and definitions.
- ⭐ Revise the material before the exam.

## ⚡ Quick Revision

- Review the uploaded material.
- Identify important concepts.
- Revise key definitions.
`;
  }

  // Select useful unique sentences
  const usefulSentences = sentences.slice(0, 10);

  // Extract possible important lines
  const definitionSentences = sentences.filter(sentence =>
    /\b(is|are|means|refers to|defined as|known as|called)\b/i.test(sentence)
  );

  // Extract formulas if present
  const formulaLines = cleanedText
    .split(/\n/)
    .map(line => line.trim())
    .filter(line =>
      /[=+\-*/^]|formula|equation/i.test(line)
    )
    .slice(0, 5);

  // Create concept bullets
  const keyConcepts =
    usefulSentences.length > 0
      ? usefulSentences.slice(0, 5)
      : [cleanedText.substring(0, 200)];

  // Create readable study notes
  const studyNotes =
    usefulSentences.length > 0
      ? usefulSentences.slice(0, 8)
      : [cleanedText.substring(0, 500)];

  let summary = `# 🧠 Study Material

## 💡 In One Line

This study material covers important concepts that can be used for learning, exam preparation and quick revision.

## 🔑 Key Concepts

`;

  keyConcepts.forEach(sentence => {
    summary += `- ${sentence}\n`;
  });

  summary += `

## 🌍 Real-Life Example

Try connecting the concepts in this material with a practical example from engineering, technology or your daily life. This can make the topic easier to remember.

## 📌 Important Definitions

`;

  if (definitionSentences.length > 0) {
    definitionSentences.slice(0, 5).forEach(sentence => {
      summary += `- ${sentence}\n`;
    });
  } else {
    summary += `- Review the definitions and technical terms present in the uploaded material.\n`;
  }

  if (formulaLines.length > 0) {
    summary += `

## 🧮 Important Formulas / Expressions

`;

    formulaLines.forEach(line => {
      summary += `- ${line}\n`;
    });
  }

  summary += `

## 📚 Study Notes

`;

  studyNotes.forEach(sentence => {
    summary += `- ${sentence}\n`;
  });

  summary += `

## 🎯 Exam Focus

- ⭐ Understand the main concepts instead of only memorizing them.
- ⭐ Remember important definitions and technical terms.
- ⭐ Pay attention to formulas, processes and examples if present.
- ⭐ Revise the key points before attempting MCQs.
- ⭐ Focus on concepts that appear important or repeatedly in the material.

## 🧠 Easy Memory Trick

Break the topic into small concepts and remember each concept using a simple keyword or real-life example.

## ⚠️ Common Confusions / Mistakes

- Do not memorize definitions without understanding their meaning.
- Do not ignore technical terms or important formulas.
- Avoid confusing similar concepts; compare their main differences during revision.

## ⚡ Quick Revision

`;

  usefulSentences.slice(0, 7).forEach(sentence => {
    summary += `- ${sentence}\n`;
  });

  summary += `

> ℹ️ Gemini quota is temporarily unavailable. This fallback summary was generated directly from your uploaded study material. Real Gemini summaries will be used automatically when the quota becomes available.
`;

  return summary;
};

// ======================================================
// FALLBACK - FLASHCARDS
// ======================================================

const generateFallbackFlashcards = (text, count, difficulty) => {
  const sentences = getUniqueSentences(text);

  const usableSentences =
    sentences.length > 0
      ? sentences
      : [
          'Review the important concepts from the uploaded study material.'
        ];

  const flashcards = [];

  for (let i = 0; i < count; i++) {
    const sentence = usableSentences[i % usableSentences.length];

    flashcards.push({
      question: `What important concept can be learned from this point: "${sentence.substring(
        0,
        100
      )}${sentence.length > 100 ? '...' : ''}"?`,

      answer: sentence,

      topic: 'Study Material',

      difficulty: difficulty
    });
  }

  return flashcards;
};

// ======================================================
// FALLBACK - QUIZ
// ======================================================

const generateFallbackQuiz = (text, count, difficulty) => {
  const sentences = getUniqueSentences(text);

  const usableSentences =
    sentences.length > 0
      ? sentences
      : [
          'The uploaded study material contains important concepts for examination.'
        ];

  const questions = [];

  for (let i = 0; i < count; i++) {
    const sentence = usableSentences[i % usableSentences.length];

    const correctAnswer =
      sentence.length > 100
        ? sentence.substring(0, 100) + '...'
        : sentence;

    questions.push({
      question: `Which statement is supported by the study material?`,

      options: [
        correctAnswer,
        'The material contains no relevant information.',
        'The statement is unrelated to the topic.',
        'None of the above.'
      ],

      correctAnswer: correctAnswer,

      explanation:
        'This option is based directly on the uploaded study material.',

      topic: 'Study Material',

      difficulty: difficulty
    });
  }

  return questions;
};

// ======================================================
// FALLBACK - REVISION
// ======================================================

const generateFallbackRevisionExplanation = (topic, context) => {
  const sentences = getUniqueSentences(context);

  const relevantPoints = sentences.slice(0, 6);

  return `## ${topic}

### 📌 Quick Explanation

${
  relevantPoints.length > 0
    ? relevantPoints.map(sentence => `- ${sentence}`).join('\n')
    : `Revise the main concepts related to ${topic} from your study material.`
}

### 🧠 Remember

- Focus on the definition and main concept.
- Understand how the concept works.
- Revise important examples and applications.
- Practice related questions for better retention.

> ℹ️ Gemini quota is temporarily unavailable, so this is a fallback revision explanation generated from your study material.
`;
};

// ======================================================
// SUMMARY
// ======================================================

const generateSummary = async (text) => {
  try {
    const prompt = `
You are StudyMate AI, a friendly and engaging study tutor.

Your job is to transform the following study material into a summary that makes a student WANT to study it.

IMPORTANT:

- Do NOT write a boring textbook-style summary.
- Do NOT make everything long paragraphs.
- Keep explanations simple and student-friendly.
- Use short sections, bullet points, examples and memory tricks.
- Explain difficult concepts in easy language.
- Focus on understanding + exam preparation.
- Avoid unnecessary information.
- Do not repeat the same point.
- Use emojis sparingly to make sections visually engaging.
- Make the summary useful for both learning and quick revision.

Use this EXACT structure:

# 🧠 [Main Topic]

## 💡 In One Line

Explain the entire topic in 1-2 very simple sentences.

## 🔑 Key Concepts

Give the most important concepts as short bullet points.

## 🌍 Real-Life Example

Give a simple real-world example or analogy wherever possible.

## 📌 Important Definitions

List important definitions in simple exam-friendly language.

## 🎯 Exam Focus

List the most important points a student should remember for exams.

Use ⭐ for especially important points.

## 🧠 Easy Memory Trick

Give a mnemonic, shortcut, analogy, or simple way to remember the topic whenever possible.

## ⚠️ Common Confusions / Mistakes

Mention common mistakes or concepts students usually confuse.

## ⚡ Quick Revision

End with 5-10 very short bullet points containing ONLY the most important things to remember.

RULES:

- Use Markdown headings and bullet points.
- Keep paragraphs short.
- Prefer bullets over paragraphs.
- Use simple English.
- Explain technical terms when first introduced.
- Do not invent facts that are not supported by the study material.
- If the material contains formulas, include them clearly.
- If the material contains code, explain the important code concepts simply.
- If the material contains processes/steps, present them as numbered steps.
- If the material contains comparisons, use a simple comparison format.
- Preserve important technical terminology.
- Make it feel like notes prepared by a smart senior for a junior.

STUDY MATERIAL:

${text}
`;

    const result = await client.models.generateContent({
      model: MODEL,
      contents: prompt
    });

    return result.text;
  } catch (error) {
    console.error('Gemini API Error - Summary:', error);

    if (isQuotaError(error)) {
      console.log('Gemini quota exceeded. Using fallback summary.');
      return generateFallbackSummary(text);
    }

    throw new Error(
      'Failed to generate summary: ' + error.message
    );
  }
};

// ======================================================
// FLASHCARDS
// ======================================================

const generateFlashcards = async (text, count, difficulty) => {
  try {
    const prompt = `
You are an expert exam-preparation assistant.

Generate exactly ${count} active-recall flashcards from the following study material.

Difficulty: ${difficulty}

IMPORTANT:

Return ONLY a valid JSON array.

The JSON must follow this exact structure:

[
  {
    "question": "question text",
    "answer": "answer text",
    "topic": "topic name",
    "difficulty": "${difficulty}"
  }
]

Requirements:

- Generate exactly ${count} flashcards
- Questions should test understanding, not only memorization
- Answers should be concise but complete
- Identify the specific topic for each flashcard
- Difficulty must be ${difficulty}
- Do not include markdown
- Do not include code fences
- Do not include any text before or after the JSON
- Return valid JSON only

Study material:

${text}
`;

    const result = await client.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const textResponse = result.text;

    console.log('Flashcard AI Response:', textResponse);

    let flashcards;

    try {
      flashcards = JSON.parse(textResponse);
    } catch (parseError) {
      console.log(
        'Direct JSON parsing failed. Trying JSON extraction...'
      );

      const jsonMatch = textResponse.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        throw new Error('AI did not return valid JSON');
      }

      flashcards = JSON.parse(jsonMatch[0]);
    }

    if (!Array.isArray(flashcards)) {
      throw new Error('AI did not return an array');
    }

    flashcards.forEach((card, index) => {
      if (
        !card.question ||
        !card.answer ||
        !card.topic
      ) {
        throw new Error(
          `Invalid flashcard structure at index ${index}`
        );
      }

      card.difficulty = difficulty;
    });

    return flashcards;
  } catch (error) {
    console.error(
      'Gemini API Error - Flashcards:',
      error
    );

    if (isQuotaError(error)) {
      console.log(
        'Gemini quota exceeded. Using fallback flashcards.'
      );

      return generateFallbackFlashcards(
        text,
        count,
        difficulty
      );
    }

    throw new Error(
      'Failed to generate flashcards: ' + error.message
    );
  }
};

// ======================================================
// QUIZ
// ======================================================

const generateQuiz = async (text, count, difficulty) => {
  try {
    const prompt = `
You are an expert exam-preparation assistant.

Generate exactly ${count} multiple-choice questions (MCQs) from the following study material.

Difficulty: ${difficulty}

IMPORTANT:

Return ONLY a valid JSON array.

The JSON must follow this exact structure:

[
  {
    "question": "question text",
    "options": [
      "option A",
      "option B",
      "option C",
      "option D"
    ],
    "correctAnswer": "exact text of correct option",
    "explanation": "explanation of why this answer is correct",
    "topic": "topic name",
    "difficulty": "${difficulty}"
  }
]

Requirements:

- Generate exactly ${count} questions
- Each question must have exactly 4 options
- Only ONE option must be correct
- correctAnswer must exactly match one of the four options
- Distractors should be plausible but incorrect
- Include a clear explanation
- Identify the topic
- Difficulty must be ${difficulty}
- Do not include markdown
- Do not include code fences
- Do not include any text before or after the JSON
- Return valid JSON only

Study material:

${text}
`;

    const result = await client.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const textResponse = result.text;

    console.log('Quiz AI Response:', textResponse);

    let questions;

    try {
      questions = JSON.parse(textResponse);
    } catch (parseError) {
      console.log(
        'Direct JSON parsing failed. Trying JSON extraction...'
      );

      const jsonMatch = textResponse.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        throw new Error('AI did not return valid JSON');
      }

      questions = JSON.parse(jsonMatch[0]);
    }

    if (!Array.isArray(questions)) {
      throw new Error('AI did not return an array');
    }

    questions.forEach((q, index) => {
      if (
        !q.question ||
        !q.options ||
        !q.correctAnswer ||
        !q.explanation ||
        !q.topic
      ) {
        throw new Error(
          `Invalid question structure at index ${index}`
        );
      }

      if (
        !Array.isArray(q.options) ||
        q.options.length !== 4
      ) {
        throw new Error(
          `Question ${index + 1} must have exactly 4 options`
        );
      }

      if (!q.options.includes(q.correctAnswer)) {
        throw new Error(
          `Correct answer for question ${
            index + 1
          } does not match any option`
        );
      }

      q.difficulty = difficulty;
    });

    return questions;
  } catch (error) {
    console.error(
      'Gemini API Error - Quiz:',
      error
    );

    if (isQuotaError(error)) {
      console.log(
        'Gemini quota exceeded. Using fallback quiz.'
      );

      return generateFallbackQuiz(
        text,
        count,
        difficulty
      );
    }

    throw new Error(
      'Failed to generate quiz: ' + error.message
    );
  }
};

// ======================================================
// REVISION EXPLANATION
// ======================================================

const generateRevisionExplanation = async (
  topic,
  context
) => {
  try {
    const prompt = `
You are an expert tutor.

Provide a concise but comprehensive explanation of the topic:

"${topic}"

Based on this context:

${context}

The explanation should:

- Be 2-3 paragraphs maximum
- Focus on key concepts
- Be easy to understand
- Help with quick revision before exams
- Use simple academic language

Provide only the explanation.
`;

    const result = await client.models.generateContent({
      model: MODEL,
      contents: prompt
    });

    return result.text;
  } catch (error) {
    console.error(
      'Gemini API Error - Revision:',
      error
    );

    if (isQuotaError(error)) {
      console.log(
        'Gemini quota exceeded. Using fallback revision explanation.'
      );

      return generateFallbackRevisionExplanation(
        topic,
        context
      );
    }

    throw new Error(
      'Failed to generate revision explanation: ' +
        error.message
    );
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  generateSummary,
  generateFlashcards,
  generateQuiz,
  generateRevisionExplanation
};
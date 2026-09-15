const fs = require('fs');
const pdfParse = require('pdf-parse');

const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
};

const extractTextFromTXT = async (filePath) => {
  try {
    const text = fs.readFileSync(filePath, 'utf-8');
    return text;
  } catch (error) {
    throw new Error('Failed to read TXT file: ' + error.message);
  }
};

const cleanText = (text) => {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
};

const chunkText = (text, maxTokens = 3000) => {
  const chunks = [];
  const sentences = text.split(/[.!?]+/);
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxTokens) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    } else {
      currentChunk += sentence + '. ';
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
};

module.exports = {
  extractTextFromPDF,
  extractTextFromTXT,
  cleanText,
  chunkText
};

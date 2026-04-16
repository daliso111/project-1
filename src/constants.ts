export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Adaptive';
export type PracticeMode = 'Time Attack' | 'Word Sprint' | 'Code' | 'Custom';
export type TimeLimit = 30 | 60 | 120;

export interface SessionResult {
  id: string;
  wpm: number;
  accuracy: number;
  errors: number;
  timeTaken: number;
  mode: PracticeMode;
  difficulty: Difficulty;
  date: string;
  missedKeys: Record<string, number>;
}

export const QUOTES = {
  Beginner: [
    "The sun is hot.",
    "I like to code.",
    "A fast cat runs.",
    "The blue sky is big.",
    "I eat a red apple.",
    "Work hard play hard.",
    "Life is a gift.",
    "Stay calm and type.",
    "Music is cool.",
    "Books are great."
  ],
  Intermediate: [
    "The quick brown fox jumps over the lazy dog.",
    "Practice makes perfect when it comes to typing speed.",
    "Happiness is not something ready made. It comes from your own actions.",
    "Focus on the process, not the outcome of your typing session.",
    "Accuracy is more important than speed in the long run.",
    "Developing muscle memory requires consistent practice every day.",
    "Stay relaxed and keep your fingers close to the home row keys.",
    "A journey of a thousand miles begins with a single step."
  ],
  Advanced: [
    "The intricate complexity of the human brain allows for lightning-fast cognitive processing and linguistic dexterity.",
    "Quantum mechanics reveals a universe where particles can exist in multiple states simultaneously until observed.",
    "Symphonic compositions often juxtapose discordant melodies with harmonious resolutions to evoke profound emotional responses.",
    "The ephemeral nature of digital communication necessitates a robust framework for long-term archival and historical preservation.",
    "Architectural masterpieces serve as a testament to the intersection of mathematical precision and aesthetic intuition.",
    "Philosophical dialogues explore the fundamental nature of existence, reality, and the boundaries of human knowledge."
  ]
};

export const COMMON_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", 
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", 
  "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", 
  "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", 
  "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", 
  "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
];

const queries = [
  'How do I identify a ghost type?',
  'What are the different evidence types?',
  'How do I use the Spirit Box?',
  'What does freezing temperatures mean?',
  'How do I find fingerprints?',
  'What items are essential for beginners?',
  'How do I survive a ghost hunt?',
  'What are the best strategies for solo play?',
  'How do I set up a video camera?',
  'What does EMF Level 5 indicate?',
  'How can I get more money in the game?',
  'What is the purpose of the Crucifix?',
  'How do I use the Ouija Board safely?',
  'What are the best hiding spots?',
  'How do I cleanse an area with smudge sticks?',
  'How do I use the UV Light?',
  'What does the Ghost Writing Book do?',
  'How do I use the Parabolic Microphone?',
  'What are the ghost activity levels?',
  'How do I determine ghost behavior?',
  'What are the differences between ghost types?',
  'How do I use the motion sensor?',
  'What is the purpose of the salt?',
  'How do I use the smudge sticks effectively?',
  'What are the different maps in the game?',
  'How do I find the ghost room?',
  'What is sanity and how do I maintain it?',
  'How do I use the head-mounted camera?',
  'What are the objectives in each mission?',
  'How do I complete a perfect investigation?',
];

export const getRandomQueries = (k: number): string[] => {
  if (k > queries.length) {
    throw new Error('k cannot be larger than the number of available queries');
  }

  const result = [...queries];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.slice(0, k);
};

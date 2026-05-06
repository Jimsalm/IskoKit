import {
  flashcardDifficultyLabels,
  flashcardTypeLabels,
  type GenerateFlashcardsRequestSchema,
} from "@/features/flashcards/schemas"

export function getFlashcardInstructions({
  cardType,
  difficulty,
  count,
}: Pick<
  GenerateFlashcardsRequestSchema,
  "cardType" | "difficulty" | "count"
>) {
  return `You are an academic study assistant.

Create study flashcards from the material.

Flashcard type:
${flashcardTypeLabels[cardType]}

Difficulty:
${flashcardDifficultyLabels[difficulty]}

Number of flashcards:
${count}

Rules:
- Make the questions clear and useful for studying.
- Keep answers concise but complete.
- Do not add facts that are not in the material.
- Avoid duplicate flashcards.
- Prioritize important concepts, terms, formulas, and exam-worthy details.
- Return exactly ${count} flashcards when the material supports it.
- Use the requested difficulty and flashcard type for every flashcard.`
}

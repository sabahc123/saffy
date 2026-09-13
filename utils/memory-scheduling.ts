export function isMemoryDue(
  due: Date | string,
  now = new Date()
) {
  return new Date(due).getTime() <= now.getTime();
}

export function getDueMemories<T extends { fsrsCard: { due: Date | string } }>(
  memories: T[],
  now = new Date()
) {
  return memories.filter((memory) =>
    isMemoryDue(memory.fsrsCard.due, now)
  );
}
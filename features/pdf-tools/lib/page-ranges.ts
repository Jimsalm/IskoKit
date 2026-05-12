function parsePageToken(token: string, totalPages: number) {
  if (token.toLowerCase() === "last") {
    return totalPages
  }

  return Number(token)
}

export function parsePageRanges(input: string | string[], totalPages: number) {
  const parts = Array.isArray(input)
    ? input.map((part) => part.trim())
    : input
        .trim()
        .split(",")
        .map((part) => part.trim())

  if (!parts.some(Boolean)) {
    throw new Error("Enter the pages you want to extract.")
  }

  const selectedPages: number[] = []
  const seenPages = new Set<number>()

  for (const part of parts) {
    if (!part) {
      throw new Error("Complete or remove empty page ranges.")
    }

    const rangeMatch = /^(\d+|last)(?:\s*-\s*(\d+|last))?$/i.exec(part)

    if (!rangeMatch) {
      throw new Error("Use page ranges like 1-3, 5, 9-10, or 1-last.")
    }

    const start = parsePageToken(rangeMatch[1], totalPages)
    const end = rangeMatch[2]
      ? parsePageToken(rangeMatch[2], totalPages)
      : start

    if (start < 1 || end < 1 || start > end) {
      throw new Error("Page ranges must start with a smaller page number.")
    }

    if (end > totalPages) {
      throw new Error(`This PDF only has ${totalPages} pages.`)
    }

    for (let page = start; page <= end; page += 1) {
      if (!seenPages.has(page)) {
        selectedPages.push(page - 1)
        seenPages.add(page)
      }
    }
  }

  return selectedPages
}

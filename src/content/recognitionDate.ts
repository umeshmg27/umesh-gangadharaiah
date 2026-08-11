import type { Recognition } from "./models";

type RecognitionDate = {
  readonly dateTime: string;
  readonly label: string;
  readonly timestamp: number;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function recognitionDateFromId(id: string): RecognitionDate {
  const dateSuffix = id.match(/-(\d{2})(\d{2})(\d{2})$/);

  if (!dateSuffix) throw new Error(`Recognition id has no DDMMYY date: ${id}`);

  const [, dayText, monthText, yearText] = dateSuffix;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = 2000 + Number(yearText);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsedDate = new Date(timestamp);

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    throw new Error(`Recognition id has an invalid DDMMYY date: ${id}`);
  }

  const monthName = monthNames[month - 1];

  if (!monthName)
    throw new Error(`Recognition id has an invalid month: ${id}`);

  return {
    dateTime: `${year}-${monthText}-${dayText}`,
    label: `${day} ${monthName} ${year}`,
    timestamp,
  };
}

export function sortRecognitionsNewestFirst(
  records: readonly Recognition[],
): readonly Recognition[] {
  return records
    .map((recognition, sourceIndex) => ({
      date: recognitionDateFromId(recognition.id).timestamp,
      recognition,
      sourceIndex,
    }))
    .sort(
      (left, right) =>
        right.date - left.date || left.sourceIndex - right.sourceIndex,
    )
    .map(({ recognition }) => recognition);
}

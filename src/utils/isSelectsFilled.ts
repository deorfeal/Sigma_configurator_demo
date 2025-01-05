export function isSelectsFilled(selectValues: Record<string, string>): boolean {
    if (!selectValues) return false; 
    return Object.values(selectValues).every((value) => value !== null && value !== undefined && value !== '' && value !== Object.keys(selectValues)[0]);
}

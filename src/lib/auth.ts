export function isValidPasscode(passcode: string): boolean {
  return passcode === process.env.EDIT_PASSCODE;
}

export function getPostLoginPath(
  onboardingCompleted: boolean,
  incompletePath: string,
) {
  return onboardingCompleted ? '/' : incompletePath
}

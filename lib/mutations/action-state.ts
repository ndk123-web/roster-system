export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Record<string, string>;
};

export const initialActionState: ActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

export function successState(message: string): ActionState {
  return { status: "success", message, fieldErrors: {} };
}

export function errorState(
  message: string,
  fieldErrors: Record<string, string> = {},
): ActionState {
  return { status: "error", message, fieldErrors };
}

export function successStateWithRevalidation(
  message: string,
  revalidationError: string | null,
): ActionState {
  return successState(
    revalidationError ? `${message} Roster revalidation warning: ${revalidationError}` : message,
  );
}

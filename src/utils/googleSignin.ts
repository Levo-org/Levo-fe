export interface GoogleSigninModule {
  GoogleSignin: {
    configure: (config: { webClientId: string; iosClientId?: string }) => void;
    hasPlayServices: (options?: { showPlayServicesUpdateDialog?: boolean }) => Promise<boolean>;
    signIn: () => Promise<unknown>;
  };
  isErrorWithCode?: (error: unknown) => error is { code: string };
  isSuccessResponse?: (response: unknown) => response is { data: { idToken?: string | null } };
  statusCodes?: {
    IN_PROGRESS?: string;
    PLAY_SERVICES_NOT_AVAILABLE?: string;
  };
}

export const loadGoogleSigninModule = (): GoogleSigninModule | null => {
  try {
    return require('@react-native-google-signin/google-signin') as GoogleSigninModule;
  } catch (error) {
    console.warn('[GoogleSignin] Native module is unavailable in this runtime:', error);
    return null;
  }
};

export const extractGoogleIdToken = (signInResponse: unknown): string | undefined => {
  if (typeof signInResponse !== 'object' || signInResponse === null) {
    return undefined;
  }

  if ('data' in signInResponse) {
    const data = (signInResponse as { data?: unknown }).data;
    if (typeof data === 'object' && data !== null && 'idToken' in data) {
      const idToken = (data as { idToken?: unknown }).idToken;
      return typeof idToken === 'string' && idToken.length > 0 ? idToken : undefined;
    }
  }

  if ('idToken' in signInResponse) {
    const idToken = (signInResponse as { idToken?: unknown }).idToken;
    return typeof idToken === 'string' && idToken.length > 0 ? idToken : undefined;
  }

  return undefined;
};

import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  h1: { fontSize: 30, fontWeight: '700', lineHeight: 36 },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '700', lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyBold: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  small: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  smallBold: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  captionBold: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '700', lineHeight: 24 },
  buttonSmall: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
};

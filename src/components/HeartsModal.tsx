import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useHeartStore } from '../stores/heartStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface HeartsModalProps {
  visible: boolean;
  onClose: () => void;
  onWatchAd?: () => void;
  onBuyWithCoins?: () => void;
  onGoPremium?: () => void;
}

export default function HeartsModal({
  visible,
  onClose,
  onWatchAd,
  onBuyWithCoins,
  onGoPremium,
}: HeartsModalProps) {
  const { currentHearts, maxHearts, timeUntilNextRefill } = useHeartStore();

  const hearts = Array.from({ length: maxHearts }, (_, i) => i < currentHearts);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Feather name="x" size={24} color={colors.text.secondary} />
          </TouchableOpacity>

          <Text style={styles.title}>하트가 부족해요!</Text>

          <View style={styles.heartsRow}>
            {hearts.map((filled, idx) => (
              <Feather
                key={idx}
                name="heart"
                size={32}
                color={filled ? colors.status.error : colors.background.tertiary}
              />
            ))}
          </View>

          {timeUntilNextRefill && (
            <Text style={styles.timerText}>
              다음 하트까지: {timeUntilNextRefill}
            </Text>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.adButton]}
              onPress={onWatchAd}
              activeOpacity={0.8}
            >
              <Feather name="play-circle" size={20} color="#FFFFFF" />
              <Text style={styles.adButtonText}>광고 보고 회복</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.coinButton]}
              onPress={onBuyWithCoins}
              activeOpacity={0.8}
            >
              <Text style={styles.coinEmoji}>💎</Text>
              <Text style={styles.coinButtonText}>350 코인으로 회복</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.premiumButton]}
              onPress={onGoPremium}
              activeOpacity={0.8}
            >
              <Feather name="star" size={20} color={colors.accent.gold} />
              <Text style={styles.premiumButtonText}>프리미엄 무제한 하트</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    backgroundColor: colors.background.primary,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: 8,
    marginBottom: 16,
  },
  heartsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  timerText: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 20,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  adButton: {
    backgroundColor: colors.primary.main,
  },
  adButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  coinButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.accent.gold,
  },
  coinEmoji: {
    fontSize: 16,
  },
  coinButtonText: {
    ...typography.button,
    color: colors.accent.gold,
  },
  premiumButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.accent.purple,
  },
  premiumButtonText: {
    ...typography.button,
    color: colors.accent.purple,
  },
});

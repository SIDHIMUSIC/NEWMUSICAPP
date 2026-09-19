import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Pause, Play } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { usePlayer, useProgress } from '../../hooks/usePlayer';

export default function NowBar() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const routeName = useNavigationState((state) => state.routes[state.index]?.name);
  const { currentTrack, isPlaying, isLoading, togglePlayPause } = usePlayer();
  const { position, duration } = useProgress();
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    if (!isPlaying) {
      pulse.stopAnimation();
      pulse.setValue(0.45);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isPlaying, pulse]);

  if (!currentTrack || routeName === 'NowPlaying') return null;

  const progress = duration > 0 ? Math.min(1, Math.max(0, position / duration)) : 0;

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: Math.max(insets.top + 6, 10) }]}>
      <TouchableOpacity
        activeOpacity={0.92}
        style={styles.pill}
        onPress={() => navigation.navigate('NowPlaying' as never)}
      >
        <Image source={{ uri: currentTrack.albumImageUrl }} style={styles.artwork} />

        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist.name}</Text>
        </View>

        <View style={styles.visualizer}>
          {[0, 1, 2].map((bar) => (
            <Animated.View
              key={bar}
              style={[
                styles.bar,
                {
                  opacity: isPlaying ? pulse : 0.45,
                  transform: [{ scaleY: isPlaying ? pulse : 0.55 }],
                  height: 7 + bar * 4,
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.playButton}
          onPress={(event) => {
            event.stopPropagation();
            togglePlayPause();
          }}
        >
          {isLoading ? (
            <View style={styles.loadingDot} />
          ) : isPlaying ? (
            <Pause color={COLORS.text.primary} size={15} fill={COLORS.text.primary} />
          ) : (
            <Play color={COLORS.text.primary} size={15} fill={COLORS.text.primary} />
          )}
        </TouchableOpacity>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 30,
    pointerEvents: 'box-none',
  },
  pill: {
    width: '88%',
    maxWidth: 390,
    minHeight: 56,
    borderRadius: 30,
    paddingHorizontal: 7,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101414',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
  },
  artwork: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surfaceLight,
  },
  textBlock: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
  },
  title: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.text.primary,
  },
  artist: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  visualizer: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginHorizontal: 5,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: COLORS.accent.green,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  loadingDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.accent.green,
  },
  progressTrack: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 2,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent.green,
  },
});
